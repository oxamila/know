/** Site-wide constants. */

/** Origin used for canonical URLs, sitemap and robots (no trailing slash). */
export const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000').replace(
  /\/+$/,
  '',
)

export const siteName = 'Know'
