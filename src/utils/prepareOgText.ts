import { fromMarkdown } from "mdast-util-from-markdown";
import { toString } from "mdast-util-to-string";

export type OgTextOptions = {
  maxLength?: number;
  ellipsis?: string;
  urlEncode?: boolean;
  normalize?: "NFC" | "NFD" | "NFKC" | "NFKD";
};

function truncateGraphemes(value: string, max: number, ellipsis: string) {
  // Prefer Intl.Segmenter when available (Node 16+ generally OK)
  if (typeof Intl !== "undefined" && "Segmenter" in Intl) {
    const seg = new Intl.Segmenter(undefined, { granularity: "grapheme" });
    const graphemes = Array.from(seg.segment(value), (s) => s.segment);

    if (graphemes.length <= max) return value;
    return graphemes.slice(0, max).join("") + ellipsis;
  }

  // Fallback: codepoint-safe (better than substring; not perfect for ZWJ emoji sequences)
  const codepoints = Array.from(value);
  if (codepoints.length <= max) return value;
  return codepoints.slice(0, max).join("") + ellipsis;
}

function stripFootnotes(node: any) {
  if (!node) return;

  // If this node has children, remove footnote nodes from them
  if (Array.isArray(node.children)) {
    node.children = node.children.filter(
      (child: any) =>
        child.type !== "footnoteDefinition" &&
        child.type !== "footnoteReference",
    );

    // Recurse
    for (const child of node.children) stripFootnotes(child);
  }
}

export function prepareOgText(input: string, options: OgTextOptions = {}) {
  const {
    maxLength,
    ellipsis = "...",
    urlEncode = false,
    normalize = "NFC",
  } = options;

  // ─────────────────────────────────────────────
  // 1. Strip things that should NEVER appear in excerpts
  // ─────────────────────────────────────────────

  let source = input
    // Remove HTML comments
    .replace(/<!--[\s\S]*?-->/g, "")
    // Remove MDX ESM lines like: import {...} from "...";  or  export {...};
    .replace(/^\s*import[\s\S]*?;\s*$/gim, "")
    .replace(/^\s*export[\s\S]*?;\s*$/gim, "")
    // Remove footnote definition blocks like:
    // [^1]: definition text
    //     continued definition text
    .replace(/^\[\^[^\]]+\]:.*(?:\n(?: {2,}|\t).*)*/gim, "")
    // Remove Astro / MDX embeds entirely
    .replace(/<(YouTube|CodePen|Tweet)\b[\s\S]*?(?:\/>|>[\s\S]*?<\/\1>)/gi, "");

  // ─────────────────────────────────────────────
  // 2. Markdown → AST
  // ─────────────────────────────────────────────

  const tree = fromMarkdown(source);

  // Remove footnote references/definitions before turning AST into text
  stripFootnotes(tree);

  // Preserve block boundaries
  const blockTexts =
    "children" in tree
      ? tree.children.map((node) => toString(node).trim()).filter(Boolean)
      : [toString(tree).trim()];

  let text = blockTexts.join("\n\n");

  // ─────────────────────────────────────────────
  // 3. Format the text properly
  // ─────────────────────────────────────────────
  // Paragraph breaks → " — "
  // Line breaks → space
  text = text.replace(/\n{2,}/g, " / ").replace(/\n/g, " ");

  // Normalize whitespace
  text = text.replace(/\s+/g, " ").trim();

  // Normalize unicode
  text = text.normalize(normalize);

  // Remove inline footnote refs like [^1], [^note], etc.
  text = text.replace(/\[\^[^\]]+\]/g, "");

  // ─────────────────────────────────────────────
  // 4. Truncate safely
  // ─────────────────────────────────────────────
  if (typeof maxLength === "number" && maxLength > 0) {
    text = truncateGraphemes(text, maxLength, ellipsis);
  }

  // URL encode for OG / Cloudinary usage
  return urlEncode ? encodeURIComponent(text) : text;
}
