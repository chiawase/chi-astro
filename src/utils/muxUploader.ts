import Mux from "@mux/mux-node";
import fs from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";

const mux = new Mux({
  tokenId: process.env.MUX_TOKEN_ID!,
  tokenSecret: process.env.MUX_TOKEN_SECRET!,
});

const VIDEO_EXTS = new Set([".mp4", ".mov", ".m4v", ".mkv"]);

export function isVideoFile(absPath: string) {
  return VIDEO_EXTS.has(path.extname(absPath).toLowerCase());
}

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

async function ensureCacheDir() {
  await fs.mkdir(CACHE_DIR, { recursive: true });
}

async function readManifest(): Promise<MuxManifest> {
  try {
    const raw = await fs.readFile(MANIFEST_PATH, "utf8");
    return JSON.parse(raw) as MuxManifest;
  } catch {
    return {};
  }
}

async function writeManifest(m: MuxManifest) {
  await ensureCacheDir();
  await fs.writeFile(MANIFEST_PATH, JSON.stringify(m, null, 2), "utf8");
}

async function sha1File(absPath: string) {
  const buf = await fs.readFile(absPath);
  return crypto.createHash("sha1").update(buf).digest("hex");
}

function toPosix(p: string) {
  return p.split(path.sep).join("/");
}

// 1) Create a Direct Upload (gets you a signed upload URL)
async function createDirectUpload() {
  return mux.video.uploads.create({
    new_asset_settings: { playback_policy: ["public"] },
    cors_origin: "https://chisenires.design", // satisfies SDK types; harmless for Node uploads
  });
}

// 2) Upload bytes to signed URL
async function putFileToSignedUrl(uploadUrl: string, absPath: string) {
  const file = await fs.readFile(absPath);
  const res = await fetch(uploadUrl, {
    method: "PUT",
    body: file.buffer as ArrayBuffer,
    headers: { "Content-Type": "application/octet-stream" },
  });
  if (!res.ok)
    throw new Error(`Mux upload failed: ${res.status} ${res.statusText}`);
}

// 3) Poll until asset created
async function waitForAsset(uploadId: string) {
  for (let i = 0; i < 120; i++) {
    const u = await mux.video.uploads.retrieve(uploadId);
    if (u.asset_id) {
      const asset = await mux.video.assets.retrieve(u.asset_id);
      const playbackId = asset.playback_ids?.[0]?.id;
      if (!playbackId)
        throw new Error("Mux asset created but no playback id found.");
      return { assetId: u.asset_id, playbackId };
    }
    await new Promise((r) => setTimeout(r, 2000));
  }
  throw new Error("Timed out waiting for Mux asset creation.");
}

/**
 * Upload video if it’s new/changed. Returns playback info either way.
 */
export async function muxUploadIfNeeded(absPath: string) {
  if (!isVideoFile(absPath)) return null;

  // Convert absolute path → "uploads/...."
  const relFromUploadsRoot = path.relative(path.resolve("src/img"), absPath);
  const localRelPath = toPosix(relFromUploadsRoot); // e.g. "uploads/2026/foo.mp4"

  const sha1 = await sha1File(absPath);
  const manifest = await readManifest();

  const existing = manifest[localRelPath];
  if (existing && existing.sha1 === sha1) {
    return {
      assetId: existing.assetId,
      playbackId: existing.playbackId,
      localRelPath,
      cached: true as const,
    };
  }

  const upload = await createDirectUpload();
  await putFileToSignedUrl(upload.url, absPath);
  const asset = await waitForAsset(upload.id);

  const entry: MuxManifestEntry = {
    localRelPath,
    sha1,
    assetId: asset.assetId,
    playbackId: asset.playbackId,
    uploadedAt: new Date().toISOString(),
  };

  manifest[localRelPath] = entry;
  await writeManifest(manifest);

  return { ...asset, localRelPath, cached: false as const };
}

export async function getMuxPlaybackId(localRelPath: string) {
  const manifest = await readManifest();
  return manifest[localRelPath]?.playbackId ?? null;
}

export { MANIFEST_PATH };
