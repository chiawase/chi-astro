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

export function prepareOgText(input: string, options: OgTextOptions = {}) {
  const {
    maxLength,
    ellipsis = "...",
    urlEncode = false,
    normalize = "NFC",
  } = options;

  // Remove HTML comments before parsing
  const withoutComments = input.replace(/<!--[\s\S]*?-->/g, "");

  // Markdown -> plain text
  const tree = fromMarkdown(withoutComments);
  let text = toString(tree);

  // Collapse whitespace + trim
  text = text.replace(/\s+/g, " ").trim();

  // Normalize unicode (helps keep composed chars consistent)
  text = text.normalize(normalize);

  // Truncate without splitting emoji / grapheme clusters
  if (typeof maxLength === "number" && maxLength > 0) {
    text = truncateGraphemes(text, maxLength, ellipsis);
  }

  // URL encode for Cloudinary overlay text
  return urlEncode ? encodeURIComponent(text) : text;
}
