import { render, screen, waitFor } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import MathGraph3D from './MathGraph3D'

describe('MathGraph3D', () => {
  it('renders the interactive 3D SVG with axis controls', async () => {
    const { container } = render(
      <MathGraph3D func={(x, y) => x * x + y * y} xMin={-3} xMax={3} yMin={-3} yMax={3} />,
    )
    await waitFor(() => expect(container.querySelector('svg')).not.toBeNull())
    expect(screen.getByTitle('View from X-axis')).toBeInTheDocument()
    expect(screen.getByTitle('View from Y-axis')).toBeInTheDocument()
    expect(screen.getByTitle('View from Z-axis (top-down)')).toBeInTheDocument()
  })

  it('renders a titled surface', async () => {
    render(<MathGraph3D func={(x) => Math.sin(x)} title="Paraboloid: z = x² + y²" />)
    expect(await screen.findByText('Paraboloid: z = x² + y²')).toBeInTheDocument()
  })

  it('supports comparing multiple surfaces', async () => {
    const { container } = render(
      <MathGraph3D
        surfaces={[
          { func: (x, y) => x * x + y * y, color: '#3b82f6', label: 'z = x² + y²' },
          { func: (x, y) => -(x * x + y * y), color: '#ec4899', label: 'z = -(x² + y²)' },
        ]}
      />,
    )
    await waitFor(() => expect(container.querySelector('svg')).not.toBeNull())
    expect(await screen.findByText('z = x² + y²')).toBeInTheDocument()
    expect(screen.getByText('z = -(x² + y²)')).toBeInTheDocument()
  })
})
