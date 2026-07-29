import process from "node:process";

async function readStdin() {
  const chunks = [];
  for await (const chunk of process.stdin) chunks.push(chunk);
  return Buffer.concat(chunks).toString("utf8");
}

/**
 * Split off YAML/TOML frontmatter if present, preserving it verbatim.
 * Supports:
 *  --- yaml ---
 *  +++ toml +++
 */
function splitFrontmatter(input) {
  const startsWithYaml =
    input.startsWith("---\n") || input.startsWith("---\r\n");
  const startsWithToml =
    input.startsWith("+++\n") || input.startsWith("+++\r\n");

  const fence = startsWithYaml ? "---" : startsWithToml ? "+++" : null;
  if (!fence) return { frontmatter: "", body: input };

  const re = new RegExp(
    `^(\\${fence}\\r?\\n)([\\s\\S]*?)(\\r?\\n\\${fence})(\\r?\\n|$)`,
  );

  const m = input.match(re);
  if (!m) return { frontmatter: "", body: input };

  const fullFrontmatter = m[1] + m[2] + m[3] + (m[4] ?? "");
  const rest = input.slice(fullFrontmatter.length);
  return { frontmatter: fullFrontmatter, body: rest };
}

function isWordChar(ch) {
  return !!ch && /[A-Za-z0-9]/.test(ch);
}
function isWhitespace(ch) {
  return ch === " " || ch === "\t" || ch === "\n" || ch === "\r";
}
function isOpeningContext(prev) {
  return (
    !prev ||
    isWhitespace(prev) ||
    /[\(\[\{\u2014\u2013\-–—]/.test(prev) ||
    /[>]/.test(prev)
  );
}

/**
 * Smarten straight quotes inside a plain-text segment only.
 */
function smartenQuotesInTextSegment(text) {
  let out = "";
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    const prev = i > 0 ? text[i - 1] : "";
    const next = i + 1 < text.length ? text[i + 1] : "";

    if (ch === '"') {
      out += isOpeningContext(prev) ? "“" : "”";
      continue;
    }

    if (ch === "'") {
      if (isWordChar(prev) && isWordChar(next)) {
        out += "’";
        continue;
      }

      if (isOpeningContext(prev) && isWordChar(next)) {
        out += /[0-9]/.test(next) ? "’" : "‘";
        continue;
      }

      out += "’";
      continue;
    }

    out += ch;
  }
  return out;
}

function atLineStart(input, idx) {
  if (idx === 0) return true;
  const prev = input[idx - 1];
  return prev === "\n" || prev === "\r";
}

function getLineStart(input, idx) {
  let i = idx;
  while (i > 0 && input[i - 1] !== "\n" && input[i - 1] !== "\r") i--;
  return i;
}

function getLineEnd(input, idx) {
  let i = idx;
  while (i < input.length && input[i] !== "\n" && input[i] !== "\r") i++;
  return i;
}

function isImportOrExportLine(input, idx) {
  const lineStart = getLineStart(input, idx);
  const lineEnd = getLineEnd(input, idx);
  const line = input.slice(lineStart, lineEnd).trimStart();
  return line.startsWith("import ") || line.startsWith("export ");
}

function looksLikeTagStart(input, idx) {
  const next = input[idx + 1] ?? "";
  return /[A-Za-z/!?]/.test(next);
}

function consumeTag(input, startIdx) {
  let i = startIdx;
  let out = "";
  let quote = "";

  while (i < input.length) {
    const ch = input[i];
    out += ch;

    if (quote) {
      if (ch === "\\") {
        const nxt = input[i + 1];
        if (nxt) {
          out += nxt;
          i += 2;
          continue;
        }
      }
      if (ch === quote) quote = "";
      i++;
      continue;
    } else {
      if (ch === '"' || ch === "'") {
        quote = ch;
        i++;
        continue;
      }
      if (ch === ">") {
        i++;
        break;
      }
      i++;
    }
  }

  return { chunk: out, newIndex: i };
}

function consumeBracedExpression(input, startIdx) {
  let i = startIdx;
  let out = "";
  let depth = 0;
  let str = "";
  let escaped = false;

  while (i < input.length) {
    const ch = input[i];
    out += ch;

    if (escaped) {
      escaped = false;
      i++;
      continue;
    }

    if (str) {
      if (ch === "\\") {
        escaped = true;
        i++;
        continue;
      }
      if (ch === str) {
        str = "";
        i++;
        continue;
      }
      i++;
      continue;
    } else {
      if (ch === "'" || ch === '"' || ch === "`") {
        str = ch;
        i++;
        continue;
      }
      if (ch === "{") {
        depth++;
        i++;
        continue;
      }
      if (ch === "}") {
        depth--;
        i++;
        if (depth <= 0) break;
        continue;
      }
      i++;
    }
  }

  return { chunk: out, newIndex: i };
}

function consumeLinkOrImageParen(input, startIdx) {
  let i = startIdx;
  let out = "";
  let depth = 0;
  let quote = "";
  let escaped = false;

  while (i < input.length) {
    const ch = input[i];
    out += ch;

    if (escaped) {
      escaped = false;
      i++;
      continue;
    }

    if (ch === "\\") {
      escaped = true;
      i++;
      continue;
    }

    if (quote) {
      if (ch === quote) quote = "";
      i++;
      continue;
    }

    if (ch === '"' || ch === "'") {
      quote = ch;
      i++;
      continue;
    }

    if (ch === "(") depth++;
    if (ch === ")") {
      depth--;
      i++;
      if (depth <= 0) break;
      continue;
    }

    i++;
  }

  return { chunk: out, newIndex: i };
}

function smartenQuotesPreserveMarkdown(input) {
  let i = 0;
  let out = "";

  let inFencedCode = false;
  let fenceSeq = "";

  let inInlineCode = false;
  let inlineTickCount = 0;

  let textBuf = "";
  const flushText = () => {
    if (!textBuf) return;
    out += smartenQuotesInTextSegment(textBuf);
    textBuf = "";
  };

  while (i < input.length) {
    // Ignore full import/export lines
    if (atLineStart(input, i) && isImportOrExportLine(input, i)) {
      flushText();
      const lineEnd = getLineEnd(input, i);
      out += input.slice(i, lineEnd);
      i = lineEnd;
      continue;
    }

    // Fenced code blocks
    if (!inInlineCode && atLineStart(input, i)) {
      const three = input.slice(i, i + 3);
      if (!inFencedCode && (three === "```" || three === "~~~")) {
        flushText();
        inFencedCode = true;
        fenceSeq = three;

        const lineEnd = getLineEnd(input, i);
        out += input.slice(i, lineEnd);
        i = lineEnd;
        continue;
      }

      if (inFencedCode && three === fenceSeq) {
        const lineEnd = getLineEnd(input, i);
        out += input.slice(i, lineEnd);
        i = lineEnd;
        inFencedCode = false;
        fenceSeq = "";
        continue;
      }
    }

    if (inFencedCode) {
      out += input[i++];
      continue;
    }

    // Inline code
    if (input[i] === "`") {
      let j = i;
      while (input[j] === "`") j++;
      const tickCount = j - i;

      flushText();
      out += input.slice(i, j);
      i = j;

      inInlineCode = !inInlineCode;
      inlineTickCount = tickCount;
      continue;
    }

    if (inInlineCode) {
      out += input[i++];
      continue;
    }

    // JSX / HTML tags
    if (input[i] === "<" && looksLikeTagStart(input, i)) {
      flushText();
      const { chunk, newIndex } = consumeTag(input, i);
      out += chunk;
      i = newIndex;
      continue;
    }

    // MDX / JS expressions
    if (input[i] === "{") {
      flushText();
      const { chunk, newIndex } = consumeBracedExpression(input, i);
      out += chunk;
      i = newIndex;
      continue;
    }

    // Preserve link/image destination + title, e.g. ](url "title")
    if (input[i] === "(" && i > 0 && input[i - 1] === "]") {
      flushText();
      const { chunk, newIndex } = consumeLinkOrImageParen(input, i);
      out += chunk;
      i = newIndex;
      continue;
    }

    textBuf += input[i++];
  }

  flushText();
  return out;
}

// ---- main ----
const input = await readStdin();
const { frontmatter, body } = splitFrontmatter(input);
const processedBody = smartenQuotesPreserveMarkdown(body);
process.stdout.write(frontmatter + processedBody);
