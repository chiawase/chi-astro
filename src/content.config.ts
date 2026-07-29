import { defineCollection } from "astro:content";
import { z } from "astro/zod";
import { glob } from "astro/loaders";

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
  schema: ({ image }) =>
    z.object({
      title: z.string().optional().nullable(),
      summary: z.string().optional().nullable(),
      // Transform string to Date object
      date: z.coerce.date(),
      tags: z.array(z.string()).optional(),
      source: z.enum(["wordpress", "microblog", "tumblr"]).optional(),
      heroImage: image().optional(),
      wpPostId: z.number().optional(),
      originalUrl: z.string().url().optional().nullable(),
      draft: z.boolean().optional().nullable(),
    }),
});

const archiveIntros = defineCollection({
  loader: glob({ base: "./src/content/archive-intros", pattern: "*.{md,mdx}" }),
});

const games = defineCollection({
  loader: glob({ base: "./src/content/games", pattern: "**/*.{md,mdx}" }),
  schema: z.object({
    title: z.string(),
    url: z.url(),
    platform: z.string(),
    gameImage: z.string().optional(),
    tags: z.array(z.string()).optional(),
    startedPlayingDate: z.coerce.date(),
    lastPlayedDate: z.coerce.date(),
    status: z.enum(["completed", "playing", "paused", "dropped"]),
  }),
});

const manga = defineCollection({
  loader: glob({ base: "./src/content/manga", pattern: "**/*.{md,mdx}" }),
  schema: z.object({
    title: z.string(),
    url: z.url(),
    mangaCover: z.string().optional(),
    tags: z.array(z.string()).optional(),
    latestChapter: z.string(),
    lastReadDate: z.coerce.date(),
    status: z.enum(["reading", "finished", "dropped"]),
  }),
});

export const collections = { blog, archive, archiveIntros, games, manga };
