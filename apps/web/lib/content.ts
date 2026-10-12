import fs from 'node:fs'
import path from 'node:path'
import { createContentRepository, type ContentRepository } from '@repo/content'

/**
 * Resolves the content root regardless of the working directory used to start
 * Next.js (`apps/web` directly, or the monorepo root via turbo).
 */
function resolveContentDir(): string {
  const candidates = [
    path.join(process.cwd(), 'content'),
    path.join(process.cwd(), 'apps', 'web', 'content'),
  ]
  const found = candidates.find((candidate) => fs.existsSync(candidate))
  if (!found) {
    throw new Error(`Content directory not found. Looked in:\n- ${candidates.join('\n- ')}`)
  }
  return found
}

let repository: ContentRepository | null = null

/** Lazily-created, process-wide content repository. */
export function getContentRepository(): ContentRepository {
  repository ??= createContentRepository(resolveContentDir())
  return repository
}
