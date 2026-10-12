# Writing content

Every post is a single MDX file at:

```
apps/web/content/<category>/<slug>.mdx
```

The category is the directory name and the slug is the file name (without `.mdx`). A file at `content/math/taylor-series.mdx` becomes the route `/posts/math/taylor-series`.

## Frontmatter

Frontmatter is YAML between `---` fences at the top of the file and is validated against the schema in `packages/content`. A missing or invalid field fails the build with a message naming the file and field.

```yaml
---
title: Trigonometric Functions Explained
description: Explore sine, cosine, and tangent with beautiful visualizations
date: 2025-01-20
author: Math Educator
tags: [trigonometry, sine, cosine, waves]
---
```

| Field         | Required | Notes                                                                                               |
| ------------- | -------- | --------------------------------------------------------------------------------------------------- |
| `title`       | yes      | Non-empty string; used for the page `<h1>` and metadata                                             |
| `description` | yes      | Non-empty string; used for metadata and the post card                                               |
| `date`        | yes      | ISO date (`YYYY-MM-DD`). YAML may parse this as a date object; the schema normalizes it to a string |
| `author`      | yes      | Non-empty string                                                                                    |
| `tags`        | yes      | Array of non-empty strings                                                                          |
| `draft`       | no       | When `true`, the post is excluded from listings, routes, sitemap, and robots                        |

## Body

After frontmatter, the body is standard MDX: Markdown plus JSX. Three things are worth knowing.

### Do not repeat the title as an `h1`

The post header already renders the frontmatter `title` as the page's single `h1`. Start the body with `##` (or prose). A second `# Title` in the body creates two `h1`s and a strict-mode duplicate in tests.

### Import components you use

MDX does not inject components automatically. Import any interactive component at the top of the body:

```mdx
import { MathGraph, MathGraph3D } from '@repo/math-viz'
```

Imports come after the frontmatter and before the body content.

### Math

Wrap math in `$…$` for inline and `$$…$$` for display. It compiles to KaTeX at build time and renders in the server HTML — no client JavaScript needed. See [`docs/math.md`](docs/math.md).

## Interactive graphs

`MathGraph` and `MathGraph3D` are client components, so you pass them real JavaScript functions. This is supported because the post body renders inside a client boundary.

```mdx
<MathGraph
  title="f(x) = sin(x)"
  func={(x) => Math.sin(x)}
  xMin={-2 * Math.PI}
  xMax={2 * Math.PI}
  color="#10b981"
/>
```

`MathGraph3D` takes a `surfaces` array where each surface has a `func(x, y)`. See [`docs/math.md`](docs/math.md) for the full prop reference.

## Adding a new category

Create the directory under `content/` and add a post. Categories are discovered from the filesystem, so no registration is needed. The category name becomes part of the URL and is shown capitalized in the UI.

## Drafts

Set `draft: true` to hide a post everywhere — home page, category listing, static routes, sitemap, and robots. Remove the flag (or set it to `false`) to publish.

## Validation and tests

`bun run check` runs the content integrity tests: every post parses, every date is valid, every field is present, and a post's body is returned for rendering. If your post breaks any of these, `bun run check` fails before CI does.
