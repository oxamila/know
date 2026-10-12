/**
 * Post frontmatter schema — single source of truth for content metadata.
 *
 * Every `content/<category>/<slug>.mdx` file MUST start with YAML frontmatter
 * matching this schema. Invalid content fails the build loudly (no silent drops).
 */
import { z } from 'zod'

export const postFrontmatterSchema = z.object({
  title: z.string().trim().min(1),
  description: z.string().trim().min(1),
  // Unquoted YAML dates (date: 2025-01-20) are parsed as Date objects by
  // js-yaml; quoted ones stay strings. Accept both, normalize to YYYY-MM-DD.
  date: z
    .union([z.iso.date(), z.date().transform((value) => value.toISOString().slice(0, 10))])
    .refine((value) => /^\d{4}-\d{2}-\d{2}$/.test(value), 'date must be YYYY-MM-DD'),
  author: z.string().trim().min(1),
  tags: z.array(z.string().trim().min(1)).default([]),
  draft: z.boolean().default(false),
})

export type PostFrontmatter = z.infer<typeof postFrontmatterSchema>
