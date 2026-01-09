import { defineConfig } from "astro/config";

/* From Astro or @astrojs */
import { rehypeHeadingIds } from "@astrojs/markdown-remark";
import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";
import robotsTxt from "astro-robots-txt";

/* my own data sources */
import { SITE_URL } from "./src/consts";
import siteRedirects from "./src/data/redirects";
import { robotsTxtOptions } from "./src/data/robotsTxt";

/* Remark Plugins */
import wikiLinkPlugin from "@flowershow/remark-wiki-link";
import remarkCodeTitle from "remark-code-title";
import remarkRemoveComments from "remark-remove-comments";
import remarkToc from "remark-toc";

/* Rehype Plugins */
import { rehypeAccessibleEmojis } from "rehype-accessible-emojis";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import rehypeFigureTitle from "rehype-figure-title";
import rehypeExternalLinks from "rehype-external-links";

/* Various plugins */
import embeds from "astro-embed/integration";
import icon from "astro-icon";

/* Personal scripts */
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
        rehypeAccessibleEmojis,
        [
          rehypeExternalLinks,
          {
            target: "_blank",
            rel: ["noopener", "noreferrer"],
          },
        ],
        rehypeUploadsToCloudinary,
        rehypeHeadingIds,
        [rehypeAutolinkHeadings, { behavior: "append" }],
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
      rehypeAccessibleEmojis,
      [
        rehypeExternalLinks,
        {
          target: "_blank",
          rel: ["noopener", "noreferrer"],
        },
      ],
      rehypeUploadsToCloudinary,
      rehypeHeadingIds,
      [rehypeAutolinkHeadings, { behavior: "append" }],
      rehypeFigureTitle,
    ],
  },
});
