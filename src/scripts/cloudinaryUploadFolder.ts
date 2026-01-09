import "dotenv/config";
import fs from "node:fs";
import path from "node:path";
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

function loadManifest(manifestPath: string): Manifest {
  if (!fs.existsSync(manifestPath)) return {};
  return JSON.parse(fs.readFileSync(manifestPath, "utf-8"));
}

function saveManifest(manifestPath: string, manifest: Manifest) {
  fs.mkdirSync(path.dirname(manifestPath), { recursive: true });
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + "\n");
}

function walk(dir: string): string[] {
  const out: string[] = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walk(full));
    else out.push(full);
  }
  return out;
}

function isImage(file: string) {
  return /\.(png|jpe?g|webp|gif|avif)$/i.test(file);
}

/**
 * Convert an absolute file path into the manifest key you use in Markdown:
 *   "uploads/2025/foo.png"
 */
function absPathToManifestKey(absFile: string, uploadsRootAbs: string): string {
  const rel = path.relative(uploadsRootAbs, absFile).replace(/\\/g, "/");
  return `uploads/${rel}`;
}

async function main() {
  const folderArg = process.argv[2];
  if (!folderArg) {
    console.error("Usage: npm run cloudinary:upload:folder -- <folder>");
    console.error("Example: npm run cloudinary:upload:folder -- uploads/2025");
    process.exit(1);
  }

  const projectRoot = process.cwd();

  // IMPORTANT: adjust this if your originals live elsewhere
  const UPLOADS_ROOT = path.resolve(projectRoot, "uploads");

  const folderAbs = path.resolve(projectRoot, folderArg);
  if (!fs.existsSync(folderAbs)) {
    console.error(`Folder does not exist: ${folderAbs}`);
    process.exit(1);
  }

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

  const files = walk(folderAbs).filter(isImage);

  if (!files.length) {
    console.log(`No images found in: ${folderArg}`);
    process.exit(0);
  }

  console.log(`Found ${files.length} image(s) in ${folderArg}`);

  for (const absFile of files) {
    const key = absPathToManifestKey(absFile, UPLOADS_ROOT);

    // Skip if already uploaded
    if (manifest[key]?.secureUrl) {
      console.log(`✓ Already in manifest: ${key}`);
      continue;
    }

    // Public ID format consistent with what you showed:
    // "chisenires.design/uploads/2023/xxxx"
    const publicId = `chisenires.design/${key.replace(/\.[^.]+$/, "")}`; // strip extension

    console.log(`↑ Uploading ${key}`);

    const result = await cloudinary.uploader.upload(absFile, {
      public_id: publicId,
      overwrite: false,
      resource_type: "image",
    });

    manifest[key] = {
      localRelPath: key,
      publicId: result.public_id,
      resourceType: "image",
      secureUrl: result.secure_url,
      bytes: result.bytes,
      etag: (result as any).etag,
      sha1: (result as any).sha1,
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
