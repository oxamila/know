<!-- BEGIN:turborepo-agent-rules -->

# This is NOT the Turborepo you know

Turborepo configuration, task behavior, and CLI commands can vary between installed versions and may differ from your training data. Resolve the `turbo` package from this file's directory or relevant workspace; in monorepos, it may not be visible from the repository root. For example, run `node -p "require.resolve('turbo/package.json')"` from a workspace that depends on `turbo`.

Read `docs/README.md` inside that installed package first, then read the relevant pages from its `docs/` directory before changing Turborepo configuration or commands. Heed deprecation notices. These bundled docs match the installed package version and are available without network access.

This block is written and re-added by `turbo` before repository-scoped commands when an AI agent is detected. In the Turborepo source repository, its template is defined in `crates/turborepo-cli/src/cli/agent_guidance.rs`. Removing the managed block while updates are enabled means a later qualifying invocation will add it again. Set `"agentGuidance": false` in the root `turbo.json` or `turbo.jsonc` to opt out; this does not remove an existing block. Keep the block committed with your work to avoid an uncommitted change on the next agent invocation.
<!-- END:turborepo-agent-rules -->

# Know — agent guidance

A categorized knowledge site: Next.js 16 (App Router, Turbopack) + React 19, MDX content, KaTeX math, Turborepo + Bun workspaces. This file and `docs/` are the source of truth for how the repo works.

## Hard rules

- **Never** run `git commit`, `git push`, create/open/merge pull requests, or modify git config. The user does all git and PR work personally. `git init` and `git add` are fine.
- **Never** commit or expose secrets. Do not commit `.env*` (only `.env.example`), private keys, or tokens. Load config from environment variables.
- **Never** edit the `<!-- BEGIN:turborepo-agent-rules -->` … `<!-- END:turborepo-agent-rules -->` block above. It is auto-managed by Turborepo. Append project guidance below it.
- `_internal/` is gitignored and private. Never reference it in committed files, docs, or PR text.

## Verify before you finish

Run the full gate and make it green:

```bash
bun install
bun run check      # lint + typecheck + test + build
bun run test:e2e   # Playwright (builds first, needs a browser)
```

`bun run check` is what CI runs. A change is not done until it passes, plus `bun run test:e2e` if you touched pages, content rendering, routing, or the MDX/math pipeline.

## Layout

```
apps/web                the Next.js site (the only deployable) + content + both test suites
packages/content        Zod schema + repository for frontmatter
packages/mdx            remark/rehype pipeline, expressed as serializable specs
packages/math-viz       MathGraph / MathGraph3D client components
packages/ui             shared server-safe presentational components
packages/typescript-config, packages/eslint-config
scripts/scan-secrets.mjs
docs/                   architecture, content, math, testing, deployment
```

Details: `docs/architecture.md`.

## Key facts that will bite you

- **Content is validated.** Frontmatter goes through Zod in `packages/content`. A missing/invalid field fails the build on purpose. See `docs/content.md`.
- **Static math, interactive graphs.** KaTeX runs at compile time and is in the server HTML. Graph components are `'use client'`, so MDX bodies render through a client boundary (`MdxContent`) to allow function props. Do not "fix" this by moving math client-side. See `docs/math.md`.
- **MDX pipeline options must be serializable.** The remark/rehype config in `packages/mdx` crosses Turbopack's JS→Rust boundary, so express plugins as plain-object specs, not closures.
- **Do not repeat the title as `# h1` in a post body.** The header already renders the frontmatter title as the single `h1`. Start bodies at `##`.
- **Bun + isolated linking.** Root `node_modules` holds only root deps; each workspace has its own. A package must declare what it imports, including `@mdx-js/loader` where `@next/mdx` needs it.
- **Tailwind v4 `@source`.** Auto-detection only scans `apps/web`. Utilities used only in `packages/*` (ui, math-viz, mdx) are invisible to the CSS unless listed via `@source` in `apps/web/app/globals.css`. If you add a new class in a package and it doesn't style, check there first.
- **Content dates** may parse as `Date` objects; the schema normalizes them to `YYYY-MM-DD` strings. Do not assume `string` when reading raw YAML.
- **shadcn/ui components are vendored in the app.** `apps/web/components/ui/*` (button, card, table, …) are copied sources, themed via the Tailwind tokens in `apps/web/app/globals.css` (`--primary`, `--card`, …); use `cn()` from `apps/web/lib/utils`. `packages/ui` is styled with the same tokens — keep both in sync visually. Extend via `bunx shadcn@latest add …` from `apps/web`, not by editing registry copies blindly.

## Conventions

- TypeScript strict; match existing style. Prefer role- and text-based test locators.
- New user-facing behavior gets an E2E spec; new logic gets a unit test next to it. Coverage thresholds in `vitest.config.ts` must stay satisfied.
- Add a post under `apps/web/content/<category>/<slug>.mdx`; categories are discovered from the filesystem, no registration.
- Keep docs in `docs/` in sync when you change behavior they describe.

## Environment

- `NEXT_PUBLIC_SITE_URL` drives sitemap, robots, and canonical URLs. Set it in `apps/web/.env.local` locally and in Vercel for production. Never hardcode a domain into content or components.
- Deploy on Vercel with root directory `apps/web`. See `docs/deployment.md`.
