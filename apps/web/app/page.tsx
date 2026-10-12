import { PostCard } from '@repo/ui'
import { getContentRepository } from '@/lib/content'
import { groupPostsByCategory } from '@/lib/group'

export default function HomePage() {
  const repository = getContentRepository()
  const posts = repository.getAllPosts()
  const groups = groupPostsByCategory(posts)

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50">
      <div className="mx-auto max-w-6xl px-6 py-12">
        <header className="mb-12 text-center">
          <h1 className="mb-4 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-6xl font-extrabold text-transparent">
            Know
          </h1>
          <p className="text-xl text-gray-600">Explore knowledge organized by category</p>
        </header>

        {groups.map(([category, categoryPosts]) => (
          <section key={category} className="mb-12">
            <h2 className="mb-6 inline-block border-b-4 border-blue-500 pb-3 text-3xl font-bold capitalize text-gray-800">
              {category}
            </h2>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {categoryPosts.map((post) => (
                <PostCard key={`${post.category}-${post.slug}`} post={post} />
              ))}
            </div>
          </section>
        ))}

        {posts.length === 0 && (
          <div className="py-12 text-center text-gray-500">
            <p className="text-xl">No posts yet. Start creating content!</p>
          </div>
        )}
      </div>
    </div>
  )
}
