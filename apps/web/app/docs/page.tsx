import type { Metadata } from 'next'
import {
  ChartDemo,
  ComboChartDemo,
  FillDemo,
  MathGraph3DDemo,
  MathGraphDemo,
  MultiFunctionDemo,
  ParamsDemo,
  TogglesDemo,
} from '@/app/docs/examples'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { siteName } from '@/lib/site'

export const metadata: Metadata = {
  title: 'Documentation',
  description:
    'Full reference for writing content on Know: graph components, MDX elements, math syntax, and frontmatter.',
}

function Code({ children }: { children: string }) {
  return (
    <pre className="mb-6 overflow-x-auto rounded-xl border-2 border-gray-700 bg-gray-900 p-4 text-sm text-gray-100 shadow-lg">
      <code>{children}</code>
    </pre>
  )
}

function H2({ id, children }: { id: string; children: React.ReactNode }) {
  return (
    <h2
      id={id}
      className="mt-14 mb-6 border-b-4 border-blue-500 pb-3 text-3xl font-bold text-gray-800"
    >
      {children}
    </h2>
  )
}

function H3({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="mt-10 mb-4 flex items-center gap-2 text-2xl font-semibold text-gray-700">
      <span className="h-7 w-1.5 rounded-full bg-gradient-to-b from-purple-500 to-pink-500" />
      {children}
    </h3>
  )
}

