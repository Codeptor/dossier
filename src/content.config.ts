import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

const blips = defineCollection({
  loader: glob({ pattern: "**/*.mdx", base: "./src/content/blips" }),
  schema: z.object({
    title: z.string(),
    date: z.coerce.date(),
    summary: z.string(),
    tag: z.string(),
    artifact: z.string().optional(),
  }),
});

const broadcasts = defineCollection({
  loader: glob({ pattern: "**/*.mdx", base: "./src/content/broadcasts" }),
  schema: z.object({
    title: z.string(),
    date: z.coerce.date(),
    summary: z.string(),
    tag: z.string(),
    subtitle: z.string().optional(),
    coverImage: z.string().optional(),
    series: z.string().optional(),
    draft: z.boolean().optional().default(false),
  }),
});

export const collections = { blips, broadcasts };
