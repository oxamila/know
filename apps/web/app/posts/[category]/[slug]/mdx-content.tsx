'use client'

import { use, type ComponentType } from 'react'

interface MdxContentProps {
  category: string
  slug: string
}

type MDXModule = { default: ComponentType }

// Client-side dynamic import: MDX bodies pass functions (plot closures) to
// client components like MathGraph, which is illegal across the RSC boundary.
// Loading the module INSIDE the client graph keeps those props legal while
// React still server-renders this component into the static HTML (SEO/no-JS).
// Cache per module so use() never sees a fresh promise after hydration.
const moduleCache = new Map<string, Promise<MDXModule>>()

function loadMdx(category: string, slug: string): Promise<MDXModule> {
  const key = `${category}/${slug}`
  let pending = moduleCache.get(key)
  if (!pending) {
    pending = import(`@/content/${category}/${slug}.mdx`)
    moduleCache.set(key, pending)
  }
  return pending
}

export function MdxContent({ category, slug }: MdxContentProps) {
  const mdx = use(loadMdx(category, slug))
  const Content = mdx.default
  return <Content />
}
