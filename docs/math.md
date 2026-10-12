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
  yMin={-1.5}
  yMax={1.5}
  color="#10b981"
  width={600}
  height={400}
/>
```

| Prop     | Required | Default   | Notes                              |
| -------- | -------- | --------- | ---------------------------------- |
| `title`  | no       | —         | Caption above the plot             |
| `func`   | yes      | —         | `(x: number) => number`            |
| `xMin`   | no       | `-10`     | Left bound                         |
| `xMax`   | no       | `10`      | Right bound                        |
| `yMin`   | no       | auto      | Lower bound (auto-fits if omitted) |
| `yMax`   | no       | auto      | Upper bound (auto-fits if omitted) |
| `color`  | no       | `#3b82f6` | Curve color                        |
| `width`  | no       | `600`     | Canvas width in px                 |
| `height` | no       | `400`     | Canvas height in px                |

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

`surfaces` is an array of `{ func, color }`, where `func` is `(x, y) => number`. Plot several surfaces in one viewer by adding more entries. Controls let you rotate, pan, and zoom, plus dedicated axis-view buttons.

## Why function props work in MDX

Client components cannot receive functions across React's server→client boundary. Post bodies therefore render inside a client boundary (`MdxContent` in `apps/web/app/posts/[category]/[slug]/`), so MDX bodies can pass `func={(x) => …}` directly to the graph components. Static math is unaffected — KaTeX still runs at compile time.

The practical rule: **import graph components normally and pass functions inline**, exactly as in the examples above.

## Accessibility and no-JS behavior

- Static formulas are plain HTML in the document; they need no JavaScript and are readable by screen readers and crawlers.
- Graph components render a placeholder in the server HTML and draw the plot after hydration. For the plot itself, the component exposes labeled controls (`View from X-axis`, `Reset View`, and so on).
