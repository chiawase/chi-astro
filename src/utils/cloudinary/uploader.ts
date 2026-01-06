import "dotenv/config";
import { v2 as cloudinary } from "cloudinary";
import fs from "node:fs/promises";
import fsSync from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

type ManifestEntry = {
  localRelPath: string; // uploads/2026/foo.jpg
  publicId: string; // chisenires.design/uploads/2026/foo
  resourceType: "image";
  secureUrl: string; // Cloudinary hosted URL
  bytes?: number;
  etag?: string;
  uploadedAt: string;
  sha1: string;
  mux?: {
    assetId: string;
    playbackId: string;
  };
};

type Manifest = Record<string, ManifestEntry>; // key = localRelPath

const UPLOAD_ROOT = path.resolve("src/content/img/uploads");
const CACHE_DIR = path.resolve("_cache");
const MANIFEST_PATH = path.join(CACHE_DIR, "cloudinary-manifest.json");

const IMAGE_EXTS = new Set([
  ".jpg",
  ".jpeg",
  ".png",
  ".webp",
  ".avif",
  ".gif",
  ".svg",
  ".heic",
]);

export function isImageFile(absPath: string) {
  return IMAGE_EXTS.has(path.extname(absPath).toLowerCase());
}

function requireEnv(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`Missing env var: ${name}`);
  return v;
}

function toPosix(p: string) {
  return p.split(path.sep).join("/");
}

async function ensureCacheDir() {
  await fs.mkdir(CACHE_DIR, { recursive: true });
}

async function readManifest(): Promise<Manifest> {
  try {
    const raw = await fs.readFile(MANIFEST_PATH, "utf8");
    return JSON.parse(raw) as Manifest;
  } catch {
    return {};
  }
}

async function writeManifest(m: Manifest) {
  await ensureCacheDir();
  await fs.writeFile(MANIFEST_PATH, JSON.stringify(m, null, 2), "utf8");
}

async function sha1File(absPath: string) {
  const buf = await fs.readFile(absPath);
  return crypto.createHash("sha1").update(buf).digest("hex");
}

function publicIdFor(localRelPath: string) {
  // localRelPath like: uploads/2026/foo.jpg (relative to UPLOAD_ROOT’s parent)
  // We want: chisenires.design/uploads/2026/foo (no extension)
  const folder = requireEnv("CLOUDINARY_FOLDER"); // e.g. chisenires.design/uploads
  const noExt = localRelPath.replace(/\.[^.]+$/, "");
  return `${folder}/${noExt.replace(/^uploads\//, "")}`;
}

export async function uploadIfNeeded(absPath: string) {
  if (!isImageFile(absPath)) return null;

  cloudinary.config({
    cloud_name: requireEnv("PUBLIC_CLOUDINARY_CLOUD_NAME"),
    api_key: requireEnv("PUBLIC_CLOUDINARY_API_KEY"),
    api_secret: requireEnv("CLOUDINARY_API_SECRET"),
  });

  const manifest = await readManifest();

  // derive localRelPath as: uploads/....
  const relFromUploadRoot = path.relative(UPLOAD_ROOT, absPath);
  const localRelPath = toPosix(path.join("uploads", relFromUploadRoot));

  // 10MB Cloudinary limit on many free plans
  const MAX_BYTES = 10 * 1024 * 1024;

  let size = 0;
  try {
    size = fsSync.statSync(absPath).size;
  } catch (e) {
    console.error("[cloudinary] stat failed:", { localRelPath, absPath }, e);
    return null;
  }

  if (size > MAX_BYTES) {
    console.warn(
      `[cloudinary] skipped (too large): ${localRelPath} (${(size / 1024 / 1024).toFixed(2)}MB)`,
    );
    return null;
  }

  const sha1 = await sha1File(absPath);
  const existing = manifest[localRelPath];

  // Skip if unchanged
  if (existing?.sha1 === sha1) return existing;

  console.log(`[cloudinary] uploading ${localRelPath}`);

  const publicId = publicIdFor(localRelPath);

  try {
    const result = await cloudinary.uploader.upload(absPath, {
      public_id: publicId,
      resource_type: "image",
      overwrite: true,
      unique_filename: false,
      invalidate: true,
    });

    // ... build entry, write manifest ...
  } catch (e) {
    console.error(
      "[cloudinary] upload failed:",
      {
        localRelPath,
        absPath,
        bytes: size,
        publicId,
      },
      e,
    );
    throw e; // rethrow so build can fail if you want it to
  }
}

export async function getManifestUrl(localRelPath: string) {
  const manifest = await readManifest();
  return manifest[localRelPath]?.secureUrl;
}

export { UPLOAD_ROOT, MANIFEST_PATH };
