/** Shared types and errors for the content layer. */

export interface PostMetadata {
  /** File name without extension, e.g. `trigonometry`. */
  slug: string
  /** Parent folder under the content root, e.g. `math`. */
  category: string
  title: string
  description: string
  /** ISO date, `YYYY-MM-DD`. */
  date: string
  author: string
  tags: string[]
  /** Draft posts are excluded from listings, paths and the sitemap. */
  draft: boolean
}

export interface Post extends PostMetadata {
  /** Markdown body (frontmatter stripped). */
  content: string
}

export interface PostPath {
  category: string
  slug: string
}

export interface ContentRepository {
  /** Category folder names (validated, sorted). */
  getAllCategories(): string[]
  /** All non-draft posts, newest first. */
  getAllPosts(): PostMetadata[]
  /** Non-draft posts of one category, newest first. */
  getPostsByCategory(category: string): PostMetadata[]
  /** One post (including drafts) or `null` when missing/invalid path. */
  getPostBySlug(category: string, slug: string): Post | null
  /** Category/slug pairs for static generation (non-draft posts only). */
  getAllPostPaths(): PostPath[]
  /** Absolute path of the content root this repository reads from. */
  readonly contentDir: string
}

/**
 * Raised when content is malformed (missing/invalid frontmatter, unreadable file).
 * Fails the build loudly instead of silently hiding the post.
 */
export class ContentError extends Error {
  readonly filePath?: string

  constructor(message: string, filePath?: string, options?: { cause?: unknown }) {
    super(message, options)
    this.name = 'ContentError'
    this.filePath = filePath
  }
}

/** Category and slug names are strict: lowercase kebab-case, no path separators. */
export const CATEGORY_PATTERN = /^[a-z0-9][a-z0-9-]*$/
export const SLUG_PATTERN = /^[a-z0-9][a-z0-9-]*$/
