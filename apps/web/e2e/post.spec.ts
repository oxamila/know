import { expect, test } from '@playwright/test'

test.describe('post pages', () => {
  test('server response contains rendered content (SEO / no-JS)', async ({ request }) => {
    const response = await request.get('/posts/math/math')
    expect(response.ok()).toBe(true)

    const html = await response.text()
    expect(html).toContain('Trigonometric Functions')
    expect(html).toContain('The Sine Wave')
    // Custom MDX component styling is applied server-side.
    expect(html).toContain('border-b-4')
  })

  test('renders the full post with hydrated interactive graph', async ({ page }) => {
    await page.goto('/posts/math/math')

    await expect(
      page.getByRole('heading', { level: 1, name: 'Trigonometric Functions Explained' }),
    ).toBeVisible()
    await expect(page.getByText(/Explore sine, cosine/)).toBeVisible()

    // MathGraph is a client component: it swaps its placeholder for an SVG on hydration.
    await expect(page.locator('article svg').first()).toBeVisible({ timeout: 15_000 })
    await expect(page.getByRole('button', { name: /Reset View/ }).first()).toBeVisible()
  })

  test('displays formatted metadata with the 3D viewer working', async ({ page }) => {
    await page.goto('/posts/math/3d-surfaces')

    await expect(
      page.getByRole('heading', { level: 1, name: '3D Mathematical Surfaces' }),
    ).toBeVisible()
    await expect(page.getByText('January 25, 2025')).toBeVisible()
    await expect(page.getByTitle('View from X-axis').first()).toBeVisible({ timeout: 15_000 })
  })

  test('calculus notes expose parameter sliders and legend checkboxes', async ({ page }) => {
    await page.goto('/posts/math/calculus-notes')

    await expect(
      page.getByRole('heading', { level: 1, name: /Calculus: Limits, Derivatives/ }),
    ).toBeVisible()

    // The secant demo's h slider and the Riemann staircase's n slider hydrate.
    const hSlider = page.getByRole('slider', { name: 'step h' })
    await expect(hSlider).toBeVisible({ timeout: 15_000 })
    const nSlider = page.getByRole('slider', { name: 'rectangles n' })
    await expect(nSlider).toBeVisible()

    // Dragging a slider updates its readout and redraws the curve.
    await nSlider.fill('16')
    await expect(page.getByText('16.00')).toBeVisible()

    // Multi-function graphs expose checkbox legends.
    const tangentToggle = page.getByRole('checkbox', { name: /Show tangent/ }).first()
    await expect(tangentToggle).toBeVisible()
    await tangentToggle.click()
    await expect(tangentToggle).not.toBeChecked()

    // The Chart's toggles render checkboxes too.
    const chartToggle = page.getByRole('checkbox', { name: /Show Left Riemann sum/ })
    await expect(chartToggle).toBeVisible()
  })
})
