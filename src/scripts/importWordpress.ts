import {
  readFileSync,
  existsSync,
  mkdirSync,
  copyFileSync,
  writeFileSync,
} from "node:fs";
import { join, dirname } from "node:path";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { XMLParser } = require("fast-xml-parser");

// CLI args
function arg(name: string, def?: string): string {
  const i = process.argv.indexOf(`--${name}`);
  if (i >= 0 && i + 1 < process.argv.length) return process.argv[i + 1];
  if (def !== undefined) return def;
  console.error(`Missing ${name}`);
  process.exit(1);
}

const args = {
  xml: arg("xml"),
  mediaDir: arg("media-dir"),
  source: arg("source"),
  outDir: arg("out-dir", "./src/content/archive"),
  uploadsDir: arg("uploads-dir", "./uploads"),
  dryRun: process.argv.includes("--dry-run"),
  includeDrafts: process.argv.includes("--include-drafts"),
};
const REPORT_PATH = "./_cache/wordpress-import-logs.json";

// XML parsing
type Item = Record<string, any>;
const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: "@_",
  cdataPropName: "__cdata",
  parseTagValue: true,
  trimValues: false,
  isArray: (n: string) => n === "item" || n === "category",
});

const raw = parser.parse(readFileSync(args.xml, "utf8"));
const items: Item[] = raw.rss.channel.item ?? [];

// Helpers
const val = (it: Item, k: string) => (it[k]?.__cdata ?? it[k] ?? "").toString();

const sanitizeSlug = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80) || "untitled";

const slugFromContent = (html: string) => {
  const text = html
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  return sanitizeSlug(text.split(" ").slice(0, 6).join(" "));
};

const htmlToMarkdown = (html: string) => {
  // VERY lightweight — extend as needed. Key transforms for your data:
  let md = html;
  md = md.replace(
    /\[caption[^\]]*\](<img[^>]+>)([^\[]+)\[\/caption\]/g,
    "$1\n\n$2",
  ); // WP captions
  md = md.replace(/<h1[^>]*>(.*?)<\/h1>/gi, "\n# $1\n");
  md = md.replace(/<h2[^>]*>(.*?)<\/h2>/gi, "\n## $1\n");
  md = md.replace(/<h3[^>]*>(.*?)<\/h3>/gi, "\n### $1\n");
  md = md.replace(/<(strong|b)[^>]*>(.*?)<\/\1>/gi, "**$2**");
  md = md.replace(/<(em|i)[^>]*>(.*?)<\/\1>/gi, "*$2*");
  md = md.replace(/<a [^>]*href="([^"]+)"[^>]*>(.*?)<\/a>/gi, "[$2]($1)");
  md = md.replace(/<li[^>]*>(.*?)<\/li>/gi, "- $1\n");
  md = md.replace(/<\/?(ul|ol)[^>]*>/gi, "\n");
  md = md.replace(
    /<img [^>]*src="([^"]+)"[^>]*alt="([^"]*)"[^>]*\/?>/gi,
    "![$2]($1)",
  );
  md = md.replace(/<img [^>]*src="([^"]+)"[^>]*\/?>/gi, "![]($1)");
  md = md.replace(/<br\s*\/?>/gi, "\n");
  md = md.replace(/<hr\s*\/?>/gi, "\n---\n");
  md = md.replace(/<blockquote[^>]*>(.*?)<\/blockquote>/gis, (_, inner) =>
    inner
      .split("\n")
      .map((l: string) => `> ${l}`)
      .join("\n"),
  );
  md = md.replace(/<[^>]+>/g, ""); // strip remaining tags
  md = md
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(+n))
    .replace(/&#x([0-9a-f]+);/gi, (_, n) =>
      String.fromCharCode(parseInt(n, 16)),
    );
  md = md.replace(/\n{3,}/g, "\n\n");
  return md.trim();
};

const localDate = (wpDate: string) => {
  // wpDate like "2013-04-02 09:35:16" — treat as local time, add +08:00
  // (Posts in this XML have local time baked in; wp:post_date_gmt is 0000-00-00 00:00:00 for many.)
  return wpDate.replace(" ", "T") + "+08:00";
};

