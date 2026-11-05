import "dotenv/config";
import fs from "node:fs/promises";
import path from "node:path";
import {
  isVideoFile,
  linkExistingPlayback,
  muxUploadIfNeeded,
  UPLOAD_ROOT,
} from "../utils/muxUploader";

const USAGE = `Usage:
  npm run mux:upload -- <file-or-folder> [...more]   upload new videos
  npm run mux:upload -- --dry-run <file-or-folder>   show what would upload, upload nothing
  npm run mux:upload -- --link <file> <playbackId>   register a dashboard upload (no upload)

Paths must be inside uploads/. Files already on Mux (same content) are never re-uploaded.`;

// Files bigger than this get a "consider compressing" hint
const LARGE_FILE_MB = 100;
const LARGE_FILE_BYTES = LARGE_FILE_MB * 1024 * 1024;

function formatMB(bytes: number) {
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

async function walk(target: string): Promise<string[]> {
  const stat = await fs.stat(target);
  if (stat.isFile()) return [target];

  const out: string[] = [];
  for (const e of await fs.readdir(target, { withFileTypes: true })) {
    if (e.name.startsWith(".")) continue;
    const abs = path.join(target, e.name);
    out.push(...(e.isDirectory() ? await walk(abs) : [abs]));
  }
  return out;
}

function assertInUploads(abs: string) {
  const rel = path.relative(UPLOAD_ROOT, abs);
  if (rel.startsWith("..") || path.isAbsolute(rel))
    throw new Error(`Not inside uploads/: ${abs}`);
}

async function main() {
  const args = process.argv.slice(2);

  if (args[0] === "--link") {
    const [, file, playbackId] = args;
    if (!file || !playbackId) throw new Error(USAGE);
    const abs = path.resolve(file);
    assertInUploads(abs);
    const res = await linkExistingPlayback(abs, playbackId);
    console.log(`[mux] linked: ${res.localRelPath} → ${res.playbackId}`);
    return;
  }

  const dryRun = args.includes("--dry-run");
  const targets = args.filter((a) => !a.startsWith("--"));

  // No implicit "upload everything": you have to say which files
  if (!targets.length) {
    console.log(USAGE);
    process.exit(1);
  }

  const files: string[] = [];
  for (const t of targets) {
    const abs = path.resolve(t);
    assertInUploads(abs);
    files.push(...(await walk(abs)).filter(isVideoFile));
  }

  if (!files.length) {
    console.log("No video files found.");
    return;
  }

  let newBytes = 0;

  for (const abs of files) {
    const res = await muxUploadIfNeeded(abs, { dryRun });
    if (!res) continue;

    const { size } = await fs.stat(abs);
    console.log(`[mux] ${res.status}: ${res.localRelPath} (${formatMB(size)})`);

    // Only nag about files that are (or would be) sent to Mux this run
    if (res.status === "would-upload" || res.status === "uploaded") {
      newBytes += size;
      if (size > LARGE_FILE_BYTES) {
        console.log(
          `      ⚠ over ${LARGE_FILE_MB} MB. Consider compressing first:\n` +
            `        ffmpeg -i "${abs}" -c:v libx264 -crf 23 -preset slow -c:a aac -movflags +faststart "${abs.replace(/\.[^.]+$/, "")}.mp4"`,
        );
      }
    }
    if (res.playbackId) {
      console.log(`      paste: <VideoPlayer id="${res.playbackId}" />\n`);
    }
  }

  if (newBytes > 0) {
    console.log(
      `[mux] ${dryRun ? "would upload" : "uploaded"} ${formatMB(newBytes)} in total`,
    );
  }
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
