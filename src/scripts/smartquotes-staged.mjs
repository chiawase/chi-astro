#!/usr/bin/env node
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const files = process.argv.slice(2);
if (!files.length) process.exit(0);

// Resolve your existing smartquotes script in the repo.
// Adjust this if your mdx-smartquotes.mjs lives elsewhere.
const smartquotesPath = path.resolve(
  process.cwd(),
  "src/scripts/mdx-smartquotes.mjs",
);

for (const file of files) {
  // Skip missing files (renames/deletes can happen in staging)
  if (!fs.existsSync(file)) continue;

  const input = fs.readFileSync(file, "utf8");
  const output = execFileSync("node", [smartquotesPath], {
    input,
    encoding: "utf8",
  });

  if (output !== input) {
    fs.writeFileSync(file, output, "utf8");
  }
}
