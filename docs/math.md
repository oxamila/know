# Math rendering

Know renders math two ways: static formulas via KaTeX and interactive plots via React components. Both appear in the same post body.

## Static formulas (KaTeX)

Formulas are parsed at build time and compiled to KaTeX HTML on the server. The result is in the page's static HTML, so it works with JavaScript disabled and is indexed by search engines.

### Syntax

Inline math uses single dollar signs:

```mdx
The sine function is written $f(x) = \sin(x)$.
```

Display math (centered, on its own line) uses double dollar signs:

```mdx
$$
\int_{-\infty}^{\infty} e^{-x^2} \, dx = \sqrt{\pi}
$$
```

### How it works

The pipeline in `packages/mdx` runs two plugins:

1. `remark-math` parses `$…$` and `$$…$$` into math nodes.
2. `rehype-katex` turns those nodes into KaTeX HTML and injects the KaTeX stylesheet.

`katex` is a dependency of the app, so the CSS ships with the build. No client-side KaTeX runtime is loaded.

### Supported notation

Everything KaTeX supports: fractions, sums, integrals, matrices, alignment environments, greek letters, custom macros, and more. See the [KaTeX supported-functions reference](https://katex.org/docs/supported).

Invalid LaTeX does not crash the build. It renders the expression in red so you can spot and fix it.

## Interactive graphs

`MathGraph` and `MathGraph3D` are React client components in `packages/math-viz`. They draw an interactive plot on the client after hydration, with pan/zoom and axis controls.

### `MathGraph` (2D)

```mdx
import { MathGraph } from '@repo/math-viz'

<MathGraph
  title="f(x) = sin(x)"
  func={(x) => Math.sin(x)}
  xMin={-2 * Math.PI}
  xMax={2 * Math.PI}
  color="#10b981"
  width={600}
  height={400}
/>
```

To compare several functions on one shared graph, pass `functions` (an array of `{ func, color?, label? }`) instead of `func`; colors and a legend are handled automatically.

| Prop            | Required | Default    | Notes                                                |
| --------------- | -------- | ---------- | ---------------------------------------------------- |
| `title`         | no       | —          | Caption above the plot                               |
| `func`          | no       | —          | `(x: number) => number`; single-function form        |
| `functions`     | no       | —          | `FunctionDef[]` multi-curve form (see above)         |
| `xMin` / `xMax` | no       | `-5` / `5` | Visible x range                                      |
| `width`         | no       | `500`      | SVG width in px                                      |
| `height`        | no       | `400`      | SVG height in px                                     |
| `color`         | no       | `#10b981`  | Curve color (single-function form)                   |
| `showGrid`      | no       | `true`     | Dashed background grid                               |
| `points`        | no       | `200`      | Samples per curve                                    |
| `showLegend`    | no       | `true`     | Legend; only shown when plotting more than one curve |

The y-axis auto-fits the sampled values; there is no `yMin`/`yMax` prop, so narrow the x range around functions with vertical asymptotes. Drag to pan, scroll to zoom.

### `MathGraph3D` (3D)

```mdx
import { MathGraph3D } from '@repo/math-viz'

<MathGraph3D
  title="z = sin(x) · cos(y)"
  surfaces={[
    {
      func: (x, y) => Math.sin(x) * Math.cos(y),
      color: '#8b5cf6',
    },
  ]}
  xMin={-Math.PI}
  xMax={Math.PI}
  yMin={-Math.PI}
  yMax={Math.PI}
/>
```

`surfaces` is an array of `{ func, color, label? }`, where `func` is `(x, y) => number`. Plot several surfaces in one viewer by adding more entries; a legend appears automatically. Props: `xMin`/`xMax`/`yMin`/`yMax` (all default `-5`/`5`), `width` (600), `height` (500), `color`, `title`, `showGrid`, `gridSize` (20, mesh resolution), `showAxes`, `showLegend`. Controls let you orbit (with momentum), pan, and zoom, plus Home/Auto/Grid toggles and X/Y/Z axis-view buttons.

### `Chart` (line/bar)

`Chart` plots explicit `{ x, y }` data points (not a function) as a static line or bar chart. Props: `data`, `type` (`'line' | 'bar'`, default `'line'`), `width` (400), `height` (300), `color`, `title`. Use it for tabular data; use `MathGraph` for mathematical functions.

The full reference with live examples is served by the site itself at the **Docs** page (`/docs`, linked in the site header). It documents every prop of all three components, the MDX element map, math syntax, and frontmatter — and a machine-readable index is served at `/llms.txt` for LLM tools.

## Why function props work in MDX

Client components cannot receive functions across React's server→client boundary. Post bodies therefore render inside a client boundary (`MdxContent` in `apps/web/app/posts/[category]/[slug]/`), so MDX bodies can pass `func={(x) => …}` directly to the graph components. Static math is unaffected — KaTeX still runs at compile time.

The practical rule: **import graph components normally and pass functions inline**, exactly as in the examples above.

## Accessibility and no-JS behavior

- Static formulas are plain HTML in the document; they need no JavaScript and are readable by screen readers and crawlers.
- Graph components render a placeholder in the server HTML and draw the plot after hydration. For the plot itself, the component exposes labeled controls (`View from X-axis`, `Reset View`, and so on).
