import { expect, test } from '@playwright/test'

test.describe('docs page', () => {
  test('renders the reference with all three components documented', async ({ page }) => {
    await page.goto('/docs')

    await expect(page.getByRole('heading', { level: 1, name: 'Documentation' })).toBeVisible()
    await expect(
      page.getByRole('heading', { name: /MathGraph — interactive 2D plots/ }),
    ).toBeVisible()
    await expect(
      page.getByRole('heading', { name: /MathGraph3D — interactive 3D surfaces/ }),
    ).toBeVisible()
    await expect(
      page.getByRole('heading', { name: /Chart — line, bar, and area charts/ }),
    ).toBeVisible()
    await expect(page.getByRole('heading', { name: 'MDX elements' })).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Math syntax (KaTeX)' })).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Frontmatter' })).toBeVisible()
  })

  test('live demos hydrate their interactive controls', async ({ page }) => {
    await page.goto('/docs')

    // MathGraph demos render their reset control after hydration.
    const resetButtons = page.getByRole('button', { name: /Reset View/ })
    await expect(resetButtons.first()).toBeVisible()
    expect(await resetButtons.count()).toBeGreaterThanOrEqual(2)
  })

  test('fill and combo-chart demos render their labels', async ({ page }) => {
    await page.goto('/docs')

    // Fill demo legend + combo chart legend (series labels).
    await expect(page.getByRole('heading', { name: 'sin(x) with shaded area' })).toBeVisible()
    await expect(
      page.getByRole('heading', { name: 'Bars + line + area on one chart' }),
    ).toBeVisible()
    await expect(page.getByText('Revenue').first()).toBeVisible()
    await expect(page.getByText('Costs').first()).toBeVisible()
  })

  test('prop tables document the key props', async ({ page }) => {
    await page.goto('/docs')

    // MathGraph multi-function prop + 3D-only props.
    await expect(page.getByText('functions', { exact: true }).first()).toBeVisible()
    await expect(page.getByText('surfaces', { exact: true }).first()).toBeVisible()
    await expect(page.getByText('gridSize', { exact: true })).toBeVisible()
    await expect(page.getByText('params', { exact: true }).first()).toBeVisible()
    await expect(page.getByText('toggles', { exact: true }).first()).toBeVisible()
  })

  test('slider and checkbox controls hydrate and respond', async ({ page }) => {
    await page.goto('/docs')

    // Parameter sliders from the ParamsDemo section.
    await expect(page.getByRole('heading', { name: 'Parameter sliders' })).toBeVisible()
    const slider = page.getByRole('slider', { name: 'amplitude a' })
    await expect(slider).toBeVisible()
    await expect(slider).toHaveValue('1')
    await slider.fill('2')
    await expect(page.getByText('2.00')).toBeVisible()

    // Legend checkboxes (MathGraph multi-function demos + Chart toggles demo).
    const chartToggle = page.getByRole('checkbox', { name: 'Show Revenue' })
    await expect(chartToggle).toBeVisible()
    await chartToggle.click()
    await expect(chartToggle).not.toBeChecked()
    await chartToggle.click()
    await expect(chartToggle).toBeChecked()

    const graphToggle = page.getByRole('checkbox', { name: 'Show cos(x)' }).first()
    await expect(graphToggle).toBeChecked()
    await graphToggle.click()
    await expect(graphToggle).not.toBeChecked()
  })

  test('is reachable from the site nav and listed in the sitemap', async ({ page, request }) => {
    await page.goto('/')
    await page.getByRole('link', { name: 'Docs' }).click()
    await expect(page).toHaveURL(/\/docs$/)
    await expect(page.getByRole('heading', { level: 1, name: 'Documentation' })).toBeVisible()

    const xml = await (await request.get('/sitemap.xml')).text()
    expect(xml).toContain('/docs')
  })
})

test.describe('llms.txt', () => {
  test('is served as plain text and points at the docs page', async ({ request }) => {
    const response = await request.get('/llms.txt')
    expect(response.ok()).toBe(true)
    expect(response.headers()['content-type']).toContain('text/plain')

    const text = await response.text()
    expect(text).toContain('# Know')
    expect(text).toContain('[Documentation](/docs)')
    expect(text).toContain('MathGraph')
    expect(text).toContain('MathGraph3D')
  })
})
