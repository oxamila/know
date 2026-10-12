import Link from 'next/link'
import { formatDateShort } from './format'
import { Tag } from './Tag'

export interface PostCardData {
  slug: string
  category: string
  title: string
  description: string
  date: string
  author: string
  tags: string[]
}

export function PostCard({ post }: { post: PostCardData }) {
  return (
    <Link href={`/posts/${post.category}/${post.slug}`} aria-label={post.title} className="group">
      <article className="h-full rounded-xl border-2 border-transparent bg-white/80 p-6 shadow-lg backdrop-blur-sm transition-all duration-300 hover:shadow-2xl group-hover:border-blue-500">
        <h3 className="mb-3 text-2xl font-bold text-gray-800 transition-colors group-hover:text-blue-600">
          {post.title}
        </h3>
        <p className="mb-4 line-clamp-3 text-gray-600">{post.description}</p>
        <div className="mb-4 flex items-center gap-4 text-sm text-gray-500">
          <time dateTime={post.date}>{formatDateShort(post.date)}</time>
          <span>{post.author}</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {post.tags.map((tag) => (
            <Tag key={tag} label={tag} />
          ))}
        </div>
      </article>
    </Link>
  )
}
