import Mux from "@mux/mux-node";
import fs from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";

let muxClient: Mux | null = null;

// Created lazily so VideoPlayer.astro can read the manifest without Mux credentials
function mux() {
  if (!muxClient) {
    const tokenId = process.env.MUX_TOKEN_ID;
    const tokenSecret = process.env.MUX_TOKEN_SECRET;
    if (!tokenId || !tokenSecret)
      throw new Error("Missing env vars: MUX_TOKEN_ID / MUX_TOKEN_SECRET");
    muxClient = new Mux({ tokenId, tokenSecret });
  }
  return muxClient;
}

const VIDEO_EXTS = new Set([".mp4", ".mov", ".m4v", ".mkv", ".webm"]);

export function isVideoFile(absPath: string) {
  return VIDEO_EXTS.has(path.extname(absPath).toLowerCase());
}

const UPLOAD_ROOT = path.resolve("uploads");
const CACHE_DIR = path.resolve("_cache");
const MANIFEST_PATH = path.join(CACHE_DIR, "mux-manifest.json");

type MuxManifestEntry = {
  localRelPath: string; // uploads/2026/foo.mp4
  sha1: string;
  assetId: string;
  playbackId: string;
  uploadedAt: string;
};

type MuxManifest = Record<string, MuxManifestEntry>; // key = localRelPath

function toPosix(p: string) {
  return p.split(path.sep).join("/");
}

/**
 * Normalize any path-ish input into the manifest key format "uploads/...".
 * Also fixes legacy keys like "../content/img/uploads/2023/foo.mp4".
 */
export function toManifestKey(input: string): string | null {
  const posix = toPosix(decodeURIComponent(input.trim()));
  const idx = posix.indexOf("uploads/");
  return idx === -1 ? null : posix.slice(idx);
}

async function readManifest(): Promise<MuxManifest> {
  let raw: MuxManifest;
  try {
    raw = JSON.parse(await fs.readFile(MANIFEST_PATH, "utf8"));
  } catch {
    return {};
  }

  // Migrate legacy keys in memory; they're persisted on the next write
  const out: MuxManifest = {};
  for (const [k, entry] of Object.entries(raw)) {
    const key = toManifestKey(k) ?? k;
    out[key] = { ...entry, localRelPath: key };
  }
  return out;
}

async function writeManifest(m: MuxManifest) {
  await fs.mkdir(CACHE_DIR, { recursive: true });
  const sorted = Object.fromEntries(
    Object.entries(m).sort(([a], [b]) => a.localeCompare(b)),
  );
  await fs.writeFile(
    MANIFEST_PATH,
    JSON.stringify(sorted, null, 2) + "\n",
    "utf8",
  );
}

async function sha1File(absPath: string) {
  const buf = await fs.readFile(absPath);
  return crypto.createHash("sha1").update(buf).digest("hex");
}

/**
 * Assets uploaded by this script are tagged with passthrough = "sha1:<hash>",
 * so even if the manifest is lost we can find them on Mux instead of re-uploading.
 */
let remoteBySha1: Map<string, { assetId: string; playbackId: string }> | null =
  null;

async function findRemoteAssetBySha1(sha1: string) {
  if (!remoteBySha1) {
    remoteBySha1 = new Map();
    for await (const asset of mux().video.assets.list({ limit: 100 })) {
      const m = asset.passthrough?.match(/^sha1:([0-9a-f]{40})$/);
      const playbackId = asset.playback_ids?.find(
        (p) => p.policy === "public",
      )?.id;
      if (m && playbackId && asset.status !== "errored") {
        remoteBySha1.set(m[1], { assetId: asset.id, playbackId });
      }
    }
  }
  return remoteBySha1.get(sha1) ?? null;
}

async function createDirectUpload(sha1: string) {
  return mux().video.uploads.create({
    new_asset_settings: {
      playback_policy: ["public"],
      video_quality: "basic", // cheapest tier: free encoding, lower storage cost
      passthrough: `sha1:${sha1}`,
    },
    cors_origin: "https://chisenires.design", // satisfies SDK types; harmless for Node uploads
  });
}

