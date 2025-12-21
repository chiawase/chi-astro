// @ts-check

import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";
import { defineConfig } from "astro/config";
import { rehypeHeadingIds } from "@astrojs/markdown-remark";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import remarkToc from "remark-toc";
import { rehypeAccessibleEmojis } from "rehype-accessible-emojis";
import { remarkReadingTime } from "./src/scripts/remark-reading-time.mjs";
import { SITE_URL } from "./src/consts";

// https://astro.build/config
export default defineConfig({
  site: SITE_URL,
  integrations: [mdx(), sitemap()],
  markdown: {
    remarkPlugins: [
      remarkReadingTime,
      [remarkToc, { heading: "toc", maxDepth: 3 }],
    ],
    rehypePlugins: [
      rehypeAccessibleEmojis,
      rehypeHeadingIds,
      [rehypeAutolinkHeadings, { behavior: "append" }],
    ],
  },
});
