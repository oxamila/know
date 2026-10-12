import { compile, run } from '@mdx-js/mdx'
import type { MDXComponents } from 'mdx/types'
import { describe, expect, it } from 'vitest'
import * as runtime from 'react/jsx-runtime'
import { renderToStaticMarkup } from 'react-dom/server'
import { useMDXComponents } from './components'
import { rehypePlugins, remarkPlugins } from '../plugins.mjs'

async function renderMDX(source: string, components?: MDXComponents): Promise<string> {
  // run() evals a function body, so compile must not emit import/export statements.
  const compiled = await compile(source, {
    remarkPlugins,
    rehypePlugins,
    outputFormat: 'function-body',
  })
  const module = await run(compiled, { ...runtime })
  return renderToStaticMarkup(<module.default components={components ?? {}} />)
}

describe('remark/rehype pipeline', () => {
  it('strips YAML frontmatter instead of rendering it', async () => {
    const html = await renderMDX(`---\ntitle: Secret Title\ndate: 2025-01-01\n---\n\n# Heading\n`)
    expect(html).toContain('<h1')
    expect(html).not.toContain('Secret Title')
    expect(html).not.toContain('---')
  })

  it('renders inline $…$ math with KaTeX at compile time', async () => {
    const html = await renderMDX('Euler: $e^{i\\pi} + 1 = 0$')
    expect(html).toContain('class="katex"')
    expect(html).toContain('katex-html')
  })

  it('renders $$…$$ display math as a centered block', async () => {
    const html = await renderMDX('$$\n\\int_0^\\infty e^{-x^2}\\,dx = \\frac{\\sqrt{\\pi}}{2}\n$$')
    expect(html).toContain('katex-display')
    expect(html).toContain('class="katex"')
  })

  it('renders fenced ```math blocks as display math', async () => {
    const html = await renderMDX('```math\na^2 + b^2 = c^2\n```')
    expect(html).toContain('katex-display')
  })

  it('renders GFM tables', async () => {
    const html = await renderMDX('| Left | Right |\n| --- | --- |\n| 1 | 2 |\n')
    expect(html).toContain('<table>')
    expect(html).toContain('<td')
  })

  it('renders GFM task lists', async () => {
    const html = await renderMDX('- [x] done\n- [ ] todo\n')
    expect(html).toContain('checkbox')
  })

  it('surfaces broken LaTeX as a visible error instead of crashing the build', async () => {
    // rehype-katex retries ParseErrors with throwOnError: false, which renders
    // the invalid source in the error color (#cc0000) inside valid KaTeX markup.
    const html = await renderMDX('$$\n\\thisIsNotARealCommand\n$$')
    expect(html).toContain('class="katex')
    expect(html).toContain('#cc0000')
    expect(html).toContain('thisIsNotARealCommand')
  })

  it('does not leave raw dollar signs when math is valid', async () => {
    const html = await renderMDX('Value: $42$')
    expect(html).toContain('class="katex"')
  })
})

describe('useMDXComponents', () => {
  it('applies the branded styling to headings', async () => {
    const html = await renderMDX('## Section', useMDXComponents({}))
    expect(html).toContain('border-b-4')
    expect(html).toContain('border-blue-500')
  })

  it('lets callers override individual elements', async () => {
    const html = await renderMDX(
      '## Section',
      useMDXComponents({ h2: ({ children }) => <h2 data-custom="1">{children}</h2> }),
    )
    expect(html).toContain('data-custom="1"')
  })

  it('styles inline code and links', async () => {
    const html = await renderMDX('Use `bun` and [docs](https://example.com).', useMDXComponents({}))
    expect(html).toContain('font-mono')
    expect(html).toContain('rel="noopener noreferrer"')
  })

  it('applies branded styling to every mapped element (kitchen sink)', async () => {
    const source = [
      '# Title',
      '',
      '## Section',
      '',
      '### Sub',
      '',
      '#### Small',
      '',
      'A paragraph with **bold**, *italic*, `inline`, and a [link](https://example.com).',
      '',
      '- item one',
      '',
      '1. first',
      '',
      '> quote',
      '',
      '---',
      '',
      '| Left | Right |',
      '| --- | --- |',
      '| a | b |',
      '',
      '```ts',
      'const x = 1',
      '```',
      '',
    ].join('\n')
    const html = await renderMDX(source, useMDXComponents({}))

    // Class order is not asserted — the Tailwind Prettier plugin may reorder
    // utilities, so we check single tokens instead of pairs.
    // Headings h1–h4
    expect(html).toContain('text-5xl')
    expect(html).toContain('border-b-4')
    expect(html).toContain('from-purple-500')
    expect(html).toContain('text-2xl')
    // Paragraph, emphasis, strong, link
    expect(html).toContain('leading-relaxed')
    expect(html).toContain('bg-yellow-100')
    expect(html).toContain('italic')
    expect(html).toContain('decoration-2')
    // Lists
    expect(html).toContain('list-none')
    expect(html).toContain('list-decimal')
    // Blockquote and rule
    expect(html).toContain('border-purple-500')
    expect(html).toContain('via-purple-500')
    // Table pieces
    expect(html).toContain('min-w-full')
    expect(html).toContain('border-collapse')
    expect(html).toContain('from-blue-500')
    // Inline vs fenced code branches
    expect(html).toContain('bg-gray-100')
    expect(html).toContain('text-pink-600')
    expect(html).toContain('language-ts')
    expect(html).toContain('border-gray-700')
  })
})
