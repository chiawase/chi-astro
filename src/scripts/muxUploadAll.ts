import fs from "node:fs/promises";
import path from "node:path";
import { muxUploadIfNeeded } from "@utils/muxUploader";

const ROOT = path.resolve("src/content/uploads");

async function walk(dir: string): Promise<string[]> {
  const out: string[] = [];
  const entries = await fs.readdir(dir, { withFileTypes: true });

  for (const e of entries) {
    const abs = path.join(dir, e.name);
    if (e.isDirectory()) out.push(...(await walk(abs)));
    else out.push(abs);
  }
  return out;
}

async function main() {
  const files = await walk(ROOT);
  for (const abs of files) {
    const res = await muxUploadIfNeeded(abs);
    if (res) {
      console.log(`[mux] uploaded: ${abs}`);
      console.log(`      playbackId: ${res.playbackId}`);
    }
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
