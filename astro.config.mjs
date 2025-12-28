import { defineConfig } from "astro/config";

import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";
import { rehypeHeadingIds } from "@astrojs/markdown-remark";

import { SITE_URL } from "./src/consts";

import embeds from "astro-embed/integration";

import remarkToc from "remark-toc";
import remarkRemoveComments from "remark-remove-comments";
import remarkCodeTitle from "remark-code-title";
import wikiLinkPlugin from "@flowershow/remark-wiki-link";

import rehypeAutolinkHeadings from "rehype-autolink-headings";
import { rehypeAccessibleEmojis } from "rehype-accessible-emojis";
import rehypeFigureTitle from "rehype-figure-title";

// https://astro.build/config
export default defineConfig({
  output: "static",
  site: SITE_URL,
  integrations: [
    embeds({
      services: {
        YouTube: true,
      },
    }),
    mdx({
      remarkPlugins: [
        remarkRemoveComments,
        [remarkToc, { heading: "contents", maxDepth: 3 }],
        [
          wikiLinkPlugin,
          {
            format: "shortestPossible",
            urlResolver: (post) => `${post.filePath}/`, // I have to do it like this so it shows with a closing slash
          },
        ],
      ],
      rehypePlugins: [
        rehypeHeadingIds,
        [rehypeAutolinkHeadings, { behavior: "append" }],
        rehypeFigureTitle,
      ],
    }),
    sitemap(),
  ],
  markdown: {
    shikiConfig: {
      themes: {
        light: "github-dark",
        dark: "github-light",
      },
    },
    remarkPlugins: [
      remarkRemoveComments,
      remarkCodeTitle,
      [
        wikiLinkPlugin,
        {
          format: "shortestPossible",
          urlResolver: (post) => `${post.filePath}/`, // I have to do it like this so it shows with a closing slash
        },
      ],
      [remarkToc, { heading: "contents", maxDepth: 3 }],
    ],
    rehypePlugins: [
      rehypeHeadingIds,
      rehypeAccessibleEmojis,
      [
        rehypeAutolinkHeadings,
        {
          behavior: "append",
        },
      ],
      rehypeFigureTitle,
    ],
  },
  experimental: {
    preserveScriptOrder: true,
  },
});
