/**
 * Serializable MDX plugin specs — the single source of truth for the pipeline.
 *
 * String module specifiers (instead of function references) so Turbopack can
 * serialize them into @next/mdx loader options; mdx-js-loader resolves each
 * specifier from the project root when it runs. Plain objects only.
 *
 * Order matters:
 *   1. remark-frontmatter — parse (and remove) YAML frontmatter
 *   2. remark-gfm         — tables, task lists, strikethrough, autolinks
 *   3. remark-math        — $…$ / $$…$$ / ```math syntax → math nodes
 *   4. rehype-katex       — math nodes → KaTeX HTML (compile-time, no client JS)
 */

/** @type {Array<string | [string, Record<string, unknown>]>} */
export const remarkPluginSpecs = [
  'remark-frontmatter',
  'remark-gfm',
  ['remark-math', { singleDollarTextMath: true }],
]

/** @type {string[]} */
export const rehypePluginSpecs = ['rehype-katex']
