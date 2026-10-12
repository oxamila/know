#!/usr/bin/env node
/**
 * Lightweight secret scanner used as the `security` CI check.
 *
 * GitHub's native secret scanning + push protection are enabled on the repo and
 * cover the strongest signal. This script is a second, fast layer that also
 * catches obviously fake/placeholder credentials so they never look like real
 * secrets in a PR review. It is intentionally dependency-free.
 */

import { readdirSync, readFileSync, statSync } from 'node:fs'
import { dirname, join, relative, sep } from 'node:path'
import { fileURLToPath } from 'node:url'

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), '..')

/** Directories never worth scanning. */
const IGNORED_DIRS = new Set([
  '.git',
  'node_modules',
  '.next',
  'dist',
  'build',
  'coverage',
  '.turbo',
  'test-results',
  'playwright-report',
  '.vercel',
  '_internal',
])

/**
 * Patterns that should always fail the build. Each entry must have at least one
 * `required` literal that is NOT satisfied by the placeholder class, so common
 * example credentials (AKIAEXAMPLE, YOUR_xxx, etc.) are ignored.
 */
const RULES = [
  {
    id: 'aws-access-key-id',
    description: 'AWS access key ID (AKIA…)',
    regex: /\b(AKIA|ASIA)[0-9A-Z]{16}\b/g,
    denyIfPresent: [/EXAMPLE/i, /YOUR_/i],
  },
  {
    id: 'github-token',
    description: 'GitHub token',
    regex: /\b(ghp|gho|ghu|ghs|ghr)_[A-Za-z0-9]{36,}\b/g,
    denyIfPresent: [],
  },
  {
    id: 'github-fine-grained-pat',
    description: 'GitHub fine-grained personal access token',
    regex: /\bgithub_pat_[A-Za-z0-9_]{22,}\b/g,
    denyIfPresent: [],
  },
  {
    id: 'slack-token',
    description: 'Slack token',
    regex: /\bxox[abprs]-[0-9A-Za-z-]{10,}\b/g,
    denyIfPresent: [],
  },
  {
    id: 'private-key-block',
    description: 'PEM private key block',
    regex: /-----BEGIN (?:RSA |EC |OPENSSH |DSA |PGP )?PRIVATE KEY-----/g,
    denyIfPresent: [],
  },
  {
    id: 'stripe-secret-key',
    description: 'Stripe secret key',
    regex: /\b(?:sk|rk)_(?:live|test)_[0-9a-zA-Z]{20,}\b/g,
    denyIfPresent: [],
  },
  {
    id: 'google-api-key',
    description: 'Google API key',
    regex: /\bAIza[0-9A-Za-z_-]{35}\b/g,
    denyIfPresent: [/EXAMPLE/i],
  },
  {
    id: 'npm-token',
    description: 'npm access token',
    regex: /\bnpm_[A-Za-z0-9]{36}\b/g,
    denyIfPresent: [],
  },
  {
    id: 'generic-hardcoded-secret',
    description: 'Generic hardcoded credential assignment',
    regex:
      /\b(?:password|passwd|secret|api[_-]?key|access[_-]?token|auth[_-]?token)\b\s*[:=]\s*["'][^"'\s]{16,}["']/gi,
    denyIfPresent: [
      /process\.env/i,
      /YOUR_/i,
      /EXAMPLE/i,
      /PLACEHOLDER/i,
      /CHANGEME/i,
      /<[^>]+>/i,
      /example\.com/i,
    ],
  },
]

/** Files matched by extension are scanned; everything else is skipped. */
const SCANNABLE_EXT = new Set([
  '.js',
  '.mjs',
  '.cjs',
  '.ts',
  '.tsx',
  '.jsx',
  '.json',
  '.mdx',
  '.md',
  '.yml',
  '.yaml',
  '.toml',
  '.env',
  '.txt',
  '.html',
  '.css',
  '.sh',
  '.ps1',
])

/** Filenames that are scanned regardless of extension. */
const SCANNABLE_NAMES = new Set([
  '.env',
  '.env.local',
  '.env.production',
  '.env.development',
  '.npmrc',
  '.netrc',
  'Dockerfile',
  'LICENSE',
])

/** Files that are always skipped even if the extension matches. */
const SKIP_FILES = new Set([
  'package-lock.json',
  'bun.lock',
  'bun.lockb',
  'yarn.lock',
  'pnpm-lock.yaml',
  'scan-secrets.mjs',
])

function isScannable(name, ext) {
  if (SKIP_FILES.has(name)) return false
  if (SCANNABLE_NAMES.has(name)) return true
  return SCANNABLE_EXT.has(ext)
}

function listFiles(dir, out = []) {
  let entries
  try {
    entries = readdirSync(dir)
  } catch {
    return out
  }
  for (const entry of entries) {
    if (IGNORED_DIRS.has(entry)) continue
    const abs = join(dir, entry)
    let stats
    try {
      stats = statSync(abs)
    } catch {
      continue
    }
    if (stats.isDirectory()) {
      listFiles(abs, out)
    } else if (stats.isFile()) {
      out.push(abs)
    }
  }
  return out
}

function scanFile(absPath) {
  const rel = relative(repoRoot, absPath).split(sep).join('/')
  const name = absPath.split(sep).pop()
  const dot = name.lastIndexOf('.')
  const ext = dot > 0 ? name.slice(dot).toLowerCase() : ''
  if (!isScannable(name, ext)) return []

  let content
  try {
    content = readFileSync(absPath, 'utf8')
  } catch {
    return []
  }

  const findings = []
  for (const rule of RULES) {
    rule.regex.lastIndex = 0
    let match
    while ((match = rule.regex.exec(content)) !== null) {
      const snippet = match[0]
      if (rule.denyIfPresent.some((re) => re.test(snippet))) continue
      const line = content.slice(0, match.index).split('\n').length
      findings.push({ file: rel, line, rule: rule.id, description: rule.description })
      // Avoid reporting the same match twice for zero-width regexes.
      if (rule.regex.lastIndex === match.index) rule.regex.lastIndex += 1
    }
  }
  return findings
}

function main() {
  const explicit = process.argv.slice(2)
  const files = explicit.length > 0 ? explicit.map((f) => join(repoRoot, f)) : listFiles(repoRoot)

  const findings = files.flatMap((f) => scanFile(f))

  if (findings.length > 0) {
    console.error(`scan-secrets: ${findings.length} potential secret(s) found:\n`)
    for (const f of findings) {
      console.error(`  ${f.file}:${f.line}  [${f.rule}] ${f.description}`)
    }
    console.error('\nRemove the secret, rotate it, and load it from the environment instead.')
    process.exit(1)
  }

  console.log(`scan-secrets: clean (checked ${files.length} files).`)
}

main()
