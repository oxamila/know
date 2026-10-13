import { describe, expect, it } from 'vitest'
import robots from '../app/robots'
import sitemap from '../app/sitemap'
import { getContentRepository } from './content'
import { siteUrl } from './site'

describe('sitemap', () => {
  const entries = sitemap()

  // Static pages emitted alongside the posts: home + /docs.
  const STATIC_PAGE_COUNT = 2

  it('starts with the site root', () => {
    expect(entries[0]?.url).toBe(siteUrl)
  })

  it('lists the docs page', () => {
    expect(entries.map((entry) => entry.url)).toContain(`${siteUrl}/docs`)
  })

  it('contains an absolute URL for every published post', () => {
    const posts = getContentRepository().getAllPosts()
    const urls = entries.map((entry) => entry.url)
    expect(urls).toHaveLength(posts.length + STATIC_PAGE_COUNT)
    for (const post of posts) {
      expect(urls).toContain(`${siteUrl}/posts/${post.category}/${post.slug}`)
    }
    expect(urls.every((url) => url.startsWith(siteUrl))).toBe(true)
  })

  it('uses deterministic lastModified dates', () => {
    const post = entries.find((entry) => entry.url.includes('/posts/'))
    expect(post?.lastModified).toBeInstanceOf(Date)
    const modified = post?.lastModified
    expect(modified instanceof Date && !Number.isNaN(modified.getTime())).toBe(true)
  })
})

describe('robots', () => {
  it('allows crawling and points at the sitemap', () => {
    const config = robots()
    expect(config.rules).toEqual({ userAgent: '*', allow: '/' })
    expect(config.sitemap).toBe(`${siteUrl}/sitemap.xml`)
  })
})
