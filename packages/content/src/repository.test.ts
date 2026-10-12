import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import { ContentError, createContentRepository } from '../src/index'

const fixturesDir = fileURLToPath(new URL('../__fixtures__', import.meta.url))
const contentDir = path.join(fixturesDir, 'content')
const brokenContentDir = path.join(fixturesDir, 'broken-content')

const repo = createContentRepository(contentDir)
const brokenRepo = createContentRepository(brokenContentDir)

describe('createContentRepository', () => {
  it('resolves an absolute content directory', () => {
    expect(path.isAbsolute(repo.contentDir)).toBe(true)
    expect(repo.contentDir).toContain('fixtures')
  })

  it('throws ContentError when the content directory does not exist', () => {
    const missing = createContentRepository(path.join(fixturesDir, 'does-not-exist'))
    expect(() => missing.getAllCategories()).toThrow(ContentError)
    expect(() => missing.getAllCategories()).toThrow(/Content directory not found/)
  })
})

describe('getAllCategories', () => {
  it('returns only valid category folder names, sorted', () => {
    expect(repo.getAllCategories()).toEqual(['math', 'posts'])
  })

  it('ignores directories with invalid names and plain files', () => {
    // `Invalid_Dir` and `notes.txt` must not show up.
    expect(repo.getAllCategories()).not.toContain('Invalid_Dir')
    expect(repo.getAllCategories()).not.toContain('notes.txt')
  })
})

describe('getAllPosts', () => {
  it('returns all non-draft posts across categories, newest first', () => {
    const posts = repo.getAllPosts()
    expect(posts.map((post) => post.slug)).toEqual(['alpha', 'gamma', 'beta'])
    expect(posts.map((post) => post.category)).toEqual(['math', 'posts', 'math'])
  })

  it('excludes draft posts from listings', () => {
    expect(repo.getAllPosts().some((post) => post.slug === 'draft-note')).toBe(false)
  })

  it('exposes full metadata with defaults applied', () => {
    const alpha = repo.getAllPosts()[0]
    expect(alpha).toMatchObject({
      slug: 'alpha',
      category: 'math',
      title: 'Alpha Post',
      date: '2025-03-01',
      author: 'Test Author',
      tags: ['alpha', 'fixture'],
      draft: false,
    })
  })

  it('applies the tags default when frontmatter omits tags', () => {
    const gamma = repo.getAllPosts().find((post) => post.slug === 'gamma')
    expect(gamma?.tags).toEqual(['gamma'])
  })
})

describe('getPostsByCategory', () => {
  it('returns only that category’s posts, newest first, without drafts', () => {
    expect(repo.getPostsByCategory('math').map((post) => post.slug)).toEqual(['alpha', 'beta'])
    expect(repo.getPostsByCategory('posts').map((post) => post.slug)).toEqual(['gamma'])
  })

  it('returns an empty array for unknown or unsafe categories', () => {
    expect(repo.getPostsByCategory('does-not-exist')).toEqual([])
    expect(repo.getPostsByCategory('../math')).toEqual([])
    expect(repo.getPostsByCategory('Invalid_Dir')).toEqual([])
  })
})

describe('getPostBySlug', () => {
  it('returns a post with the frontmatter stripped from the body', () => {
    const alpha = repo.getPostBySlug('math', 'alpha')
    expect(alpha).not.toBeNull()
    expect(alpha?.title).toBe('Alpha Post')
    expect(alpha?.content).toContain('# Alpha')
    expect(alpha?.content).not.toContain('title: Alpha Post')
    expect(alpha?.content?.startsWith('---')).toBe(false)
  })

  it('returns drafts when requested directly', () => {
    const draft = repo.getPostBySlug('math', 'draft-note')
    expect(draft?.draft).toBe(true)
  })

  it('returns null for unknown posts and categories', () => {
    expect(repo.getPostBySlug('math', 'nope')).toBeNull()
    expect(repo.getPostBySlug('nope', 'alpha')).toBeNull()
  })

  it('rejects path traversal attempts (returns null, never reads outside contentDir)', () => {
    expect(repo.getPostBySlug('..', 'alpha')).toBeNull()
    expect(repo.getPostBySlug('math', '..')).toBeNull()
    expect(repo.getPostBySlug('../../', 'alpha')).toBeNull()
    expect(repo.getPostBySlug('math', '../../../package')).toBeNull()
    expect(repo.getPostBySlug('math', 'alpha/../../posts/gamma')).toBeNull()
  })

  it('rejects uppercase or spaced names', () => {
    expect(repo.getPostBySlug('Math', 'alpha')).toBeNull()
    expect(repo.getPostBySlug('math', 'Alpha Post')).toBeNull()
  })
})

describe('getAllPostPaths', () => {
  it('lists static-gen paths for non-draft posts only', () => {
    expect(repo.getAllPostPaths()).toEqual([
      { category: 'math', slug: 'alpha' },
      { category: 'math', slug: 'beta' },
      { category: 'posts', slug: 'gamma' },
    ])
  })
})

describe('invalid content fails loudly', () => {
  it('throws ContentError for missing required frontmatter fields', () => {
    expect(() => brokenRepo.getPostBySlug('math', 'broken-meta')).toThrow(ContentError)
    expect(() => brokenRepo.getPostBySlug('math', 'broken-meta')).toThrow(/Invalid frontmatter/)
    expect(() => brokenRepo.getPostBySlug('math', 'broken-meta')).toThrow(/author/)
  })

  it('throws ContentError for malformed YAML', () => {
    expect(() => brokenRepo.getPostBySlug('math', 'bad-yaml')).toThrow(ContentError)
    expect(() => brokenRepo.getPostBySlug('math', 'bad-yaml')).toThrow(/Invalid YAML/)
  })

  it('throws when listing a category that contains broken files', () => {
    expect(() => brokenRepo.getPostsByCategory('math')).toThrow(ContentError)
  })

  it('reports the offending file path', () => {
    let caught: unknown
    try {
      brokenRepo.getPostBySlug('math', 'no-meta')
    } catch (error) {
      caught = error
    }
    expect(caught).toBeInstanceOf(ContentError)
    expect((caught as ContentError).filePath).toContain('no-meta.mdx')
  })
})
