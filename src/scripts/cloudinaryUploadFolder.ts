import "dotenv/config";
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { execFileSync } from "node:child_process";
import { v2 as cloudinary } from "cloudinary";

type ManifestEntry = {
  localRelPath: string;
  publicId: string;
  resourceType: "image";
  secureUrl: string;
  bytes?: number;
  etag?: string;
  uploadedAt?: string;
  sha1?: string;
};

type Manifest = Record<string, ManifestEntry>;

const USAGE = `Usage:
  npm run cloudinary:upload:folder -- <folder-or-file> [...more] [--strip-gps]

Examples:
  npm run cloudinary:upload:folder -- uploads/2025
  npm run cloudinary:upload:folder -- uploads/2026/IMG_1334.jpeg uploads/2026/IMG_5945.jpeg --strip-gps

--strip-gps  removes GPS/location metadata from the LOCAL file (in place) before
             uploading. If the photo was already on Cloudinary, it's re-uploaded
             over the old copy so the location-tagged original is replaced.
             Other metadata (date, camera, etc.) is kept. Requires exiv2.`;

function loadManifest(manifestPath: string): Manifest {
  if (!fs.existsSync(manifestPath)) return {};
  return JSON.parse(fs.readFileSync(manifestPath, "utf-8"));
}

function saveManifest(manifestPath: string, manifest: Manifest) {
  fs.mkdirSync(path.dirname(manifestPath), { recursive: true });
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + "\n");
}

function walk(target: string): string[] {
  if (fs.statSync(target).isFile()) return [target];

  const out: string[] = [];
  for (const entry of fs.readdirSync(target, { withFileTypes: true })) {
    const full = path.join(target, entry.name);
    if (entry.isDirectory()) out.push(...walk(full));
    else out.push(full);
  }
  return out;
}

function isImage(file: string) {
  return /\.(png|jpe?g|webp|gif|avif)$/i.test(file);
}

function sha1File(absPath: string) {
  return crypto
    .createHash("sha1")
    .update(fs.readFileSync(absPath))
    .digest("hex");
}

/**
 * Convert an absolute file path into the manifest key you use in Markdown:
 *   "uploads/2025/foo.png"
 */
function absPathToManifestKey(absFile: string, uploadsRootAbs: string): string {
  const rel = path.relative(uploadsRootAbs, absFile).replace(/\\/g, "/");
  return `uploads/${rel}`;
}

function assertExiv2() {
  try {
    execFileSync("exiv2", ["--version"], { stdio: "ignore" });
  } catch {
    console.error("--strip-gps needs exiv2 (sudo pacman -S exiv2).");
    process.exit(1);
  }
}

/** Every GPS-related metadata key in the file (EXIF + XMP). */
function gpsKeys(absFile: string): string[] {
  let out = "";
  try {
    out = execFileSync("exiv2", ["-q", "-Pk", "-g", "GPS", absFile], {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    });
  } catch (e: any) {
    // exiv2 exits non-zero when nothing matches
    out = e?.stdout ?? "";
  }
  return [...new Set(out.split("\n").map((s) => s.trim()).filter(Boolean))];
}

/** Removes GPS metadata in place. Returns true if anything was removed. */
function stripGps(absFile: string): boolean {
  const keys = gpsKeys(absFile);
  if (!keys.length) return false;

  execFileSync("exiv2", [...keys.flatMap((k) => ["-M", `del ${k}`]), absFile], {
    stdio: "ignore",
  });

  const left = gpsKeys(absFile);
  if (left.length)
    throw new Error(`GPS still present after strip: ${absFile} (${left})`);
  return true;
}

async function main() {
  const args = process.argv.slice(2);
  const stripGpsFlag = args.includes("--strip-gps");
  const targets = args.filter((a) => !a.startsWith("--"));

  if (!targets.length) {
    console.error(USAGE);
    process.exit(1);
  }

  const projectRoot = process.cwd();

  // IMPORTANT: adjust this if your originals live elsewhere
  const UPLOADS_ROOT = path.resolve(projectRoot, "uploads");

  const files: string[] = [];
  for (const t of targets) {
    const abs = path.resolve(projectRoot, t);
    if (!fs.existsSync(abs)) {
      console.error(`Does not exist: ${abs}`);
      process.exit(1);
    }
    const rel = path.relative(UPLOADS_ROOT, abs);
    if (rel.startsWith("..") || path.isAbsolute(rel)) {
      console.error(`Not inside uploads/: ${abs}`);
      process.exit(1);
    }
    files.push(...walk(abs).filter(isImage));
  }

  if (!files.length) {
    console.log(`No images found in: ${targets.join(", ")}`);
    process.exit(0);
  }

  if (stripGpsFlag) assertExiv2();

  // Cloudinary creds (matches your env naming)
  const cloudName = process.env.PUBLIC_CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.PUBLIC_CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret) {
    console.error("Missing Cloudinary env vars. Need:");
    console.error("  PUBLIC_CLOUDINARY_CLOUD_NAME");
    console.error("  PUBLIC_CLOUDINARY_API_KEY");
    console.error("  CLOUDINARY_API_SECRET");
    process.exit(1);
  }

  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
  });

  const manifestPath = path.resolve(
    projectRoot,
    "_cache/cloudinary-manifest.json",
  );
  const manifest = loadManifest(manifestPath);

  console.log(`Found ${files.length} image(s)`);

  for (const absFile of files) {
    const key = absPathToManifestKey(absFile, UPLOADS_ROOT);
    const existing = manifest[key];

    const stripped = stripGpsFlag && stripGps(absFile);
    if (stripped) console.log(`⌖ Removed GPS from ${key}`);

    // File edited since upload (only detectable when the manifest has its sha1)
    const changed = Boolean(existing?.sha1 && existing.sha1 !== sha1File(absFile));

    // Already uploaded and nothing changed → skip
    if (existing?.secureUrl && !stripped && !changed) {
      console.log(`✓ Already in manifest: ${key}`);
      continue;
    }

    // Public ID format consistent with what you showed:
    // "chisenires.design/uploads/2023/xxxx"
    const publicId =
      existing?.publicId ?? `chisenires.design/${key.replace(/\.[^.]+$/, "")}`; // strip extension

    console.log(`${existing ? "↻ Replacing" : "↑ Uploading"} ${key}`);

    const result = await cloudinary.uploader.upload(absFile, {
      public_id: publicId,
      resource_type: "image",
      // Always replace: a file can be on Cloudinary without a manifest entry
      // (e.g. lost manifest writes), and overwrite:false would silently keep
      // that old copy, GPS included. Also purge the CDN cache.
      overwrite: true,
      invalidate: true,
    });

    manifest[key] = {
      localRelPath: key,
      publicId: result.public_id,
      resourceType: "image",
      secureUrl: result.secure_url,
      bytes: result.bytes,
      etag: (result as any).etag,
      // sha1 of the local file, same as uploader.ts, so the dev watcher/build
      // sees it as unchanged and doesn't upload it a second time
      sha1: sha1File(absFile),
      uploadedAt: new Date().toISOString(),
    };

    saveManifest(manifestPath, manifest);
  }

  console.log(`Done. Updated manifest at: ${manifestPath}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
