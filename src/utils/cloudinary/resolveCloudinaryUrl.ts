import fs from "node:fs";
import path from "node:path";

type ManifestEntry = {
  localRelPath: string;
  publicId: string;
  resourceType: string;
  secureUrl: string;
  bytes?: number;
  etag?: string;
  uploadedAt?: string;
  sha1?: string;
};

type Manifest = Record<string, ManifestEntry>;

/**
 * Loads the manifest once per process.
 * Assumes your app runs from /app in Coolify.
 */
let manifestCache: Manifest | null = null;

function loadManifest(): Manifest {
  if (manifestCache) return manifestCache;

  const manifestPath = path.resolve(
    process.cwd(),
    "_cache",
    "cloudinary-manifest.json",
  );

  if (!fs.existsSync(manifestPath)) {
    manifestCache = {};
    return manifestCache;
  }

  manifestCache = JSON.parse(fs.readFileSync(manifestPath, "utf-8"));
  return manifestCache;
}

/**
 * Normalize local-ish paths into the manifest key format: "uploads/...."
 * Examples:
 *  - "../img/uploads/2025/a.jpg" -> "uploads/2025/a.jpg"
 *  - "/uploads/2025/a.jpg"      -> "uploads/2025/a.jpg"
 *  - "uploads/2025/a.jpg"       -> "uploads/2025/a.jpg"
 */
function normalizeToManifestKey(input: string): string {
  // Already a URL? We'll skip normalization elsewhere, but keep this safe.
  const trimmed = input.trim();

  // Find the first occurrence of "uploads/" and slice from there.
  const idx = trimmed.indexOf("uploads/");
  if (idx !== -1) return trimmed.slice(idx);

  // If your content uses a different base folder, you can add more rules here.
  return trimmed.replace(/^\.?\//, "");
}

/**
 * Resolve a possibly-local path to Cloudinary secureUrl using the manifest.
 * Returns:
 *  - same URL if already absolute (https://)
 *  - Cloudinary secureUrl if found
 *  - original input if not found (so you can see broken cases without crashing)
 */
export function resolveCloudinaryUrl(src: string): string {
  if (!src) return src;

  // If it already looks like a remote URL, keep it.
  if (/^https?:\/\//i.test(src)) return src;

  const manifest = loadManifest();
  const key = normalizeToManifestKey(src);

  const entry = manifest[key];
  if (entry?.secureUrl) return entry.secureUrl;

  // Not found — return original so the page still renders and you can debug.
  return src;
}
