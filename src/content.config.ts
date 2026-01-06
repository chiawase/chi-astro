import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";
import { cldAssetsLoader } from "astro-cloudinary/loaders";

const blog = defineCollection({
  // Load Markdown and MDX files in the `src/content/blog/` directory.
  loader: glob({ base: "./src/content/blog", pattern: "**/*.{md,mdx}" }),
  // Type-check frontmatter using a schema
  schema: ({ image }) =>
    z.object({
      title: z.string().nullable(),
      summary: z.string().optional().nullable(),
      // Transform string to Date object
      pubDate: z.coerce.date(),
      updatedDate: z.coerce.date(),
      heroImage: image().optional(),
      draft: z.boolean().optional().nullable(),
      postLanguage: z.string().optional().nullable(),
      tags: z.array(z.string()).optional(),
    }),
});

const archive = defineCollection({
  // Load Markdown and MDX files in the `src/content/archive/` directory.
  loader: glob({ base: "./src/content/archive", pattern: "**/*.{md,mdx}" }),
  // Type-check frontmatter using a schema
  schema: z.object({
    title: z.string().optional().nullable(),
    summary: z.string().optional().nullable(),
    // Transform string to Date object
    date: z.coerce.date(),
    tags: z.array(z.string()).optional(),
  }),
});

const games = defineCollection({
  loader: glob({ base: "./src/content/games", pattern: "**/*.{md,mdx}" }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      url: z.string().url(),
      platform: z.string(),
      gameImage: image(),
      tags: z.array(z.string()).optional(),
      startedPlayingDate: z.coerce.date(),
      lastPlayedDate: z.coerce.date(),
      status: z.enum(["completed", "playing", "paused", "dropped"]),
    }),
});

const assets = defineCollection({
  loader: cldAssetsLoader(),
});

export const collections = { blog, archive, games, assets };
