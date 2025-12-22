import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";
import { defineConfig } from "astro/config";
import { rehypeHeadingIds } from "@astrojs/markdown-remark";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import remarkToc from "remark-toc";
import { rehypeAccessibleEmojis } from "rehype-accessible-emojis";
import { SITE_URL } from "./src/consts";

// https://astro.build/config
export default defineConfig({
  site: SITE_URL,
  integrations: [mdx(), sitemap()],
  markdown: {
    shikiConfig: {
      themes: {
        light: "github-dark",
        dark: "github-light",
      },
    },
    remarkPlugins: [[remarkToc, { heading: "toc", maxDepth: 3 }]],
    rehypePlugins: [
      rehypeHeadingIds,
      rehypeAccessibleEmojis,
      [rehypeAutolinkHeadings, { behavior: "append" }],
    ],
  },
  experimental: {
    preserveScriptOrder: true,
  },
});
