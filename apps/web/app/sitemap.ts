import type { MetadataRoute } from 'next'
import { getContentRepository } from '@/lib/content'
import { siteUrl } from '@/lib/site'

export default function sitemap(): MetadataRoute.Sitemap {
  const posts = getContentRepository().getAllPosts()

  return [
    {
      url: siteUrl,
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: `${siteUrl}/docs`,
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    ...posts.map((post) => ({
      url: `${siteUrl}/posts/${post.category}/${post.slug}`,
      lastModified: new Date(post.date),
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    })),
  ]
}
