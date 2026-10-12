# Know

A categorized knowledge site built with Next.js (App Router), MDX, and KaTeX, organized as a Turborepo monorepo.

Every post lives in `apps/web/content/<category>/<slug>.mdx`, is validated against a Zod schema, statically generated at build time, and rendered with server-side math so formulas work without JavaScript.

- **Framework**: Next.js 16 (App Router, Turbopack) + React 19
- **Content**: MDX with YAML frontmatter
- **Math**: KaTeX via `remark-math` + `rehype-katex` (SSR, no client JS required)
- **Interactive graphs**: `MathGraph` / `MathGraph3D` client components
- **Tooling**: Bun workspaces, Turborepo, TypeScript, ESLint, Prettier
- **Quality**: Vitest (unit) + Playwright (E2E), GitHub Actions CI

## Quick start

```bash
bun install         # install all workspace dependencies
bun run dev         # start the dev server (turbo dev)
```

The site runs on the app in `apps/web` (default Next.js port 3000).

## Commands

All commands run from the repo root and fan out through Turborepo.

| Command                | What it does                                            |
| ---------------------- | ------------------------------------------------------- |
| `bun run dev`          | Start the dev server                                    |
| `bun run build`        | Production build (static generation included)           |
| `bun run lint`         | ESLint across every package                             |
| `bun run typecheck`    | TypeScript across every package                         |
| `bun run test`         | Vitest unit tests                                       |
| `bun run test:e2e`     | Playwright E2E tests (builds first, then runs a server) |
| `bun run check`        | lint + typecheck + test + build (what CI runs)          |
| `bun run format`       | Prettier write                                          |
| `bun run format:check` | Prettier check                                          |
| `bun run secrets:scan` | Dependency-free secret scanner                          |

## Repository layout

```
apps/
  web/               Next.js site: pages, content, unit + E2E tests
packages/
  content/           Zod schema + repository for frontmatter and post bodies
  mdx/               MDX pipeline (remark/rehype plugin specs)
  math-viz/          MathGraph + MathGraph3D interactive components
  ui/                Shared presentational components
  typescript-config/ Shared tsconfig bases
  eslint-config/     Shared ESLint flat config
scripts/
  scan-secrets.mjs   Dependency-free secret scanner (`security` CI check)
docs/                Detailed guides (see below)
```

## Content

Each post is an MDX file with YAML frontmatter:

```mdx
---
title: Trigonometric Functions Explained
description: Explore sine, cosine, and tangent with beautiful visualizations
date: 2025-01-20
author: Math Educator
tags: [trigonometry, sine, waves]
---

import { MathGraph } from '@repo/math-viz'

Inline math like $f(x) = \sin(x)$ and display math:

$$
\int_{-\infty}^{\infty} e^{-x^2} \, dx = \sqrt{\pi}
$$

<MathGraph title="f(x) = sin(x)" func={(x) => Math.sin(x)} />
```

Frontmatter is validated against a Zod schema; invalid metadata fails the build. See [`docs/content.md`](docs/content.md).

## Documentation

| Guide                                          | Contents                                       |
| ---------------------------------------------- | ---------------------------------------------- |
| [`docs/architecture.md`](docs/architecture.md) | Monorepo structure, data flow, rendering model |
| [`docs/content.md`](docs/content.md)           | Writing posts, frontmatter, math, graphs       |
| [`docs/math.md`](docs/math.md)                 | KaTeX pipeline and interactive visualizations  |
| [`docs/testing.md`](docs/testing.md)           | Unit and E2E testing                           |
| [`docs/deployment.md`](docs/deployment.md)     | Vercel deployment and environment variables    |
| [`AGENTS.md`](AGENTS.md)                       | Guidance for AI agents working in this repo    |

## Environment variables

Copy `apps/web/.env.example` to `apps/web/.env.local` and fill in values. Never commit real secrets — `.env*` files are gitignored and a secret scanner runs in CI.

## License

MIT — see [`LICENSE`](LICENSE).
