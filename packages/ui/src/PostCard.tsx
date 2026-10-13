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
      <article className="bg-card text-card-foreground ring-foreground/10 hover:ring-primary/60 flex h-full flex-col rounded-xl py-6 ring-1 transition-all duration-300 hover:shadow-lg">
        <h3 className="group-hover:text-primary mb-3 px-6 text-2xl font-bold transition-colors">
          {post.title}
        </h3>
        <p className="text-muted-foreground mb-4 line-clamp-3 px-6">{post.description}</p>
        <div className="text-muted-foreground mb-4 flex items-center gap-4 px-6 text-sm">
          <time dateTime={post.date}>{formatDateShort(post.date)}</time>
          <span>{post.author}</span>
        </div>
        <div className="mt-auto flex flex-wrap gap-2 px-6">
          {post.tags.map((tag) => (
            <Tag key={tag} label={tag} />
          ))}
        </div>
      </article>
    </Link>
  )
}
