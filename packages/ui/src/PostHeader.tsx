import { formatDateLong } from './format'
import { Tag } from './Tag'

export interface PostHeaderData {
  title: string
  description: string
  date: string
  author: string
  tags: string[]
}

export function PostHeader({ post }: { post: PostHeaderData }) {
  return (
    <header className="border-border mb-8 border-b pb-8">
      <h1 className="mb-4 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-5xl font-extrabold text-transparent">
        {post.title}
      </h1>
      <p className="text-muted-foreground mb-4 text-xl">{post.description}</p>
      <div className="text-muted-foreground flex flex-wrap gap-4 text-sm">
        <time dateTime={post.date}>{formatDateLong(post.date)}</time>
        <span>{post.author}</span>
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        {post.tags.map((tag) => (
          <Tag key={tag} label={tag} />
        ))}
      </div>
    </header>
  )
}
