import type { AstroIntegration } from "astro";
import chokidar from "chokidar";
import path from "node:path";
import fs from "node:fs/promises";
import { UPLOAD_ROOT, uploadIfNeeded, isImageFile } from "./uploader";

async function fileExists(p: string) {
  try {
    await fs.stat(p);
    return true;
  } catch {
    return false;
  }
}

export default function cloudinaryWatch(): AstroIntegration {
  return {
    name: "cloudinary-watch-uploads",
    hooks: {
      // Dev server: upload on add/change
      "astro:server:setup": ({ server }) => {
        const start = async () => {
          if (!(await fileExists(UPLOAD_ROOT))) return;

          const watcher = chokidar.watch(UPLOAD_ROOT, {
            ignoreInitial: true,
            awaitWriteFinish: { stabilityThreshold: 500, pollInterval: 100 },
          });

          const onFile = async (abs: string) => {
            // Ignore hidden files / temp files
            const base = path.basename(abs);
            if (base.startsWith(".") || base.endsWith(".tmp")) return;

            // ignore non-images (e.g. .mp4/.mov)
            if (!isImageFile(abs)) return;

            try {
              await uploadIfNeeded(abs);
              // Trigger a reload so the rewritten URLs show up immediately
              server.ws.send({ type: "full-reload" });
            } catch (e) {
              console.error("[cloudinary-watch] upload failed:", abs, e);
            }
          };

          watcher.on("add", onFile);
          watcher.on("change", onFile);

          server.httpServer?.once("close", () => watcher.close());
        };

        void start();
      },

      // Build: ensure all files present at build-time are uploaded
      "astro:build:setup": async () => {
        if (!(await fileExists(UPLOAD_ROOT))) return;
        const walk = async (dir: string) => {
          const items = await fs.readdir(dir, { withFileTypes: true });
          for (const it of items) {
            const abs = path.join(dir, it.name);
            if (it.isDirectory()) await walk(abs);
            else await uploadIfNeeded(abs);
          }
        };
        await walk(UPLOAD_ROOT);
      },
    },
  };
}
