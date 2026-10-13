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
      <MathGraph
        functions={[{ func: (x) => x, fill: true, fillOpacity: 0.3, color: '#10b981' }]}
      />,
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

  it('renders parameter sliders and redraws the curve when one changes', async () => {
    const { container } = render(
      <MathGraph
        func={(x, params) => Math.sin(params.a * x)}
        params={[{ name: 'a', label: 'freq a', min: 0.5, max: 4, step: 0.5, default: 1 }]}
      />,
    )
    await waitFor(() => expect(container.querySelector('svg')).not.toBeNull())

    const slider = screen.getByRole('slider', { name: 'freq a' })
    expect(slider).toHaveValue('1')

    const pathBefore = container.querySelector('path[fill="none"]')?.getAttribute('d')
    fireEvent.change(slider, { target: { value: '2' } })
    const pathAfter = container.querySelector('path[fill="none"]')?.getAttribute('d')
    expect(pathAfter).not.toBe(pathBefore)
    expect(screen.getByText('2.00')).toBeInTheDocument()
  })

  it('passes slider values into multi-function graphs (functions read params)', async () => {
    render(
      <MathGraph
        functions={[
          { func: (x, p) => p.a * Math.sin(p.b * x), label: 'wave' },
          { func: () => 0, label: 'axis' },
        ]}
        params={[
          { name: 'a', min: 0.5, max: 3, step: 0.5, default: 1 },
          { name: 'b', min: 0.5, max: 4, step: 0.5, default: 1 },
        ]}
      />,
    )
    await waitFor(() => expect(screen.getByRole('slider', { name: 'a' })).toBeInTheDocument())
    fireEvent.change(screen.getByRole('slider', { name: 'a' }), { target: { value: '3' } })
    expect(screen.getByText('3.00')).toBeInTheDocument()
  })

  it('hides and shows curves via legend checkboxes', async () => {
    const { container } = render(
      <MathGraph
        functions={[
          { func: (x) => x, color: '#3b82f6', label: 'linear' },
          { func: (x) => x * x, color: '#ec4899', label: 'quadratic' },
        ]}
      />,
    )
    await waitFor(() => expect(container.querySelector('svg')).not.toBeNull())
    expect(container.querySelectorAll('path[fill="none"]').length).toBe(2)

    const box = screen.getByRole('checkbox', { name: 'Show quadratic' })
    fireEvent.click(box)
    expect(container.querySelectorAll('path[fill="none"]').length).toBe(1)
    expect(box).not.toBeChecked() // legend entry stays visible so it can be re-ticked

    fireEvent.click(box)
    expect(container.querySelectorAll('path[fill="none"]').length).toBe(2)
    expect(box).toBeChecked()
  })
})
