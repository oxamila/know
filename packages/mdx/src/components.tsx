import type { MDXComponents } from 'mdx/types'

/**
 * Styled element map for MDX content — the visual identity of every post.
 * Spread order: incoming `components` win, so callers can always override.
 */
export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    // Headings
    h1: ({ children }) => (
      <h1 className="mt-12 mb-8 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-5xl leading-tight font-extrabold text-transparent">
        {children}
      </h1>
    ),
    h2: ({ children }) => (
      <h2 className="mt-10 mb-6 border-b-4 border-blue-500 pb-3 text-4xl font-bold text-gray-800">
        {children}
      </h2>
    ),
    h3: ({ children }) => (
      <h3 className="mt-8 mb-4 flex items-center gap-2 text-3xl font-semibold text-gray-700">
        <span className="h-8 w-2 rounded-full bg-gradient-to-b from-purple-500 to-pink-500" />
        {children}
      </h3>
    ),
    h4: ({ children }) => (
      <h4 className="mt-6 mb-3 text-2xl font-semibold text-gray-700">{children}</h4>
    ),

    // Paragraphs and text
    p: ({ children }) => <p className="mb-6 text-lg leading-relaxed text-gray-700">{children}</p>,

    // Links
    a: ({ href, children }) => (
      <a
        href={href}
        className="font-medium text-blue-600 underline decoration-2 underline-offset-2 transition-colors hover:text-blue-800 hover:decoration-blue-800"
        target="_blank"
        rel="noopener noreferrer"
      >
        {children}
      </a>
    ),

    // Lists
    ul: ({ children }) => <ul className="mb-6 ml-0 list-none space-y-3">{children}</ul>,
    ol: ({ children }) => (
      <ol className="mb-6 ml-4 list-inside list-decimal space-y-3 marker:font-bold marker:text-blue-600">
        {children}
      </ol>
    ),
    li: ({ children }) => (
      <li className="flex items-start gap-3 text-lg text-gray-700">
        <span className="mt-2.5 inline-flex h-2 w-2 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-r from-blue-500 to-purple-500" />
        <span>{children}</span>
      </li>
    ),

    // Code blocks and inline code
    code: ({ children, className }) => {
      const isInline = !className

      if (isInline) {
        return (
          <code className="rounded border border-gray-200 bg-gray-100 px-2 py-1 font-mono text-sm text-pink-600">
            {children}
          </code>
        )
      }

      return (
        <code
          className={`${className} block overflow-x-auto rounded-lg bg-gray-900 p-4 font-mono text-sm text-gray-100`}
        >
          {children}
        </code>
      )
    },

    pre: ({ children }) => (
      <pre className="mb-6 overflow-x-auto rounded-xl border-2 border-gray-700 bg-gray-900 p-6 text-gray-100 shadow-lg">
        {children}
      </pre>
    ),

    // Blockquotes
    blockquote: ({ children }) => (
      <blockquote className="mb-6 rounded-r-lg border-l-4 border-purple-500 bg-purple-50 py-4 pl-6 text-gray-700 italic">
        {children}
      </blockquote>
    ),

    // Horizontal rule
    hr: () => (
      <hr className="my-12 h-1 border-0 bg-gradient-to-r from-transparent via-purple-500 to-transparent" />
    ),

    // Tables (GFM)
    table: ({ children }) => (
      <div className="mb-6 overflow-x-auto">
        <table className="min-w-full border-collapse overflow-hidden rounded-lg border border-gray-300 shadow-lg">
          {children}
        </table>
      </div>
    ),
    thead: ({ children }) => (
      <thead className="bg-gradient-to-r from-blue-500 to-purple-600 text-white">{children}</thead>
    ),
    th: ({ children }) => (
      <th className="border border-gray-300 px-6 py-3 text-left font-bold">{children}</th>
    ),
    td: ({ children }) => (
      <td className="border border-gray-300 px-6 py-3 text-gray-700">{children}</td>
    ),
    tr: ({ children }) => <tr className="transition-colors hover:bg-gray-50">{children}</tr>,

    // Strong and emphasis
    strong: ({ children }) => (
      <strong className="rounded bg-yellow-100 px-1 font-bold text-gray-900">{children}</strong>
    ),
    em: ({ children }) => <em className="font-medium text-purple-700 italic">{children}</em>,

    ...components,
  }
}
