import { fromMarkdown } from "mdast-util-from-markdown";
import { toString } from "mdast-util-to-string";

export function createExcerpt(markdown: string) {
  // Remove HTML comments before parsing
  const withoutComments = markdown.replace(/<!--[\s\S]*?-->/g, "");

  const tree = fromMarkdown(withoutComments);
  const text = toString(tree);

  return text.split(/\s+/).join(" ");
}
