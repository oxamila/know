import { siteName, siteUrl } from '@/lib/site'

/**
 * llmstxt.org index — a machine-readable map of this site for LLM tools.
 * Served at /llms.txt. Generated (not a static public file) so it picks up
 * NEXT_PUBLIC_SITE_URL like sitemap/robots do.
 */

export const dynamic = 'force-static'

function buildLlmsTxt(): string {
  return `# ${siteName}

> ${siteName} is a categorized knowledge site with MDX content, compile-time KaTeX math, and interactive graph components (MathGraph, MathGraph3D, Chart). Posts live at /posts/<category>/<slug>; this page's canonical component and authoring reference is the Docs page.

Site: ${siteUrl}

## Reference

- [Documentation](/docs): full reference for content authors and agents — graph component props (MathGraph, MathGraph3D, Chart), MDX element map, KaTeX math syntax, frontmatter schema, authoring rules.

## Content model

- Posts: \`apps/web/content/<category>/<slug>.mdx\` in the repository; public URL \`/posts/<category>/<slug>\`.
- Frontmatter (YAML, Zod-validated): title (string), description (string), date (YYYY-MM-DD), author (string), tags (string[]), draft (boolean, optional, default false).
- Categories are directories under content/; no registration needed.
- MDX bodies: start at \`##\` (the page renders \`title\` as the single h1); import components from \`@repo/math-viz\`; math via \`$…$\` (inline) and \`$$…$$\` (display), compiled to KaTeX at build time.
- Graph components (client-side, pan/zoom/rotate; accept real JS functions in MDX):
  - \`MathGraph\` — 2D plots; \`func\` or \`functions[]\` with { func, color?, label?, fill?, fillOpacity? } (fill shades the area between a curve and the x-axis); \`params[]\` sliders (name, label?, min, max, step?, default — \`value\` aliases \`default\`) make every function receive \`(x, p)\` with live param values; legend entries are checkboxes to hide/show curves; props: xMin/xMax, width, height, color, title, showGrid, points, showLegend.
  - \`MathGraph3D\` — 3D surfaces; \`func\` or \`surfaces[]\`; props: xMin/xMax/yMin/yMax, width, height, color, title, showGrid, gridSize, showAxes, showLegend.
  - \`Chart\` — line/bar/area charts from data points; single-series (data + type) or multi-series combo via \`datasets[]\` with { data, type ('line'|'bar'|'area'), color?, label? }; \`toggles\` renders legend checkboxes to hide/show series; props: width, height, color, title.

## Sitemap

- [Home](/): all posts grouped by category.
- [Docs](/docs): component and authoring reference.
- [Sitemap (XML)](/sitemap.xml): every published URL.

## Repository

- Source: https://github.com/oxamila/know
- Contributor docs: \`docs/\` (architecture, content, math, testing, deployment) and \`AGENTS.md\` in the repository.
`
}

export function GET(): Response {
  return new Response(buildLlmsTxt(), {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  })
}