// --- Index attachments ------------------------------------------------------
const attachmentsByParent = new Map<number, string>();
for (const it of items) {
  if (val(it, "wp:post_type") !== "attachment") continue;
  const parent = Number(val(it, "wp:post_parent"));
  if (!parent) continue;
  const url = val(it, "wp:attachment_url");
  const filename = url.split("/").pop();
  const date = val(it, "wp:post_date"); // YYYY-MM-DD HH:MM:SS
  if (!filename || !date) continue;
  const yyyy = date.slice(0, 4),
    mm = date.slice(5, 7);
  attachmentsByParent.set(parent, `${yyyy}/${mm}/${filename}`);
}

// --- Go thru posts -------------------------------------------------------------
const report: any = { created: [], skipped: [], errors: [], images: [] };
let created = 0,
  skipped = 0;
const slugSeen = new Set<string>();

for (const it of items) {
  if (val(it, "wp:post_type") !== "post") continue;
  const status = val(it, "wp:status");
  if (status === "inherit" || status === "trash") continue;
  if (!args.includeDrafts && (status === "draft" || status === "private"))
    continue;
  const draft = status === "draft" || status === "private";

  const date = val(it, "wp:post_date");
  if (!date || date.startsWith("0000")) {
    report.errors.push({ reason: "no date", title: val(it, "title") });
    continue;
  }

  const postId = Number(val(it, "wp:post_id"));
  const rawTitle = val(it, "title").trim();
  const title = rawTitle || null;
  const html = val(it, "content:encoded");
  const md = htmlToMarkdown(html);

  // slug
  let slug = sanitizeSlug(val(it, "wp:post_name"));
  if (!slug) slug = title ? sanitizeSlug(title) : slugFromContent(html);
  let finalSlug = slug;
  let n = 2;
  while (slugSeen.has(finalSlug)) finalSlug = `${slug}-${n++}`;
  slugSeen.add(finalSlug);

  // categories -> tags (deduped, no WP internal)
  const cats = (it.category ?? [])
    .map((c: any) => (c["@_nicename"] ?? c.__cdata ?? c).toString())
    .filter((c: string) => c && !c.startsWith("post-format-"));
  const tags = [...new Set(cats)];

  // hero image
  const heroFilename = attachmentsByParent.get(postId);
  let heroImagePath: string | null = null;
  if (heroFilename) {
    const src = join(args.mediaDir, heroFilename);
    if (existsSync(src)) {
      heroImagePath = `/uploads/${heroFilename}`;
      if (args.dryRun) {
        report.images.push({
          from: src,
          to: join(args.uploadsDir, heroFilename),
          dryRun: true,
        });
      } else {
        const dest = join(args.uploadsDir, heroFilename);
        mkdirSync(dirname(dest), { recursive: true });
        if (!existsSync(dest)) copyFileSync(src, dest);
        report.images.push({ from: src, to: dest });
      }
    } else {
      report.errors.push({ reason: "media not found", postId, heroFilename });
    }
  }

  // output
  const d = localDate(date);
  const yyyy = d.slice(0, 4),
    mm = d.slice(5, 7),
    dd = d.slice(8, 10);
  const outPath = join(args.outDir, yyyy, mm, dd, `${finalSlug}.md`);

  const fm = [
    `---`,
    title ? `title: ${JSON.stringify(title)}` : null,
    `date: ${d}`,
    tags.length ? `tags: ${JSON.stringify(tags)}` : null,
    `source: ${args.source}`,
    draft ? `draft: true` : null,
    heroImagePath ? `heroImage: ${JSON.stringify(heroImagePath)}` : null,
    `---`,
  ]
    .filter(Boolean)
    .join("\n");

  const body = md ? `\n\n${md}\n` : "\n";

  if (args.dryRun) {
    const wouldSkip = existsSync(outPath);
    report.created.push({ path: outPath, title, status, wouldSkip });
    if (wouldSkip) skipped++;
  } else {
    mkdirSync(dirname(outPath), { recursive: true });
    if (existsSync(outPath)) {
      report.skipped.push({ path: outPath, reason: "exists" });
      skipped++;
    } else {
      writeFileSync(outPath, fm + body);
      report.created.push({ path: outPath });
      created++;
    }
  }
}

mkdirSync(dirname(REPORT_PATH), { recursive: true });
writeFileSync(REPORT_PATH, JSON.stringify(report, null, 2));
console.log(
  `${args.dryRun ? "DRY-RUN" : "WROTE"}: ${report.created.length} posts, ${report.images.length} images, ${skipped} skipped, ${report.errors.length} errors.`,
);
console.log(`Report: ${REPORT_PATH}`);
