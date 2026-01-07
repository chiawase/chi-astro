import fs from "node:fs";
import path from "node:path";

// Minimal types so you don't need extra deps.
type ManifestEntry = { secureUrl?: string };
type Manifest = Record<string, ManifestEntry>;

let manifestCache: Manifest | null = null;

function loadManifest(): Manifest {
  // In dev, always reload so new uploads immediately work without restart.
  const isDev = process.env.NODE_ENV !== "production";

  if (!isDev && manifestCache) return manifestCache;

  const manifestPath = path.resolve(
    process.cwd(),
    "_cache",
    "cloudinary-manifest.json",
  );

  if (!fs.existsSync(manifestPath)) {
    manifestCache = {};
    return manifestCache;
  }

  try {
    const next = JSON.parse(fs.readFileSync(manifestPath, "utf-8"));
    manifestCache = next;
  } catch (e) {
    console.warn("[cloudinary] Failed to parse cloudinary-manifest.json", e);
    manifestCache = {};
  }

  return manifestCache!;
}

function toManifestKey(input: string): string | null {
  // already remote → no rewrite
  if (/^https?:\/\//i.test(input)) return null;

  // normalize "/uploads/..." or "uploads/..." or ".../uploads/..."
  const idx = input.indexOf("uploads/");
  if (idx === -1) return null;

  return input.slice(idx); // returns "uploads/...."
}

function rewriteUrl(original: string): string | null {
  const decoded = decodeURI(original);
  const key = toManifestKey(decoded);

  if (!key) return null;

  const manifest = loadManifest();
  const entry = manifest[key];

  if (entry?.secureUrl) return entry.secureUrl;

  // Not found in manifest → leave as-is but warn (helps you catch strays)
  console.warn(`[cloudinary] Missing manifest entry for: ${key}`);
  return null;
}

// Rehype plugin: runs on HTML AST (after Markdown/MDX becomes HTML)
export function rehypeUploadsToCloudinary() {
  return (tree: any) => {
    const visit = (node: any) => {
      if (!node || typeof node !== "object") return;

      // Rewrite <img src="...">
      if (node.type === "element" && node.tagName === "img") {
        const src = node.properties?.src;
        if (typeof src === "string") {
          const rewritten = rewriteUrl(src);
          if (rewritten) node.properties.src = rewritten;
        }

        // Optional: also rewrite srcset if you ever output it as a string.
        const srcset = node.properties?.srcset;
        if (typeof srcset === "string") {
          // naive rewrite: replace each URL portion if it matches uploads/
          node.properties.srcset = srcset
            .split(",")
            .map((part) => {
              const trimmed = part.trim();
              const [url, descriptor] = trimmed.split(/\s+/, 2);
              const rewritten = rewriteUrl(url) ?? url;
              return descriptor ? `${rewritten} ${descriptor}` : rewritten;
            })
            .join(", ");
        }
      }

      // Optional: rewrite <a href="/uploads/..."> links (if you link to images)
      if (node.type === "element" && node.tagName === "a") {
        const href = node.properties?.href;
        if (typeof href === "string") {
          const rewritten = rewriteUrl(href);
          if (rewritten) node.properties.href = rewritten;
        }
      }

      // Traverse children
      const children = node.children;
      if (Array.isArray(children)) children.forEach(visit);
    };

    visit(tree);
  };
}
