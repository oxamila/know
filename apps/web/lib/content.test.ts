import { describe, expect, it } from 'vitest'
import { getContentRepository } from './content'

describe('getContentRepository', () => {
  const repository = getContentRepository()

  it('resolves the real content directory inside the app', () => {
    expect(repository.contentDir.replaceAll('\\', '/')).toMatch(/apps\/web\/content$/)
  })

  it('finds the content categories', () => {
    const categories = repository.getAllCategories()
    expect(categories).toContain('math')
    expect(categories).toContain('posts')
  })

  it('parses every post with valid metadata (content integrity gate)', () => {
    const posts = repository.getAllPosts()
    expect(posts.length).toBeGreaterThanOrEqual(9)
    for (const post of posts) {
      expect(post.title.length).toBeGreaterThan(0)
      expect(post.date).toMatch(/^\d{4}-\d{2}-\d{2}$/)
      expect(post.author.length).toBeGreaterThan(0)
    }
  })

  it('regression: desmos-style-3d is listed (was a silent 404 before)', () => {
    const slugs = repository.getPostsByCategory('math').map((post) => post.slug)
    expect(slugs).toContain('desmos-style-3d')
  })

  it('returns full bodies for rendering', () => {
    const post = repository.getPostBySlug('math', 'math')
    expect(post).not.toBeNull()
    expect(post?.content).toContain('The Sine Wave')
  })

  it('returns null for unknown posts instead of throwing', () => {
    expect(repository.getPostBySlug('math', 'does-not-exist')).toBeNull()
    expect(repository.getPostBySlug('unknown', 'math')).toBeNull()
  })
})
