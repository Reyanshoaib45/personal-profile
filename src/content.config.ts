import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

/**
 * Long-form case studies.
 *
 * Add a file to src/content/case-studies/ and it becomes a page at
 * /work/<filename>/ — no route changes needed. The `slug` is the filename
 * without its extension.
 */
const caseStudies = defineCollection({
  loader: glob({ base: './src/content/case-studies', pattern: '**/*.md' }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      description: z.string().max(300),
      client: z.string(),
      sector: z.string(),
      period: z.string(),
      role: z.string(),
      status: z.string().default('Live in production'),
      deck: z.string(),
      metrics: z
        .array(
          z.object({
            value: z.string(),
            label: z.string(),
            note: z.string().optional(),
          }),
        )
        .min(1)
        .max(4),
      stack: z.array(z.string()).default([]),
      publishedAt: z.coerce.date(),
      updatedAt: z.coerce.date().optional(),
      draft: z.boolean().default(false),
      /** Optional social/OG image, resolved and optimised by Astro. */
      cover: image().optional(),
      coverAlt: z.string().optional(),
    }),
});

export const collections = { caseStudies };
