import { defineConfig } from "astro/config";

import { rehypeHeadingIds } from "@astrojs/markdown-remark";
import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";
import robotsTxt from "astro-robots-txt";

import { SITE_DOMAIN, SITE_URL } from "./src/consts";
import siteRedirects from "./src/data/redirects";

import embeds from "astro-embed/integration";

import wikiLinkPlugin from "@flowershow/remark-wiki-link";
import remarkCodeTitle from "remark-code-title";
import remarkRemoveComments from "remark-remove-comments";
import remarkToc from "remark-toc";

import { rehypeAccessibleEmojis } from "rehype-accessible-emojis";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import rehypeFigureTitle from "rehype-figure-title";

import icon from "astro-icon";

// https://astro.build/config
export default defineConfig({
  output: "static",
  site: SITE_URL,
  trailingSlash: "always",
  redirects: siteRedirects,
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
    icon(),
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
