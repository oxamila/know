import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import MathGraph from './MathGraph'

describe('MathGraph', () => {
  it('shows a loading placeholder first, then the interactive SVG', async () => {
    const { container } = render(<MathGraph title="f(x) = sin(x)" func={(x) => Math.sin(x)} />)
    await waitFor(() => expect(container.querySelector('svg')).not.toBeNull())
    expect(screen.getByText('f(x) = sin(x)')).toBeInTheDocument()
  })

  it('renders a path for the plotted function', async () => {
    const { container } = render(<MathGraph func={(x) => x * x} />)
    await waitFor(() => expect(container.querySelector('svg')).not.toBeNull())
    const paths = container.querySelectorAll('path')
    expect(paths.length).toBeGreaterThan(0)
    expect(paths[0]?.getAttribute('d')).toBeTruthy()
  })

  it('plots multiple functions and shows a labelled legend', async () => {
    render(
      <MathGraph
        functions={[
          { func: (x) => Math.sin(x), color: '#3b82f6', label: 'sin(x)' },
          { func: (x) => Math.cos(x), color: '#ec4899', label: 'cos(x)' },
        ]}
        showLegend
      />,
    )
    expect(await screen.findByText('sin(x)')).toBeInTheDocument()
    expect(screen.getByText('cos(x)')).toBeInTheDocument()
  })

  it('renders a translucent area fill under functions marked fill: true', async () => {
    const { container } = render(
      <MathGraph functions={[{ func: (x) => x, fill: true, fillOpacity: 0.3, color: '#10b981' }]} />,
    )
    await waitFor(() => expect(container.querySelector('svg')).not.toBeNull())

    const fill = container.querySelector('path[fill="#10b981"]')
    expect(fill).not.toBeNull()
    expect(fill?.getAttribute('fill-opacity')).toBe('0.3')
    expect(fill?.getAttribute('d')).toContain('Z') // closed path
    // The stroke line (fill="none") still renders alongside the fill.
    expect(container.querySelector('path[fill="none"]')).not.toBeNull()
  })

  it('does not render area fills for functions without fill: true', async () => {
    const { container } = render(<MathGraph func={(x) => x * x} />)
    await waitFor(() => expect(container.querySelector('svg')).not.toBeNull())
    // Only the curve line exists — no closed fill path.
    const paths = [...container.querySelectorAll('path')]
    expect(paths.every((p) => p.getAttribute('fill') === 'none')).toBe(true)
  })

  it('zooms on wheel (range changes) and Reset View restores the initial range', async () => {
    const { container } = render(<MathGraph func={(x) => x} xMin={-2} xMax={2} />)
    await waitFor(() => expect(container.querySelector('svg')).not.toBeNull())

    expect(screen.getByText(/Range: \[-2\.00, 2\.00\]/)).toBeInTheDocument()

    const svg = container.querySelector('svg') as Element
    fireEvent.wheel(svg, { deltaY: -120 })
    expect(screen.queryByText(/Range: \[-2\.00, 2\.00\]/)).toBeNull()

    fireEvent.click(screen.getByRole('button', { name: /Reset View/ }))
    expect(screen.getByText(/Range: \[-2\.00, 2\.00\]/)).toBeInTheDocument()
  })

  it('supports dragging (pan) without crashing', async () => {
    const { container } = render(<MathGraph func={(x) => Math.cos(x)} />)
    await waitFor(() => expect(container.querySelector('svg')).not.toBeNull())
    const svg = container.querySelector('svg') as Element

    fireEvent.mouseDown(svg, { clientX: 100, clientY: 100 })
    fireEvent.mouseMove(svg, { clientX: 140, clientY: 120 })
    fireEvent.mouseUp(svg, { clientX: 140, clientY: 120 })

    expect(container.querySelector('svg')).not.toBeNull()
  })
})
