import Mux from "@mux/mux-node";
import fs from "node:fs/promises";
import path from "node:path";

const mux = new Mux({
  tokenId: process.env.MUX_TOKEN_ID!,
  tokenSecret: process.env.MUX_TOKEN_SECRET!,
});

const VIDEO_EXTS = new Set([".mp4", ".mov", ".m4v", ".mkv"]);

function isVideoFile(absPath: string) {
  return VIDEO_EXTS.has(path.extname(absPath).toLowerCase());
}

// 1) Create a Direct Upload (gets you a signed upload URL)
async function createDirectUpload() {
  const upload = await mux.video.uploads.create({
    new_asset_settings: {
      playback_policy: ["public"], // or ["signed"]
    },
    cors_origin: "https://chisenires.design", // optional; more relevant for browser uploads
  });
  return upload; // has upload.url + upload.id
}

// 2) Upload bytes to the signed URL (PUT)
// NOTE: Implementation depends on how Mux expects the PUT body/headers in your environment.
// The docs show using standard HTTP PUT to the returned URL. :contentReference[oaicite:4]{index=4}
async function putFileToSignedUrl(uploadUrl: string, absPath: string) {
  const file = await fs.readFile(absPath);
  const res = await fetch(uploadUrl, {
    method: "PUT",
    body: file,
    headers: {
      "Content-Type": "application/octet-stream",
    },
  });
  if (!res.ok) {
    throw new Error(`Mux upload failed: ${res.status} ${res.statusText}`);
  }
}

// 3) Poll the Upload until it’s “asset_created”, then fetch the asset for playback_id
async function waitForAsset(uploadId: string) {
  for (let i = 0; i < 120; i++) {
    const u = await mux.video.uploads.retrieve(uploadId);
    if (u.asset_id) {
      const asset = await mux.video.assets.retrieve(u.asset_id);
      const playbackId = asset.playback_ids?.[0]?.id;
      return { assetId: u.asset_id, playbackId };
    }
    await new Promise((r) => setTimeout(r, 2000));
  }
  throw new Error("Timed out waiting for Mux asset creation.");
}

export async function muxUploadIfNeeded(absPath: string) {
  if (!isVideoFile(absPath)) return null;

  const upload = await createDirectUpload();
  await putFileToSignedUrl(upload.url, absPath);

  const asset = await waitForAsset(upload.id);
  return asset; // { assetId, playbackId }
}
