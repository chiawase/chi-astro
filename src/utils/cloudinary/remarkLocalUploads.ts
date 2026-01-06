import type { Plugin } from "unified";
import { visit } from "unist-util-visit";
import path from "node:path";
import { getManifestUrl } from "./uploader";

function toPosix(p: string) {
  return p.split(path.sep).join("/");
}

// Handles Markdown images: ![](./src/content/img/uploads/2026/foo.jpg) or similar
export const remarkCloudinaryLocalUploads: Plugin = () => {
  return async (tree: any) => {
    const nodes: any[] = [];

    visit(tree, "image", (node) => nodes.push(node));
    // If you also want to rewrite raw links in MDX/HTML, you can add more visitors later.

    for (const node of nodes) {
      const url: string = node.url;
      if (!url) continue;

      // Normalize different ways the path might appear from Obsidian / your content
      // We only rewrite anything containing /uploads/
      const idx = url.lastIndexOf("/uploads/");
      if (idx === -1) continue;

      const localRel = toPosix(url.slice(idx + 1)); // "uploads/2026/foo.jpg"
      const cld = await getManifestUrl(localRel);

      if (cld) {
        // Optional: bake in default Cloudinary optimizations at delivery time
        // Cloudinary supports automatic format/quality params; see their docs. :contentReference[oaicite:7]{index=7}
        const optimized = cld.replace("/upload/", "/upload/f_auto,q_auto/");
        node.url = optimized;
      }
    }
  };
};
