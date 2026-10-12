# Architecture

Know is a Turborepo monorepo. Each workspace is a small, focused package; the Next.js app composes them. The guiding rule is that **content is data, not markup** — MDX files carry frontmatter that is validated and turned into typed records, and the app renders those records.

## The monorepo

Turborepo runs tasks (`build`, `lint`, `typecheck`, `test`, `test:e2e`) across all workspaces with caching and correct topological ordering (`dependsOn: ["^build"]`). Workspaces are declared in the root `package.json` (`apps/*`, `packages/*`) and installed with Bun.

```
apps/web                the Next.js site (the only deployable)
packages/content        frontmatter schema + repository
packages/mdx            remark/rehype pipeline
packages/math-viz       interactive graph components
packages/ui             shared presentational components
packages/typescript-config
packages/eslint-config
scripts/                repo tooling (secret scanner)
```

## Workspace responsibilities

### `packages/content`

Owns the shape of a post. A Zod schema validates frontmatter (`title`, `description`, `date`, `author`, `tags`, optional `draft`). A repository module reads the MDX tree from disk, parses frontmatter, and exposes typed queries: all posts, one post by category/slug, all categories, category count.

It never imports from the app. The app depends on it, not the reverse.

### `packages/mdx`

Owns the compile pipeline. Plugin configuration is expressed as **serializable specs** (plain objects describing which plugins to run and their options) so the options survive Turbopack's JS→Rust boundary. The pipeline is:

```
remark-frontmatter  → extract YAML
remark-gfm          → tables, strikethrough, autolinks
remark-math         → parse $…$ / $$…$$ into math nodes
rehype-katex        → render math nodes to KaTeX HTML (server-side)
```

The app passes these specs to `@next/mdx` in `next.config.mjs`.

### `packages/math-viz`

Two `'use client'` components, `MathGraph` and `MathGraph3D`, that draw interactive plots after hydration. Because they are client components, MDX bodies may pass JavaScript functions (`func={(x) => …}`) as props — this is why post bodies are loaded through a client boundary (see Rendering model below).

### `packages/ui`

Server-safe presentational components shared between pages: `PostCard`, `PostHeader`, `Tag`, and date formatting. No data fetching, no client hooks.

### `apps/web`

The Next.js App Router site. It owns pages, routing, metadata, the content directory, and both test suites. It depends on every package above.

## Data flow

```
content/<category>/<slug>.mdx
        │  (YAML frontmatter + MDX body)
        ▼
packages/content  ── Zod validation ──► typed Post records
        │
        ▼
apps/web pages  ── generateStaticParams ──► one static route per post
        │
        ▼
packages/mdx pipeline  ── compile body ──► KaTeX HTML + components
        │
        ▼
packages/ui + math-viz  ── render ──► static HTML + hydrated graphs
```

Invalid frontmatter, an unknown category/slug, or a compile error fails the build rather than silently producing a broken page.

## Rendering model

Next.js App Router with React Server Components. Most of the tree renders on the server and ships as static HTML.

Post bodies are the one deliberate exception. MDX bodies pass **function props** to client components (`MathGraph`), which React cannot serialize across the server→client boundary. So a post page renders its shell (header, metadata, tags) on the server, then mounts an `MdxContent` client component that imports the compiled MDX module and renders it. The graph components inside hydrate normally.

Consequences worth knowing:

- Math still renders server-side (KaTeX runs at compile time), so formulas are in the HTML without JavaScript.
- The prose around a graph is client-rendered for that route.
- `generateStaticParams` still emits a static route per post; only the body subtree hydrates.

## Build and static generation

`next build` with Turbopack. `generateStaticParams` enumerates every category/slug from the content repository, so all posts are prerendered. Sitemap (`app/sitemap.ts`) and robots (`app/robots.ts`) are generated from the same repository, keeping URLs consistent with content.

## Tooling

- **TypeScript** — shared `tsconfig` bases in `packages/typescript-config`; strict mode everywhere.
- **ESLint** — shared flat config in `packages/eslint-config`, extended per workspace.
- **Prettier** — root config with the Tailwind plugin for class sorting. Note: the plugin may reorder utility class names, so tests assert single tokens rather than class pairs.
- **Tailwind v4** — auto-detection only scans `apps/web`, so `apps/web/app/globals.css` lists `@source` paths for `packages/ui`, `packages/math-viz`, and `packages/mdx`. Add a `@source` entry when a new package ships class names.
- **Turborepo** — task graph and remote/local caching (see `turbo.json`).
- **Secret scanning** — `scripts/scan-secrets.mjs`, run as the `security` CI check, on top of GitHub's native secret scanning.
