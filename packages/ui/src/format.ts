/** Deterministic, timezone-safe date formatting for post metadata. */

const SHORT_OPTIONS: Intl.DateTimeFormatOptions = {
  year: 'numeric',
  month: 'short',
  day: '2-digit',
  timeZone: 'UTC',
}

const LONG_OPTIONS: Intl.DateTimeFormatOptions = {
  year: 'numeric',
  month: 'long',
  day: 'numeric',
  timeZone: 'UTC',
}

/** `2025-01-20` → `Jan 20, 2025` (always UTC — no hydration mismatches). */
export function formatDateShort(isoDate: string): string {
  return new Date(isoDate).toLocaleDateString('en-US', SHORT_OPTIONS)
}

/** `2025-01-20` → `January 20, 2025` (always UTC). */
export function formatDateLong(isoDate: string): string {
  return new Date(isoDate).toLocaleDateString('en-US', LONG_OPTIONS)
}
