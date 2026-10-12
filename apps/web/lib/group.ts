/**
 * Groups posts by category, preserving newest-first order inside each group.
 * Returns `[category, posts]` pairs sorted alphabetically, skipping empty groups.
 */
export function groupPostsByCategory<T extends { category: string }>(
  posts: readonly T[],
): [string, T[]][] {
  const groups = new Map<string, T[]>()
  for (const post of posts) {
    const bucket = groups.get(post.category)
    if (bucket) {
      bucket.push(post)
    } else {
      groups.set(post.category, [post])
    }
  }
  return [...groups.entries()].sort(([a], [b]) => a.localeCompare(b))
}
