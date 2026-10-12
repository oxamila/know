import type { MDXComponents } from 'mdx/types'
import { useMDXComponents as getComponents } from '@repo/mdx/components'

/**
 * Next.js MDX components convention file — applied to every rendered MDX module.
 * https://nextjs.org/docs/app/api-reference/file-conventions/mdx-components
 */
export function useMDXComponents(components: MDXComponents): MDXComponents {
  return getComponents(components)
}