async function putFileToSignedUrl(uploadUrl: string, absPath: string) {
  const file = await fs.readFile(absPath);
  const res = await fetch(uploadUrl, {
    method: "PUT",
    body: new Uint8Array(file),
    headers: { "Content-Type": "application/octet-stream" },
  });
  if (!res.ok)
    throw new Error(`Mux upload failed: ${res.status} ${res.statusText}`);
}

async function waitForAsset(uploadId: string) {
  for (let i = 0; i < 120; i++) {
    const u = await mux().video.uploads.retrieve(uploadId);
    if (u.asset_id) {
      const asset = await mux().video.assets.retrieve(u.asset_id);
      const playbackId = asset.playback_ids?.[0]?.id;
      if (!playbackId)
        throw new Error("Mux asset created but no playback id found.");
      return { assetId: u.asset_id, playbackId };
    }
    if (u.status === "errored" || u.status === "cancelled")
      throw new Error(`Mux upload ${u.status}: ${JSON.stringify(u.error)}`);
    await new Promise((r) => setTimeout(r, 2000));
  }
  throw new Error("Timed out waiting for Mux asset creation.");
}

export type MuxResult = {
  localRelPath: string;
  assetId?: string;
  playbackId?: string;
  status: "cached" | "reused" | "uploaded" | "would-upload";
};

/**
 * Upload a video only if no identical file (same sha1) is already known,
 * either in the local manifest or tagged on Mux. Never uploads the same bytes twice.
 */
export async function muxUploadIfNeeded(
  absPath: string,
  { dryRun = false } = {},
): Promise<MuxResult | null> {
  if (!isVideoFile(absPath)) return null;

  const localRelPath = toPosix(
    path.join("uploads", path.relative(UPLOAD_ROOT, absPath)),
  );
  const sha1 = await sha1File(absPath);
  const manifest = await readManifest();

  // 1) Same path, same content
  const existing = manifest[localRelPath];
  if (existing?.sha1 === sha1) {
    return { ...existing, localRelPath, status: "cached" };
  }

  // 2) Same content under another path (renamed/copied file) or already on Mux
  const sameBytes =
    Object.values(manifest).find((e) => e.sha1 === sha1) ??
    (await findRemoteAssetBySha1(sha1));

  if (sameBytes) {
    if (!dryRun) {
      manifest[localRelPath] = {
        localRelPath,
        sha1,
        assetId: sameBytes.assetId,
        playbackId: sameBytes.playbackId,
        uploadedAt: new Date().toISOString(),
      };
      await writeManifest(manifest);
    }
    return { ...sameBytes, localRelPath, status: "reused" };
  }

  if (dryRun) return { localRelPath, status: "would-upload" };

  const upload = await createDirectUpload(sha1);
  await putFileToSignedUrl(upload.url, absPath);
  const asset = await waitForAsset(upload.id);

  manifest[localRelPath] = {
    localRelPath,
    sha1,
    ...asset,
    uploadedAt: new Date().toISOString(),
  };
  await writeManifest(manifest);
  remoteBySha1?.set(sha1, asset);

  return { ...asset, localRelPath, status: "uploaded" };
}

/**
 * Register a video that was uploaded via the Mux dashboard, so it's in the
 * manifest without uploading it again.
 */
export async function linkExistingPlayback(absPath: string, playbackId: string) {
  const localRelPath = toPosix(
    path.join("uploads", path.relative(UPLOAD_ROOT, absPath)),
  );
  const sha1 = await sha1File(absPath);
  const playback = await mux().video.playbackIds.retrieve(playbackId);
  const assetId = playback.object?.id;
  if (!assetId) throw new Error(`No Mux asset found for playback ${playbackId}`);

  const manifest = await readManifest();
  manifest[localRelPath] = {
    localRelPath,
    sha1,
    assetId,
    playbackId,
    uploadedAt: new Date().toISOString(),
  };
  await writeManifest(manifest);
  return { localRelPath, assetId, playbackId };
}

export async function getMuxPlaybackId(src: string) {
  const key = toManifestKey(src);
  if (!key) return null;
  const manifest = await readManifest();
  return manifest[key]?.playbackId ?? null;
}

export { MANIFEST_PATH, UPLOAD_ROOT };
