import { expect, test } from '@playwright/test'

test.describe('home page', () => {
  test('renders the hero and every content category', async ({ page }) => {
    await page.goto('/')

    await expect(page.getByRole('heading', { level: 1, name: 'Know' })).toBeVisible()
    await expect(page.getByRole('heading', { level: 2, name: 'math' })).toBeVisible()
    await expect(page.getByRole('heading', { level: 2, name: 'posts' })).toBeVisible()
  })

  test('lists post cards linking to canonical URLs', async ({ page }) => {
    await page.goto('/')

    // Title is intentionally duplicated across math/math and posts/trigonometry;
    // categories sort alphabetically, so math comes first.
    const trigonometryCard = page
      .getByRole('link', { name: /Trigonometric Functions Explained/ })
      .first()
    await expect(trigonometryCard).toBeVisible()
    await expect(trigonometryCard).toHaveAttribute('href', '/posts/math/math')
  })

  test('shows metadata (date, author, tags) on cards', async ({ page }) => {
    await page.goto('/')

    await expect(page.getByText('Math Educator').first()).toBeVisible()
    await expect(page.getByText('#trigonometry').first()).toBeVisible()
  })

  test('navigates from a card to the post page', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('link', { name: /Introduction to Calculus/ }).click()
    await expect(page).toHaveURL(/\/posts\/posts\/intro-to-calculus/)
    await expect(
      page.getByRole('heading', { level: 1, name: 'Introduction to Calculus' }),
    ).toBeVisible()
  })
})
