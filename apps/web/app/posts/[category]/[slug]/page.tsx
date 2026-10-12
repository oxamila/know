import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { Suspense } from 'react'
import { PostHeader } from '@repo/ui'
import { getContentRepository } from '@/lib/content'
import { MdxContent } from './mdx-content'

interface PostPageProps {
  params: Promise<{
    category: string
    slug: string
  }>
}

export async function generateStaticParams(): Promise<{ category: string; slug: string }[]> {
  return getContentRepository().getAllPostPaths()
}

export async function generateMetadata({ params }: PostPageProps): Promise<Metadata> {
  const { category, slug } = await params
  const post = getContentRepository().getPostBySlug(category, slug)
  if (!post) return {}

  return {
    title: post.title,
    description: post.description,
    keywords: post.tags,
    authors: [{ name: post.author }],
    openGraph: {
      type: 'article',
      title: post.title,
      description: post.description,
      publishedTime: post.date,
      authors: [post.author],
      tags: post.tags,
    },
  }
}

function PostBodySkeleton() {
  return (
    <div className="animate-pulse space-y-4 py-4" aria-busy="true" aria-label="Loading post body">
      <div className="h-8 w-2/3 rounded bg-gray-200" />
      <div className="h-4 w-full rounded bg-gray-200" />
      <div className="h-4 w-11/12 rounded bg-gray-200" />
      <div className="h-64 w-full rounded-xl bg-gray-200" />
      <div className="h-4 w-4/5 rounded bg-gray-200" />
    </div>
  )
}

export default async function PostPage({ params }: PostPageProps) {
  const { category, slug } = await params
  const post = getContentRepository().getPostBySlug(category, slug)

  if (!post) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50">
      <div className="mx-auto max-w-4xl px-6 py-12">
        <article className="rounded-2xl bg-white/80 p-8 shadow-2xl backdrop-blur-sm md:p-12">
          <PostHeader
            post={{
              title: post.title,
              description: post.description,
              date: post.date,
              author: post.author,
              tags: post.tags,
            }}
          />
          <div className="prose prose-lg max-w-none">
            <Suspense fallback={<PostBodySkeleton />}>
              <MdxContent category={category} slug={slug} />
            </Suspense>
          </div>
        </article>
      </div>
    </div>
  )
}
