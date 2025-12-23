import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

const blog = defineCollection({
  // Load Markdown and MDX files in the `src/content/blog/` directory.
  loader: glob({ base: "./src/content/blog", pattern: "**/*.{md,mdx}" }),
  // Type-check frontmatter using a schema
  schema: ({ image }) =>
    z.object({
      title: z.string().nullable(),
      description: z.string().nullable(),
      // Transform string to Date object
      pubDate: z.coerce.date(),
      updatedDate: z.coerce.date(),
      heroImage: image().optional(),
      draft: z.boolean().optional().nullable(),
      postLanguage: z.string().optional().nullable(),
      tags: z.array(z.string()).optional(),
    }),
});

export const collections = { blog };
