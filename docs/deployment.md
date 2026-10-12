# Deployment

Know deploys on Vercel. The GitHub repo is `oxamila/know` (public).

## Linking the project

In the Vercel dashboard, import the repo and set:

- **Root Directory**: `apps/web`
- **Framework Preset**: Next.js (auto-detected)
- **Install Command**: `bun install` (Vercel detects Bun from `packageManager` in the root `package.json`)

Because this is a Turborepo monorepo with the app at `apps/web`, pointing Vercel at the app directory is the whole configuration. Turborepo handles the workspace dependencies.

## Builds

`next build` runs with Turbopack. `generateStaticParams` prerenders every non-draft post, so most routes are static and served from the CDN. Sitemap and robots are generated at build time from the same content repository.

A build fails on invalid frontmatter, a missing content file, or a TypeScript error — which is intended. Broken content should not reach production.

## Environment variables

Copy `apps/web/.env.example` to `apps/web/.env.local` for local development. In Vercel, add the same variables under **Settings → Environment Variables** for Production, Preview, and Development as needed.

Rules:

- Never commit real values. `.env*` is gitignored (only `.env.example` is tracked).
- Never hardcode secrets in MDX or config. `bun run secrets:scan` (and the `security` CI job) rejects committed credentials.
- Prefer framework-injected variables (`process.env.NEXT_PUBLIC_*` only for values that are genuinely public).

## Domains

Add custom domains under **Settings → Domains**. `app/sitemap.ts` and `app/robots.ts` build URLs from a single site-URL source — update that source when the production domain changes so the sitemap and robots stay correct.

## CI

Two workflows run on GitHub Actions:

- **CI** (`ci.yml`) — lint, typecheck, unit tests, build, secret scan, and E2E. This is the required check for merging.
- **CodeQL** (`codeql.yml`) — static analysis for JavaScript/TypeScript.

Branch protection requires the `quality` and `security` checks and a pull request before merging to `main`.

## Preview deployments

Vercel builds a preview for every pull request and branch. Combined with required checks, this means every change is verified against a real deployed URL before it can merge.

## Rollback

Vercel keeps a deployment history per environment. Promote a previous deployment or roll back from the dashboard; no rebuild is required for a rollback.

## Checklist for first deploy

1. Push the repo to GitHub (the user does this; agents never commit or push).
2. Import into Vercel with root directory `apps/web`.
3. Add environment variables.
4. Trigger a production build and confirm posts render with math.
5. Verify `/sitemap.xml` and `/robots.txt` resolve.
6. Enable branch protection on `main` (required checks: `quality`, `security`).
