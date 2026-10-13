import { describe, expect, it } from 'vitest'
import { siteUrl } from '../../lib/site'
import { GET } from './route'

describe('llms.txt route', () => {
  it('serves plain text pointing at the docs page', async () => {
    const response = GET()
    expect(response.headers.get('Content-Type')).toContain('text/plain')

    const text = await response.text()
    expect(text).toContain('# Know')
    expect(text).toContain('[Documentation](/docs)')
    expect(text).toContain('MathGraph')
    expect(text).toContain('MathGraph3D')
    expect(text).toContain('Chart')
    expect(text).toContain(siteUrl)
  })
})
