import { expect, test } from '@playwright/test'

test.describe('math rendering (KaTeX)', () => {
  test('inline and display math are rendered server-side as KaTeX', async ({ request }) => {
    const response = await request.get('/posts/math/katex-showcase')
    expect(response.ok()).toBe(true)

    const html = await response.text()
    // KaTeX emits these wrappers at compile time — no client JS required.
    expect(html).toContain('class="katex"')
    expect(html).toContain('katex-display')
    expect(html).toContain('katex-html')

    // The showcase post ships several formulas.
    const inlineCount = html.split('class="katex"').length - 1
    expect(inlineCount).toBeGreaterThanOrEqual(5)
  })

  test('math survives inside an interactive post alongside graphs', async ({ request }) => {
    const html = await (await request.get('/posts/math/math')).text()
    expect(html).toContain('class="katex"')
    // MathGraph client component is server-rendered as its loading placeholder;
    // the interactive viewer hydrates after JS loads.
    expect(html).toContain('Loading graph...')
    expect(html).toContain('f(x) = sin(x)')
  })

  test('every math post renders at least one KaTeX expression', async ({ request }) => {
    for (const path of [
      '/posts/posts/trigonometry',
      '/posts/posts/exponential-growth',
      '/posts/math/katex-showcase',
    ]) {
      const html = await (await request.get(path)).text()
      expect(html, `expected KaTeX output in ${path}`).toContain('class="katex"')
    }
  })
})