function PropTable({ rows }: { rows: Array<[string, string, string, string]> }) {
  return (
    <div className="mb-6 overflow-x-auto">
      <Table className="min-w-full overflow-hidden rounded-lg border border-gray-300 shadow-lg">
        <TableHeader>
          <TableRow className="bg-gradient-to-r from-blue-500 to-purple-600 hover:bg-transparent">
            <TableHead className="border border-gray-300 px-4 py-3 font-bold text-white">
              Prop
            </TableHead>
            <TableHead className="border border-gray-300 px-4 py-3 font-bold text-white">
              Type
            </TableHead>
            <TableHead className="border border-gray-300 px-4 py-3 font-bold text-white">
              Default
            </TableHead>
            <TableHead className="border border-gray-300 px-4 py-3 font-bold text-white">
              Description
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map(([prop, type, def, description]) => (
            <TableRow key={prop} className="hover:bg-muted/50 transition-colors">
              <TableCell className="border border-gray-300 px-4 py-3 font-mono text-xs font-semibold whitespace-normal text-pink-600">
                {prop}
              </TableCell>
              <TableCell className="text-muted-foreground border border-gray-300 px-4 py-3 font-mono text-xs whitespace-normal">
                {type}
              </TableCell>
              <TableCell className="text-muted-foreground border border-gray-300 px-4 py-3 font-mono text-xs whitespace-normal">
                {def}
              </TableCell>
              <TableCell className="text-foreground border border-gray-300 px-4 py-3 whitespace-normal">
                {description}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

export default function DocsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50">
      <div className="mx-auto max-w-4xl px-6 py-12">
        <header className="mb-10 text-center">
          <h1 className="mb-4 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-5xl font-extrabold text-transparent">
            Documentation
          </h1>
          <p className="text-xl text-gray-600">
            Everything you need to write posts on {siteName}: interactive graph components, MDX
            elements, math syntax, and frontmatter. Written for humans and LLMs alike — a
            machine-readable index is served at{' '}
            <a href="/llms.txt" className="font-medium text-blue-600 underline">
              /llms.txt
            </a>
            .
          </p>
        </header>

        <nav className="mb-4 rounded-xl border border-gray-200 bg-white/80 p-4 text-sm shadow-md">
          <strong className="mr-2">On this page:</strong>
          <a href="#writing-posts" className="mr-3 text-blue-600 underline">
            Writing posts
          </a>
          <a href="#math-graph" className="mr-3 text-blue-600 underline">
            MathGraph (2D)
          </a>
          <a href="#math-graph-3d" className="mr-3 text-blue-600 underline">
            MathGraph3D (3D)
          </a>
          <a href="#chart" className="mr-3 text-blue-600 underline">
            Chart
          </a>
          <a href="#elements" className="mr-3 text-blue-600 underline">
            MDX elements
          </a>
          <a href="#math-syntax" className="mr-3 text-blue-600 underline">
            Math syntax
          </a>
          <a href="#frontmatter" className="text-blue-600 underline">
            Frontmatter
          </a>
        </nav>

        {/* ---------------------------------------------------------------- */}
        <section>
          <H2 id="writing-posts">Writing posts</H2>
          <p className="mb-4 text-lg leading-relaxed text-gray-700">
            Every post is one MDX file at{' '}
            <code className="rounded bg-gray-100 px-2 py-1 font-mono text-sm text-pink-600">
              apps/web/content/&lt;category&gt;/&lt;slug&gt;.mdx
            </code>
            . The category is the directory name and the slug is the file name, so{' '}
            <code className="rounded bg-gray-100 px-2 py-1 font-mono text-sm text-pink-600">
              content/math/taylor-series.mdx
            </code>{' '}
            becomes the route{' '}
            <code className="rounded bg-gray-100 px-2 py-1 font-mono text-sm text-pink-600">
              /posts/math/taylor-series
            </code>
            . Categories are discovered from the filesystem — no registration.
          </p>
          <ul className="mb-6 ml-0 list-none space-y-3">
            <li className="flex items-start gap-3 text-lg text-gray-700">
              <span className="mt-2.5 inline-flex h-2 w-2 flex-shrink-0 rounded-full bg-gradient-to-r from-blue-500 to-purple-500" />
              <span>
                Start the body at{' '}
                <code className="rounded bg-gray-100 px-1 font-mono text-sm text-pink-600">##</code>{' '}
                — the page header already renders the frontmatter title as the single{' '}
                <code className="rounded bg-gray-100 px-1 font-mono text-sm text-pink-600">h1</code>
                .
              </span>
            </li>
            <li className="flex items-start gap-3 text-lg text-gray-700">
              <span className="mt-2.5 inline-flex h-2 w-2 flex-shrink-0 rounded-full bg-gradient-to-r from-blue-500 to-purple-500" />
              <span>
                Import components after the frontmatter:{' '}
                <code className="rounded bg-gray-100 px-1 font-mono text-sm text-pink-600">
                  import &#123; MathGraph, MathGraph3D, Chart &#125; from &apos;@repo/math-viz&apos;
                </code>
              </span>
            </li>
            <li className="flex items-start gap-3 text-lg text-gray-700">
              <span className="mt-2.5 inline-flex h-2 w-2 flex-shrink-0 rounded-full bg-gradient-to-r from-blue-500 to-purple-500" />
              <span>
                Frontmatter is validated with Zod; a missing or invalid field fails the build
                loudly. See <a href="#frontmatter">Frontmatter</a> below.
              </span>
            </li>
            <li className="flex items-start gap-3 text-lg text-gray-700">
              <span className="mt-2.5 inline-flex h-2 w-2 flex-shrink-0 rounded-full bg-gradient-to-r from-blue-500 to-purple-500" />
              <span>
                Set{' '}
                <code className="rounded bg-gray-100 px-1 font-mono text-sm text-pink-600">
                  draft: true
                </code>{' '}
                to hide a post everywhere (listings, routes, sitemap) until publish time.
              </span>
            </li>
          </ul>
          <Code>{`---
title: Trigonometric Functions Explained
description: Explore sine, cosine, and tangent with visualizations
date: 2025-01-20
author: Math Educator
tags: [trigonometry, waves]
---

import { MathGraph } from '@repo/math-viz'

## Sine and cosine

Prose, then $f(x) = \\sin(x)$ inline math and a live graph:

<MathGraph title="f(x) = sin(x)" func={(x) => Math.sin(x)} />`}</Code>
        </section>

        {/* ---------------------------------------------------------------- */}
        <section>
          <H2 id="math-graph">MathGraph — interactive 2D plots</H2>
          <p className="mb-4 text-lg leading-relaxed text-gray-700">
            Plots one or more functions{' '}
            <code className="rounded bg-gray-100 px-1 font-mono text-sm text-pink-600">
              y = f(x)
            </code>{' '}
            on a shared SVG. Drag to pan; zoom with Ctrl/⌘+scroll (trackpad pinch works too) or the
            +/− buttons — plain scroll moves the page, so a graph never traps your scrollwheel — and
            use Reset View to restore the original range. Client component — import it in an MDX
            body and pass a real JavaScript function.
          </p>

          <MathGraphDemo />

          <H3>Comparing multiple functions</H3>
          <p className="mb-4 text-lg leading-relaxed text-gray-700">
            Pass{' '}
            <code className="rounded bg-gray-100 px-1 font-mono text-sm text-pink-600">
              functions
            </code>{' '}
            (an array) instead of{' '}
            <code className="rounded bg-gray-100 px-1 font-mono text-sm text-pink-600">func</code>{' '}
            to draw several curves on one graph. Colors are assigned automatically from a palette if
            you omit them, and a legend appears whenever there is more than one curve — each legend
            entry is a checkbox, so readers can untick a curve to hide it and tick it again to bring
            it back. Omitted labels become{' '}
            <code className="rounded bg-gray-100 px-1 font-mono text-sm text-pink-600">f1(x)</code>,{' '}
            <code className="rounded bg-gray-100 px-1 font-mono text-sm text-pink-600">f2(x)</code>,
            …
          </p>

          <MultiFunctionDemo />

          <Code>{`<MathGraph
  title="sin(x) vs cos(x)"
  functions={[
    { func: (x) => Math.sin(x), label: 'sin(x)' },
    { func: (x) => Math.cos(x), label: 'cos(x)' },
    { func: (x) => Math.cos(x), color: '#f59e0b' }, // color optional
  ]}
  xMin={-Math.PI}
  xMax={Math.PI}
/>`}</Code>

          <H3>Shaded areas under curves</H3>
          <p className="mb-4 text-lg leading-relaxed text-gray-700">
            Set{' '}
            <code className="rounded bg-gray-100 px-1 font-mono text-sm text-pink-600">
              fill: true
            </code>{' '}
            on any function entry to shade the area between that curve and the x-axis. Control the
            transparency with{' '}
            <code className="rounded bg-gray-100 px-1 font-mono text-sm text-pink-600">
              fillOpacity
            </code>{' '}
            (default 0.2). Works alongside unfilled curves for comparison.
          </p>

          <FillDemo />

          <Code>{`<MathGraph
  title="sin(x) with shaded area"
  functions={[
    { func: (x) => Math.sin(x), label: 'sin(x)', fill: true, fillOpacity: 0.25 },
    { func: (x) => Math.cos(x), label: 'cos(x)' }, // no fill
  ]}
  xMin={-Math.PI}
  xMax={Math.PI}
/>`}</Code>

          <H3>Parameter sliders</H3>
          <p className="mb-4 text-lg leading-relaxed text-gray-700">
            Pass{' '}
            <code className="rounded bg-gray-100 px-1 font-mono text-sm text-pink-600">params</code>{' '}
            (an array of{' '}
            <code className="rounded bg-gray-100 px-1 font-mono text-sm text-pink-600">
              &#123; name, label?, min, max, step?, default &#125;
            </code>
            ) and every plotted function is called with{' '}
            <code className="rounded bg-gray-100 px-1 font-mono text-sm text-pink-600">(x, p)</code>{' '}
            — where{' '}
            <code className="rounded bg-gray-100 px-1 font-mono text-sm text-pink-600">p</code> maps
            each param name to its current slider value. Sliders render below the plot; the curve
            redraws live as the reader drags. Great for letting readers explore a family of
            functions without writing any extra state code.
          </p>

          <ParamsDemo />

          <Code>{`<MathGraph
  title="y = a · sin(b · x)"
  functions={[{ func: (x, p) => p.a * Math.sin(p.b * x), label: 'a · sin(b · x)' }]}
  params={[
    { name: 'a', label: 'amplitude a', min: 0.5, max: 3, step: 0.1, default: 1 },
    { name: 'b', label: 'frequency b', min: 0.5, max: 4, step: 0.1, default: 1 },
  ]}
  xMin={-Math.PI * 2}
  xMax={Math.PI * 2}
/>`}</Code>

          <H3>Props</H3>
          <PropTable
            rows={[
              [
                'func',
                '(x: number, p: Record<string, number>) => number',
                '—',
                'Single function to plot (mutually used when `functions` is absent); p carries the current slider values when params is set',
              ],
              [
                'functions',
                'FunctionDef[]',
                '—',
                'Multiple functions: `{ func, color?, label?, fill?, fillOpacity? }[]` — plot on one shared graph for comparison',
              ],
              [
                'params',
                'ParamDef[]',
                '—',
                'Interactive sliders: `{ name, label?, min, max, step?, default }[]` (`value` is an alias for `default`; falls back to `min`) — every function is called as (x, p) with p[name] = slider value',
              ],
              ['xMin', 'number', '-5', 'Left edge of the visible x range'],
              ['xMax', 'number', '5', 'Right edge of the visible x range'],
              ['width', 'number', '500', 'SVG width in pixels'],
              ['height', 'number', '400', 'SVG height in pixels'],
              [
                'color',
                'string',
                "'#10b981'",
                'Curve color for the single-`func` form; array entries can set their own',
              ],
              ['title', 'string', '—', 'Optional caption rendered above the plot'],
              ['showGrid', 'boolean', 'true', 'Draw the dashed background grid'],
              [
                'points',
                'number',
                '200',
                'Samples per curve across [xMin, xMax]; higher = smoother, slower',
              ],
              [
                'showLegend',
                'boolean',
                'true',
                'Show the legend; it only appears when plotting more than one function. Legend entries are checkboxes that hide/show curves',
              ],
              [
                'fill',
                'boolean (per function)',
                'false',
                'Shade the area between this curve and the x-axis (set on a FunctionDef entry)',
              ],
              [
                'fillOpacity',
                'number (per function)',
                '0.2',
                'Transparency of the shaded area when fill is true (0–1)',
              ],
            ]}
          />
          <p className="mb-4 text-sm leading-relaxed text-gray-600">
            The y-axis always auto-fits the sampled values of all curves (there is no{' '}
            <code className="rounded bg-gray-100 px-1 font-mono text-xs text-pink-600">yMin</code>/
            <code className="rounded bg-gray-100 px-1 font-mono text-xs text-pink-600">yMax</code>{' '}
            prop), so functions with vertical asymptotes (e.g.{' '}
            <code className="rounded bg-gray-100 px-1 font-mono text-xs text-pink-600">tan(x)</code>
            ) will squash the rest of the plot — narrow{' '}
            <code className="rounded bg-gray-100 px-1 font-mono text-xs text-pink-600">xMin</code>/
            <code className="rounded bg-gray-100 px-1 font-mono text-xs text-pink-600">xMax</code>{' '}
            around the interesting region instead. Non-finite samples are skipped. Wheel zoom
            changes the x range only; panning is horizontal.
          </p>
        </section>

        {/* ---------------------------------------------------------------- */}
        <section>
          <H2 id="math-graph-3d">MathGraph3D — interactive 3D surfaces</H2>
          <p className="mb-4 text-lg leading-relaxed text-gray-700">
            Plots one or more surfaces{' '}
            <code className="rounded bg-gray-100 px-1 font-mono text-sm text-pink-600">
              z = f(x, y)
            </code>{' '}
            as shaded wireframes on a ground grid with colored XYZ axes. Controls: left-drag (or one
            finger) to orbit with momentum, right-drag / Shift-drag (or two fingers) to pan,
            Ctrl/⌘+scroll or the +/− buttons to zoom (0.3×–4×) — plain scroll moves the page.
            Buttons: Home (reset view), Auto (rotate), Grid (toggle), and X / Y / Z view presets.
          </p>

          <MathGraph3DDemo />

          <Code>{`import { MathGraph3D } from '@repo/math-viz'

<MathGraph3D
  title="z = sin(x) · cos(y)"
  surfaces={[
    { func: (x, y) => Math.sin(x) * Math.cos(y), label: 'wave' },
  ]}
  xMin={-Math.PI}
  xMax={Math.PI}
  yMin={-Math.PI}
  yMax={Math.PI}
/>`}</Code>

          <H3>Props</H3>
          <PropTable
            rows={[
              [
                'func',
                '(x: number, y: number) => number',
                '—',
                'Single surface function (used when `surfaces` is absent)',
              ],
              [
                'surfaces',
                'SurfaceDef[]',
                '—',
                'Multiple surfaces: `{ func, color?, label? }[]` — overlay on one viewer with a legend',
              ],
              ['xMin / xMax', 'number', '-5 / 5', 'Domain bounds on the x axis'],
              ['yMin / yMax', 'number', '-5 / 5', 'Domain bounds on the y axis'],
              ['width', 'number', '600', 'SVG width in pixels'],
              ['height', 'number', '500', 'SVG height in pixels'],
              ['color', 'string', "'#3b82f6'", 'Surface color for the single-`func` form'],
              ['title', 'string', '—', 'Optional caption rendered above the viewer'],
              ['showGrid', 'boolean', 'true', 'Draw the ground grid (toggleable at runtime)'],
              [
                'gridSize',
                'number',
                '20',
                'Mesh resolution: the surface is sampled on a (gridSize+1)² grid; higher = smoother, slower',
              ],
              [
                'showAxes',
                'boolean',
                'true',
                'Draw the colored X (red) / Y (green) / Z (blue) axes',
              ],
              [
                'showLegend',
                'boolean',
                'true',
                'Show the legend; it only appears when plotting more than one surface',
              ],
            ]}
          />
          <p className="mb-4 text-sm leading-relaxed text-gray-600">
            Non-finite or throwing samples are plotted at z = 0. The ground grid spans a fixed ±10
            region regardless of the domain props; axis length adapts to the larger domain span.
          </p>
        </section>

        {/* ---------------------------------------------------------------- */}
        <section>
          <H2 id="chart">Chart — line, bar, and area charts</H2>
          <p className="mb-4 text-lg leading-relaxed text-gray-700">
            A lightweight chart for explicit data points (no function evaluation, no pan/zoom). Use{' '}
            <code className="rounded bg-gray-100 px-1 font-mono text-sm text-pink-600">
              MathGraph
            </code>{' '}
            for mathematical functions; use{' '}
            <code className="rounded bg-gray-100 px-1 font-mono text-sm text-pink-600">Chart</code>{' '}
            for tabular data. The simple form takes one{' '}
            <code className="rounded bg-gray-100 px-1 font-mono text-sm text-pink-600">data</code>{' '}
            series.
          </p>

          <ChartDemo />

          <H3>Mixing bars, lines, and areas on one chart</H3>
          <p className="mb-4 text-lg leading-relaxed text-gray-700">
            Pass{' '}
            <code className="rounded bg-gray-100 px-1 font-mono text-sm text-pink-600">
              datasets
            </code>{' '}
            (an array) instead of{' '}
            <code className="rounded bg-gray-100 px-1 font-mono text-sm text-pink-600">data</code>{' '}
            to combine any mix of{' '}
            <code className="rounded bg-gray-100 px-1 font-mono text-sm text-pink-600">bar</code>,{' '}
            <code className="rounded bg-gray-100 px-1 font-mono text-sm text-pink-600">line</code>,
            and{' '}
            <code className="rounded bg-gray-100 px-1 font-mono text-sm text-pink-600">area</code>{' '}
            series on shared axes.{' '}
            <code className="rounded bg-gray-100 px-1 font-mono text-sm text-pink-600">area</code>{' '}
            draws a line with the region beneath it shaded down to the baseline; multiple bar series
            are placed side by side. A legend appears when datasets have labels.
          </p>

          <ComboChartDemo />

          <Code>{`<Chart
  title="Bars + line + area on one chart"
  datasets={[
    { data: revenue, type: 'bar',  color: '#3b82f6', label: 'Revenue' },
    { data: trend,   type: 'line', color: '#ec4899', label: 'Trend' },
    { data: costs,   type: 'area', color: '#10b981', label: 'Costs' },
  ]}
/>`}</Code>

          <H3>Hiding and showing series (toggles)</H3>
          <p className="mb-4 text-lg leading-relaxed text-gray-700">
            Add{' '}
            <code className="rounded bg-gray-100 px-1 font-mono text-sm text-pink-600">
              toggles
            </code>{' '}
            and the legend entries become checkboxes: untick a labelled series to hide it, tick it
            back to restore it. Hidden bar series drop out of the side-by-side grouping, so the
            remaining bars re-space automatically.
          </p>

          <TogglesDemo />

          <Code>{`<Chart
  title="Untick legend items to hide series"
  toggles
  datasets={[
    { data: revenue, type: 'bar',  color: '#3b82f6', label: 'Revenue' },
    { data: trend,   type: 'line', color: '#ec4899', label: 'Trend' },
  ]}
/>`}</Code>

          <H3>Props</H3>
          <PropTable
            rows={[
              [
                'data',
                '{ x: number, y: number }[]',
                'sample curve',
                'Single-series form; both axes auto-scale to the data',
              ],
              [
                'datasets',
                'DatasetDef[]',
                '—',
                'Multi-series form: `{ data, type?, color?, label? }[]`; overrides data/type when present',
              ],
              [
                'type',
                "'line' | 'bar'",
                "'line'",
                'Single-series style; the per-dataset `type` additionally supports area',
              ],
              [
                'toggles',
                'boolean',
                'false',
                'Render legend entries as checkboxes so readers can hide/show labelled series',
              ],
              ['width', 'number', '400', 'SVG width in pixels'],
              ['height', 'number', '300', 'SVG height in pixels'],
              ['color', 'string', "'#3b82f6'", 'Series color (single-series form)'],
              ['title', 'string', '—', 'Optional caption rendered above the chart'],
            ]}
          />
        </section>

        {/* ---------------------------------------------------------------- */}
        <section>
          <H2 id="elements">MDX elements</H2>
          <p className="mb-4 text-lg leading-relaxed text-gray-700">
            Standard Markdown and GitHub-flavored Markdown (tables, task lists, strikethrough,
            autolinks) work in every post. Each element is remapped to a styled React component in{' '}
            <code className="rounded bg-gray-100 px-1 font-mono text-sm text-pink-600">
              packages/mdx/src/components.tsx
            </code>{' '}
            — here is the complete map:
          </p>
          <PropTable
            rows={[
              [
                '# … #### …',
                'h1 … h4',
                '—',
                'Gradient h1; blue-underlined h2; accent-bar h3. Bodies should start at h2',
              ],
              ['paragraph', 'p', '—', 'Spaced, relaxed leading, gray-700'],
              [
                '[text](url)',
                'a',
                '—',
                'Blue underlined; opens in a new tab (target=_blank, rel=noopener)',
              ],
              ['- item', 'ul / li', '—', 'Custom bullet dot per item'],
              ['1. item', 'ol / li', '—', 'Decimal list with bold blue markers'],
              [
                '`code`',
                'code (inline)',
                '—',
                'Pink monospace chip; distinguished from block code by the absence of a language class',
              ],
              [
                '```lang … ```',
                'pre > code',
                '—',
                'Dark rounded code block; language class preserved for highlighting',
              ],
              ['> quote', 'blockquote', '—', 'Purple left border, tinted background, italic'],
              ['---', 'hr', '—', 'Gradient divider'],
              [
                '| table |',
                'table / thead / th / td / tr',
                '—',
                'GFM tables: gradient header, bordered cells, hover rows, horizontal scroll wrapper',
              ],
              ['**bold**', 'strong', '—', 'Bold with a yellow highlight chip'],
              ['_emphasis_', 'em', '—', 'Italic, purple'],
            ]}
          />
          <p className="mb-4 text-sm leading-relaxed text-gray-600">
            Unstyled HTML elements pass through untouched. The map is applied to every MDX module
            via{' '}
            <code className="rounded bg-gray-100 px-1 font-mono text-xs text-pink-600">
              apps/web/mdx-components.tsx
            </code>
            ; callers can still override any element by passing their own{' '}
            <code className="rounded bg-gray-100 px-1 font-mono text-xs text-pink-600">
              components
            </code>{' '}
            prop (caller keys win).
          </p>
        </section>

        {/* ---------------------------------------------------------------- */}
        <section>
          <H2 id="math-syntax">Math syntax (KaTeX)</H2>
          <p className="mb-4 text-lg leading-relaxed text-gray-700">
            Math is compiled at build time and ships as static HTML — it works with JavaScript
            disabled and is indexed by search engines. No client-side math runtime is loaded.
          </p>
          <PropTable
            rows={[
              ['$f(x) = \\sin(x)$', 'inline math', '—', 'Single dollar signs inside prose'],
              [
                '$$\\int_{-\\infty}^{\\infty} e^{-x^2}\\,dx = \\sqrt{\\pi}$$',
                'display math',
                '—',
                'Double dollar signs on their own lines; rendered centered',
              ],
              [
                '```math … ```',
                'fenced math block',
                '—',
                'Alternative display form via a math code fence',
              ],
            ]}
          />
          <p className="mb-4 text-lg leading-relaxed text-gray-700">
            Everything KaTeX supports is available: fractions, sums, integrals, matrices, alignment
            environments, Greek letters, and macros (see the{' '}
            <a
              href="https://katex.org/docs/supported"
              className="font-medium text-blue-600 underline decoration-2 underline-offset-2"
            >
              KaTeX supported-functions reference
            </a>
            ). Invalid LaTeX does not crash the build — the expression renders in red so you can
            spot it. The pipeline is{' '}
            <code className="rounded bg-gray-100 px-1 font-mono text-sm text-pink-600">
              remark-math
            </code>{' '}
            →{' '}
            <code className="rounded bg-gray-100 px-1 font-mono text-sm text-pink-600">
              rehype-katex
            </code>{' '}
            (configured as serializable specs in{' '}
            <code className="rounded bg-gray-100 px-1 font-mono text-sm text-pink-600">
              packages/mdx
            </code>
            ).
          </p>
        </section>

        {/* ---------------------------------------------------------------- */}
        <section>
          <H2 id="frontmatter">Frontmatter</H2>
          <p className="mb-4 text-lg leading-relaxed text-gray-700">
            Every post starts with YAML frontmatter between{' '}
            <code className="rounded bg-gray-100 px-1 font-mono text-sm text-pink-600">---</code>{' '}
            fences, validated by the Zod schema in{' '}
            <code className="rounded bg-gray-100 px-1 font-mono text-sm text-pink-600">
              packages/content
            </code>
            . Invalid metadata fails the build with a message naming the file and field.
          </p>
          <PropTable
            rows={[
              [
                'title',
                'string (required)',
                '—',
                'Non-empty; rendered as the page h1 and in metadata',
              ],
              [
                'description',
                'string (required)',
                '—',
                'Non-empty; used for SEO metadata and the post card',
              ],
              [
                'date',
                'YYYY-MM-DD (required)',
                '—',
                'ISO date. Unquoted YAML dates are parsed as Date objects and normalized to strings by the schema',
              ],
              ['author', 'string (required)', '—', 'Non-empty display name'],
              [
                'tags',
                'string[] (required)',
                '—',
                'Array of non-empty strings; empty array allowed',
              ],
              [
                'draft',
                'boolean (optional)',
                'false',
                'true hides the post from listings, routes, sitemap, and robots',
              ],
            ]}
          />
          <Code>{`---
title: Trigonometric Functions Explained
description: Explore sine, cosine, and tangent with visualizations
date: 2025-01-20
author: Math Educator
tags: [trigonometry, sine, waves]
draft: false
---`}</Code>
        </section>

        <footer className="mt-16 rounded-xl border border-gray-200 bg-white/80 p-6 text-sm text-gray-600 shadow-md">
          <p className="mb-2">
            <strong>For LLM tools:</strong> this page is the canonical component reference; the
            machine-readable index at{' '}
            <a href="/llms.txt" className="text-blue-600 underline">
              /llms.txt
            </a>{' '}
            links here and to the repository guides.
          </p>
          <p>
            Repository:{' '}
            <a
              href="https://github.com/oxamila/know"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 underline"
            >
              github.com/oxamila/know
            </a>{' '}
            · Deep contributor docs live in{' '}
            <code className="rounded bg-gray-100 px-1 font-mono">docs/</code> and{' '}
            <code className="rounded bg-gray-100 px-1 font-mono">AGENTS.md</code>.
          </p>
        </footer>
      </div>
    </div>
  )
}
