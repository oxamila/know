import createMDX from '@next/mdx'
import { rehypePluginSpecs, remarkPluginSpecs } from '@repo/mdx/plugin-specs'

/** @type {import('next').NextConfig} */
const nextConfig = {
  pageExtensions: ['js', 'jsx', 'mdx', 'ts', 'tsx'],
  transpilePackages: ['@repo/content', '@repo/mdx', '@repo/math-viz', '@repo/ui'],
}

// Plugin specs are plain serializable strings/options — required because
// Turbopack passes loader options across its Rust/JS boundary.
const withMDX = createMDX({
  options: {
    remarkPlugins: remarkPluginSpecs,
    rehypePlugins: rehypePluginSpecs,
  },
})

export default withMDX(nextConfig)
