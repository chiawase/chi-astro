import { defineConfig } from "astro/config";

import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";
import { rehypeHeadingIds } from "@astrojs/markdown-remark";
import robotsTxt from "astro-robots-txt";

import { SITE_URL, SITE_DOMAIN } from "./src/consts";

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
        [wikiLinkPlugin, { format: "regular" }],
      ],
      rehypePlugins: [
        rehypeHeadingIds,
        rehypeAccessibleEmojis,
        [rehypeAutolinkHeadings, { behavior: "append" }],
        rehypeFigureTitle,
      ],
    }),
    sitemap(),
    robotsTxt({
      host: SITE_DOMAIN,
      policy: [
        {
          userAgent: "*",
          allow: "/",
        },
        {
          userAgent: "GPTBot",
          disallow: "/",
        },
        {
          userAgent: "ChatGPT-User",
          disallow: "/",
        },
        {
          userAgent: "Google-Extended",
          disallow: "/",
        },
        {
          userAgent: "PerplexityBot",
          disallow: "/",
        },
        {
          userAgent: "Amazonbot",
          disallow: "/",
        },
        {
          userAgent: "ClaudeBot",
          disallow: "/",
        },
        {
          userAgent: "Omgilibot",
          disallow: "/",
        },
        {
          userAgent: "FacebookBot",
          disallow: "/",
        },
        {
          userAgent: "Applebot",
          disallow: "/",
        },
        {
          userAgent: "anthropic-ai",
          disallow: "/",
        },
        {
          userAgent: "Bytespider",
          disallow: "/",
        },
        {
          userAgent: "Claude-Web",
          disallow: "/",
        },
        {
          userAgent: "Diffbot",
          disallow: "/",
        },
        {
          userAgent: "ImagesiftBot",
          disallow: "/",
        },
        {
          userAgent: "Omgili",
          disallow: "/",
        },
        {
          userAgent: "YouBot",
          disallow: "/",
        },
      ],
    }),
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
      [wikiLinkPlugin, { format: "regular" }],
      [remarkToc, { heading: "contents", maxDepth: 3 }],
    ],
    rehypePlugins: [
      rehypeHeadingIds,
      rehypeAccessibleEmojis,
      [rehypeAutolinkHeadings, { behavior: "append" }],
      rehypeFigureTitle,
    ],
  },
  experimental: {
    preserveScriptOrder: true,
  },
});
