import type { PluggableList } from 'unified'

export type PluginSpec = string | [string, Record<string, unknown>]

export declare const remarkPlugins: PluggableList
export declare const rehypePlugins: PluggableList
export declare const remarkPluginSpecs: PluginSpec[]
export declare const rehypePluginSpecs: string[]
