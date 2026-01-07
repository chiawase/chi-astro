import { defineConfig } from "astro/config";

import { rehypeHeadingIds } from "@astrojs/markdown-remark";
import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";
import robotsTxt from "astro-robots-txt";

import { SITE_URL } from "./src/consts";
import siteRedirects from "./src/data/redirects";
import { robotsTxtOptions } from "./src/data/robotsTxt";

import embeds from "astro-embed/integration";
import icon from "astro-icon";

import wikiLinkPlugin from "@flowershow/remark-wiki-link";
import remarkCodeTitle from "remark-code-title";
import remarkRemoveComments from "remark-remove-comments";
import remarkToc from "remark-toc";

import { rehypeAccessibleEmojis } from "rehype-accessible-emojis";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import rehypeFigureTitle from "rehype-figure-title";

// Personal scripts
import cloudinaryWatch from "./src/utils/cloudinary/watch";
import { remarkCloudinaryLocalUploads } from "./src/utils/cloudinary/remarkLocalUploads";
import { rehypeUploadsToCloudinary } from "./src/utils/cloudinary/rehypeUploadsToCloudinary";

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
        remarkCloudinaryLocalUploads,
        [remarkToc, { heading: "contents", maxDepth: 3 }],
        [wikiLinkPlugin, { format: "regular" }],
      ],
      rehypePlugins: [
        rehypeHeadingIds,
        rehypeAccessibleEmojis,
        [rehypeAutolinkHeadings, { behavior: "append" }],
        rehypeUploadsToCloudinary,
        rehypeFigureTitle,
      ],
    }),
    sitemap(),
    robotsTxt(robotsTxtOptions),
    icon(),
    cloudinaryWatch(),
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
      remarkCloudinaryLocalUploads,
      remarkCodeTitle,
      [wikiLinkPlugin, { format: "regular" }],
      [remarkToc, { heading: "contents", maxDepth: 3 }],
    ],
    rehypePlugins: [
      rehypeHeadingIds,
      rehypeAccessibleEmojis,
      [rehypeAutolinkHeadings, { behavior: "append" }],
      rehypeUploadsToCloudinary,
      rehypeFigureTitle,
    ],
  },
  experimental: {
    preserveScriptOrder: true,
  },
});
