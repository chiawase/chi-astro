/* One file to house all the redirects */
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, extname } from "node:path";
import { resolve } from "node:path";

// --- Computed redirects for sourced archive posts -----------------------------
// Walks src/content/archive/**/*.{md,mdx} at config-eval time.
// For every post with a `source:` in frontmatter, emits:
//   /archive/{id}/  ->  /archive/{source}/{id}/  (301)
const ARCHIVE_DIR = resolve("./src/content/archive");
const computed: Record<string, { destination: string; status: 301 | 302 }> = {};

function walkArchive(dir: string) {
  for (const e of readdirSync(dir)) {
    const p = join(dir, e);
    if (statSync(p).isDirectory()) walkArchive(p);
    else if ([".md", ".mdx"].includes(extname(p))) {
      const raw = readFileSync(p, "utf8");
      const fmEnd = raw.indexOf("\n---", 3);
      if (fmEnd < 0) continue;
      const fm = raw.slice(3, fmEnd);
      const sourceMatch = fm.match(/^source:\s*(\w+)$/m);
      if (!sourceMatch) continue;
      const source = sourceMatch[1];
      // id = path relative to ARCHIVE_DIR, no extension
      const id = p.slice(ARCHIVE_DIR.length + 1).replace(/\.mdx?$/, "");
      computed[`/archive/${id}/`] = {
        destination: `/archive/${source}/${id}/?from=archive`,
        status: 301,
      };
    }
  }
}
walkArchive(ARCHIVE_DIR);

// --- Hand-written redirects ---------------------------------------------------
const manual = {
  "/feed/feed.xml": { destination: "/feed.xml", status: 301 },
  "sitemap.xml": { destination: "sitemap-index.xml", status: 301 },
  "/tags/link/": { destination: "/tags/links/", status: 301 },
  // "": { destination: "", status: 301 },
} as const;

// Old Microblog redirects to double check:
// "/archive/2024/04/03/say-card-mbapr/": { destination: "/archive/2024/04/03/day-card-mbapr/", status: 301 }, // Archive - mbApr day 3 entry
// "/2023/07/07/thinking-of-writing.html": { destination: "/archive/2023/07/07/thinking-of-writing/", status: 301 },
// "/2021/09/25/getting-to-know.html": { destination: "/archive/2021/09/25/getting-to-know/", status: 301 },
// "/writing/25-things-i-learned-after-25-years-of-existing/": { destination: "/archive/2021/09/04/figuring-out-where/", status: 301 },
// "/2021/09/04/figuring-out-where.html": { destination: "/archive/2021/09/04/figuring-out-where/", status: 301 },
// "/2021/09/04/things-i-learned.html": { destination: "/archive/2021/09/04/things-i-learned/", status: 301 },
// "/2023/12/27/things-i-want.html": { destination: "/archive/2023/12/27/things-i-want/", status: 301 },
// "/2023/07/07/things-i-wanna.html": { destination: "/archive/2023/07/07/things-i-wanna/", status: 301 },

export default { ...computed, ...manual } as const;
