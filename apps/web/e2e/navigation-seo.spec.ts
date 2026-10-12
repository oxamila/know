import { expect, test } from '@playwright/test'

test.describe('not found', () => {
  test('unknown slug returns 404 with the custom page', async ({ page }) => {
    const response = await page.goto('/posts/math/does-not-exist')
    expect(response?.status()).toBe(404)
    await expect(page.getByRole('heading', { name: 'Page not found' })).toBeVisible()
    await expect(page.getByRole('link', { name: /Back to all posts/ })).toBeVisible()
  })

  test('unknown category returns 404', async ({ request }) => {
    const response = await request.get('/posts/nope/math')
    expect(response.status()).toBe(404)
  })

  test('legacy flat URL from the old site returns 404 (not a crash)', async ({ request }) => {
    const response = await request.get('/posts/trigonometry')
    expect(response.status()).toBe(404)
  })
})

test.describe('seo', () => {
  test('each post has a unique, descriptive title', async ({ request }) => {
    const math = await (await request.get('/posts/math/math')).text()
    const surfaces = await (await request.get('/posts/math/3d-surfaces')).text()

    const titleOf = (html: string) => /<title>([^<]+)<\/title>/.exec(html)?.[1] ?? ''
    const mathTitle = titleOf(math)
    const surfacesTitle = titleOf(surfaces)

    expect(mathTitle).toContain('Trigonometric Functions Explained')
    expect(mathTitle).toContain('Know')
    expect(surfacesTitle).toContain('3D Mathematical Surfaces')
    expect(mathTitle).not.toBe(surfacesTitle)
  })

  test('home page has a title and description', async ({ request }) => {
    const html = await (await request.get('/')).text()
    expect(html).toContain('<title>')
    expect(html).toContain('name="description"')
  })

  test('sitemap lists all posts', async ({ request }) => {
    const response = await request.get('/sitemap.xml')
    expect(response.ok()).toBe(true)
    const xml = await response.text()
    expect(xml).toContain('<urlset')
    expect(xml).toContain('/posts/math/math')
    expect(xml).toContain('/posts/math/katex-showcase')
  })

  test('robots points to the sitemap', async ({ request }) => {
    const response = await request.get('/robots.txt')
    expect(response.ok()).toBe(true)
    const text = await response.text()
    expect(text).toContain('Sitemap:')
  })
})
