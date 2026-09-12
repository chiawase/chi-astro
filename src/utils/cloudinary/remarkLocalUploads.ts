import type { Plugin } from "unified";
import { visit } from "unist-util-visit";
import { getManifestUrl } from "./uploader";

type Rewrite = {
  input: string;
  apply: (cloudinaryUrl: string) => void;
};

/*
Since posts using the LightGallery plugin get converted to MDX, this function needs to exist so the JSX prop components (e.g. layout={{ imgs: [ ... ] }}) can live in their own mini JS tree ("estree"), not the markdown tree and be saved to an array so it can be checked like the other image paths laid out in .md and .mdx files
*/
function collectStringLiterals(node: any, out: any[]): void {
  if (!node || typeof node !== "object") return;
  if (node.type === "Literal" && typeof node.value === "string") {
    out.push(node);
    return;
  }

  for (const child of Object.values(node)) {
    if (Array.isArray(child)) {
      for (const item of child) collectStringLiterals(item, out);
    } else if (
      child &&
      typeof child === "object" &&
      typeof (child as any).type === "string"
    ) {
      collectStringLiterals(child, out);
    }
  }
}

// Handles images noted in Markdown and MDX files
export const remarkLocalUploads: Plugin = () => {
  return async (tree: any) => {
    const rewrites: Rewrite[] = [];

    // MDX prints from the saved "raw" copy, not "value", so we need to set this both or else nothing changes
    const collectFromEstree = (estree: any) => {
      const literals: any[] = [];
      collectStringLiterals(estree, literals);
      for (const literal of literals) {
        rewrites.push({
          input: literal.value,
          apply: (url) => {
            literal.value = url;
            literal.raw = JSON.stringify(url);
          },
        });
      }
    };

    visit(tree, (node: any) => {
      if (node.type === "image" && typeof node.url === "string") {
        rewrites.push({
          input: node.url,
          apply: (url) => {
            node.url = url;
          },
        });
        return;
      }

      if (
        node.type === "mdxJsxFlowElement" ||
        node.type === "mdxJsxTextElement"
      ) {
        for (const attr of node.attributes ?? []) {
          if (attr?.type !== "mdxJsxAttribute") continue;

          if (typeof attr.value === "string") {
            rewrites.push({
              input: attr.value,
              apply: (url) => {
                attr.value = url;
              },
            });
          } else if (attr.value?.type === "mdxJsxAttributeValueExpression") {
            collectFromEstree(attr.value.data?.estree);
          }
        }
        return;
      }

      if (
        node.type === "mdxFlowExpression" ||
        node.type === "mdxTextExpression"
      ) {
        collectFromEstree(node.data?.estree);
      }
    });

    for (const { input, apply } of rewrites) {
      // only rewrite local uploads/ references, skip anything already remote
      if (!input || /^https?:\/\//i.test(input)) continue;

      const idx = input.indexOf("uploads/"); // uploads source folder
      if (idx === -1) continue;

      const key = decodeURIComponent(input.slice(idx)); // e.g. "uploads/2026/name.jpg"

      const secureUrl = await getManifestUrl(key);
      if (!secureUrl) {
        console.warn(`[cloudinary] Missing manifest entry for: ${key}`);
        continue;
      }

      apply(secureUrl.replace("/upload/", "/upload/f_auto,q_auto/"));
    }
  };
};
