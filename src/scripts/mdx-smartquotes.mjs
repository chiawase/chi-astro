import process from "node:process";
import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkStringify from "remark-stringify";
import remarkMdx from "remark-mdx";
import smartypants from "remark-smartypants";

async function readStdin() {
  const chunks = [];
  for await (const chunk of process.stdin) chunks.push(chunk);
  return Buffer.concat(chunks).toString("utf8");
}

/**
 * If the file starts with YAML/TOML frontmatter, return:
 *  - frontmatter: the entire frontmatter block INCLUDING delimiters
 *  - body: the rest of the file (unchanged)
 *
 * Supports:
 *  --- yaml ---
 *  +++ toml +++
 *
 * Keeps line endings as-is.
 */
function splitFrontmatter(input) {
  // Normalize only for searching; do not rewrite the original text.
  const startsWithYaml =
    input.startsWith("---\n") || input.startsWith("---\r\n");
  const startsWithToml =
    input.startsWith("+++\n") || input.startsWith("+++\r\n");

  const fence = startsWithYaml ? "---" : startsWithToml ? "+++" : null;
  if (!fence) return { frontmatter: "", body: input };

  // Find the closing fence on its own line.
  // This matches:
  // \n---\n or \r\n---\r\n (and same for +++)
  const re = new RegExp(
    `^(\\${fence}\\r?\\n)([\\s\\S]*?)(\\r?\\n\\${fence})(\\r?\\n|$)`,
  );

  const m = input.match(re);
  if (!m) {
    // Malformed/unclosed frontmatter; safest is to leave whole file untouched.
    return { frontmatter: "", body: input };
  }

  const fullFrontmatter = m[1] + m[2] + m[3] + (m[4] ?? "");
  const rest = input.slice(fullFrontmatter.length);

  return { frontmatter: fullFrontmatter, body: rest };
}

const input = await readStdin();
const filePath = process.argv[2] || "input.mdx";

const { frontmatter, body } = splitFrontmatter(input);

const processor = unified()
  .use(remarkParse)
  .use(remarkMdx)
  .use(smartypants, {
    quotes: true,
    dashes: false,
    ellipses: false,
  })
  .use(remarkStringify);

const processedBody = String(
  await processor.process({ value: body, path: filePath }),
);

process.stdout.write(frontmatter + processedBody);
