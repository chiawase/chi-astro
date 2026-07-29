import { readFileSync, writeFileSync, readdirSync, statSync } from "node:fs";
import { join, extname } from "node:path";

const ROOT = "./src/content/archive";
const FILES: string[] = [];
function walk(dir: string) {
  for (const e of readdirSync(dir)) {
    const p = join(dir, e);
    if (statSync(p).isDirectory()) walk(p);
    else if ([".md", ".mdx"].includes(extname(p))) FILES.push(p);
  }
}
walk(ROOT);

let touched = 0,
  skipped = 0;
for (const file of FILES) {
  const raw = readFileSync(file, "utf8");
  if (!raw.startsWith("---")) {
    skipped++;
    continue;
  }
  const end = raw.indexOf("\n---", 3);
  if (end < 0) {
    skipped++;
    continue;
  }
  let fm = raw.slice(3, end);
  const body = raw.slice(end + 4);
  if (/^source:/m.test(fm)) {
    skipped++;
    continue;
  }
  fm = fm.trimEnd() + `\nsource: microblog\n`;
  writeFileSync(file, `---${fm}---${body}`);
  touched++;
}
console.log(`Tagged ${touched} files; skipped ${skipped}.`);
