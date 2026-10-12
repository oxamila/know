/**
 * Shared remark/rehype pipeline for every MDX file in the project.
 *
 * The specs (module specifiers + options) are the source of truth and live in
 * `plugin-specs.mjs` — this module loads them into ready-to-use plugin arrays
 * for unit tests and Node scripts. `apps/web/next.config.mjs` passes the raw
 * specs to @next/mdx so Turbopack can serialize the loader options.
 *
 * Order matters (see plugin-specs.mjs).
 */
import { rehypePluginSpecs, remarkPluginSpecs } from './plugin-specs.mjs'

async function loadSpec(spec) {
  const [specifier, options] = Array.isArray(spec) ? spec : [spec]
  const module = await import(specifier)
  const plugin = module.default ?? module
  return options === undefined ? plugin : [plugin, options]
}

export const remarkPlugins = await Promise.all(remarkPluginSpecs.map(loadSpec))
export const rehypePlugins = await Promise.all(rehypePluginSpecs.map(loadSpec))

export { rehypePluginSpecs, remarkPluginSpecs }
