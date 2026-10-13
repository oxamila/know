# Testing

Know has two test layers, both wired into `bun run check` and CI:

- **Unit tests** with Vitest, per workspace.
- **End-to-end tests** with Playwright, in `apps/web`.

## Unit tests

Each package that has logic runs Vitest. The root `bun run test` fans out through Turborepo.

```bash
bun run test              # all packages
cd apps/web && bun run test   # one package
```

Test files sit next to the code (`lib/content.test.ts` next to `lib/content.ts`) and match `*.test.ts` / `*.test.tsx`.

### Environment

React component tests use `jsdom` (set per package via `environment: 'jsdom'` in `vitest.config.ts`). Plain logic tests run in Node.

### Coverage

`apps/web` and the packages enforce coverage thresholds via `@vitest/coverage-v8`. Thresholds live in each `vitest.config.ts`; a run that drops below them fails, so coverage cannot silently regress.

### What is covered

- `packages/content` — schema validation, repository queries, category discovery, body extraction, the integrity gate that every post parses.
- `packages/mdx` — the remark/rehype pipeline, including that KaTeX output is produced and math nodes survive.
- `packages/math-viz` — component rendering and prop handling.
- `packages/ui` — component rendering.
- `apps/web` — content repository wiring, grouping, sitemap and robots output.

## End-to-end tests

Playwright drives a real browser against a production build.

```bash
bun run test:e2e
```

This depends on `build`, so Turborepo builds first, then Playwright starts a server and runs the specs in `apps/web/e2e/`.

### Layout

```
apps/web/
  e2e/
    home.spec.ts           home page, cards, navigation
    post.spec.ts           post rendering, metadata, interactive graphs
    math.spec.ts           KaTeX output in the served HTML
    docs.spec.ts           /docs reference page, live demos, /llms.txt
    navigation-seo.spec.ts 404 handling, canonical URLs, meta tags
  playwright.config.ts
```

### What they assert

- Pages render and link correctly (click a card, land on the post).
- KaTeX markup is present in the server HTML for math posts — proving math is static, not client-rendered.
- The interactive graph hydrates and its controls appear.
- An unknown slug returns the custom 404.
- Canonical URLs and metadata are correct.

### How the server is managed

`playwright.config.ts` uses the `webServer` option: it starts the production server (`bun run start` in `apps/web`) and reuses it across specs. `baseURL` points at that server, so specs use relative URLs (`page.goto('/')`).

### Selectors

Prefer role- and text-based locators (`getByRole`, `getByText`) over CSS. Cards carry an `aria-label` with the post title so a link can be located by name even though its inner text is rich.

## Running a single test

```bash
# one unit file
cd apps/web && bunx vitest run lib/content.test.ts

# one E2E spec
cd apps/web && bunx playwright test e2e/post.spec.ts
```

## When a test fails

- **Unit**: read the assertion diff; a schema failure usually means malformed frontmatter.
- **E2E "server closed"**: the `webServer` failed to start — run `bun run build` then `bun run start` in `apps/web` to see the error directly.
- **E2E timeout on a graph**: hydration did not complete; confirm the component is imported in the MDX body and the post is not a draft.

## Adding tests

- New logic → a unit test next to it, and bump coverage if the new code path is untested.
- New user-facing behavior → an E2E spec in the file that matches the surface (`home`, `post`, `math`, `docs`, `navigation-seo`).
