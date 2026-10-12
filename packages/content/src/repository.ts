import fs from 'node:fs'
import path from 'node:path'
import matter from 'gray-matter'
import { postFrontmatterSchema } from './schema'
import {
  CATEGORY_PATTERN,
  ContentError,
  SLUG_PATTERN,
  type ContentRepository,
  type Post,
  type PostMetadata,
} from './types'

/**
 * Creates a content repository rooted at `contentDir`.
 *
 * Layout: `<contentDir>/<category>/<slug>.mdx` with YAML frontmatter.
 * All functions are synchronous — they run at build/request time on the server.
 */
export function createContentRepository(contentDir: string): ContentRepository {
  const absoluteDir = path.resolve(contentDir)

  function assertDir(): void {
    if (!fs.existsSync(absoluteDir) || !fs.statSync(absoluteDir).isDirectory()) {
      throw new ContentError(`Content directory not found: ${absoluteDir}`)
    }
  }

  /** Reads and validates a single post. Returns `null` for unsafe paths or missing files. */
  function readPost(category: string, slug: string): Post | null {
    if (!CATEGORY_PATTERN.test(category) || !SLUG_PATTERN.test(slug)) return null

    const filePath = path.join(absoluteDir, category, `${slug}.mdx`)
    if (!fs.existsSync(filePath)) return null

    let raw: string
    try {
      raw = fs.readFileSync(filePath, 'utf8')
    } catch (cause) {
      throw new ContentError(`Unable to read content file: ${filePath}`, filePath, { cause })
    }

    let parsed: matter.GrayMatterFile<string>
    try {
      // Passing any options object bypasses gray-matter's string cache: it
      // stores the file object BEFORE parsing, so a failed parse would poison
      // later calls (they would silently return empty data instead of throwing).
      // `language: 'yaml'` is our content format; the side effect is the fix.
      parsed = matter(raw, { language: 'yaml' })
    } catch (cause) {
      throw new ContentError(
        `Invalid YAML frontmatter in ${category}/${slug}.mdx — ${String(
          cause instanceof Error ? cause.message : cause,
        )}`,
        filePath,
        { cause },
      )
    }

    const result = postFrontmatterSchema.safeParse(parsed.data)
    if (!result.success) {
      const issues = result.error.issues
        .map((issue) => `${issue.path.join('.') || '(root)'}: ${issue.message}`)
        .join('; ')
      throw new ContentError(`Invalid frontmatter in ${category}/${slug}.mdx — ${issues}`, filePath)
    }

    return {
      slug,
      category,
      ...result.data,
      content: parsed.content,
    }
  }

  function listCategories(): string[] {
    assertDir()
    return fs
      .readdirSync(absoluteDir, { withFileTypes: true })
      .filter((entry) => entry.isDirectory() && CATEGORY_PATTERN.test(entry.name))
      .map((entry) => entry.name)
      .sort()
  }

  function listSlugs(category: string): string[] {
    if (!CATEGORY_PATTERN.test(category)) return []
    const categoryPath = path.join(absoluteDir, category)
    if (!fs.existsSync(categoryPath)) return []
    return fs
      .readdirSync(categoryPath, { withFileTypes: true })
      .filter((entry) => entry.isFile() && entry.name.endsWith('.mdx'))
      .map((entry) => entry.name.replace(/\.mdx$/, ''))
      .filter((slug) => SLUG_PATTERN.test(slug))
      .sort()
  }

  function getPostsByCategory(category: string): PostMetadata[] {
    return listSlugs(category)
      .map((slug) => readPost(category, slug))
      .filter((post): post is Post => post !== null)
      .filter((post) => !post.draft)
      .sort((a, b) => b.date.localeCompare(a.date))
  }

  return {
    contentDir: absoluteDir,

    getAllCategories(): string[] {
      return listCategories()
    },

    getAllPosts(): PostMetadata[] {
      return listCategories()
        .flatMap((category) => getPostsByCategory(category))
        .sort((a, b) => b.date.localeCompare(a.date))
    },

    getPostsByCategory,

    getPostBySlug(category: string, slug: string): Post | null {
      return readPost(category, slug)
    },

    getAllPostPaths() {
      return listCategories().flatMap((category) =>
        getPostsByCategory(category).map((post) => ({ category, slug: post.slug })),
      )
    },
  }
}
