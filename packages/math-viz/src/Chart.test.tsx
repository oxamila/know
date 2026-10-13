import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import Chart from './Chart'

describe('Chart', () => {
  it('renders a line chart with a title', async () => {
    const { container } = render(<Chart title="Growth" type="line" />)
    await waitFor(() => expect(container.querySelector('svg')).not.toBeNull())
    expect(screen.getByText('Growth')).toBeInTheDocument()
  })

  it('renders a bar chart for categorical data', async () => {
    const { container } = render(
      <Chart
        type="bar"
        data={[
          { x: 1, y: 3 },
          { x: 2, y: 5 },
          { x: 3, y: 2 },
        ]}
      />,
    )
    await waitFor(() => expect(container.querySelector('svg')).not.toBeNull())
    expect(container.querySelectorAll('rect').length).toBeGreaterThan(0)
  })

  it('mixes bar, line, and area series via datasets with a legend', async () => {
    const { container } = render(
      <Chart
        datasets={[
          {
            data: [
              { x: 1, y: 3 },
              { x: 2, y: 5 },
            ],
            type: 'bar',
            color: '#3b82f6',
            label: 'Revenue',
          },
          {
            data: [
              { x: 1, y: 4 },
              { x: 2, y: 3 },
            ],
            type: 'line',
            color: '#ec4899',
            label: 'Trend',
          },
          {
            data: [
              { x: 1, y: 1 },
              { x: 2, y: 2 },
            ],
            type: 'area',
            color: '#10b981',
            label: 'Costs',
          },
        ]}
      />,
    )
    await waitFor(() => expect(container.querySelector('svg')).not.toBeNull())

    // Bar series → rects; line/area → stroked paths; area → closed fill path.
    expect(container.querySelectorAll('rect').length).toBeGreaterThan(0)
    expect(container.querySelectorAll('path[stroke="#ec4899"]').length).toBe(1)
    const areaFill = container.querySelector('path[fill="#10b981"]')
    expect(areaFill).not.toBeNull()
    expect(areaFill?.getAttribute('fill-opacity')).toBe('0.25')
    expect(areaFill?.getAttribute('d')).toContain('Z')

    // Legend lists every labelled series.
    expect(screen.getByText('Revenue')).toBeInTheDocument()
    expect(screen.getByText('Trend')).toBeInTheDocument()
    expect(screen.getByText('Costs')).toBeInTheDocument()
  })

  it('keeps the single-series data/type form working (backward compatible)', async () => {
    const { container } = render(
      <Chart
        data={[
          { x: 0, y: 0 },
          { x: 1, y: 2 },
        ]}
        type="line"
      />,
    )
    await waitFor(() => expect(container.querySelector('svg')).not.toBeNull())
    expect(container.querySelectorAll('path[stroke]').length).toBeGreaterThan(0)
    expect(container.querySelectorAll('rect').length).toBe(0)
  })

  it('renders a plain legend by default (no checkboxes without toggles)', async () => {
    render(
      <Chart
        datasets={[
          { data: [{ x: 1, y: 1 }], type: 'line', label: 'Trend' },
          { data: [{ x: 1, y: 2 }], type: 'line', label: 'Forecast' },
        ]}
      />,
    )
    await waitFor(() => expect(screen.getByText('Trend')).toBeInTheDocument())
    expect(screen.queryByRole('checkbox')).toBeNull()
  })

  it('hides and shows series via legend checkboxes when toggles is on', async () => {
    const { container } = render(
      <Chart
        toggles
        datasets={[
          {
            data: [
              { x: 1, y: 3 },
              { x: 2, y: 5 },
            ],
            type: 'bar',
            color: '#3b82f6',
            label: 'Revenue',
          },
          {
            data: [
              { x: 1, y: 4 },
              { x: 2, y: 3 },
            ],
            type: 'line',
            color: '#ec4899',
            label: 'Trend',
          },
        ]}
      />,
    )
    await waitFor(() => expect(container.querySelector('svg')).not.toBeNull())
    expect(container.querySelectorAll('rect').length).toBe(2)
    expect(container.querySelectorAll('path[stroke="#ec4899"]').length).toBe(1)

    // Hide the bar series → rects gone, line remains.
    fireEvent.click(screen.getByRole('checkbox', { name: 'Show Revenue' }))
    expect(container.querySelectorAll('rect').length).toBe(0)
    expect(container.querySelectorAll('path[stroke="#ec4899"]').length).toBe(1)

    // Hide the line series too → no stroked paths left.
    fireEvent.click(screen.getByRole('checkbox', { name: 'Show Trend' }))
    expect(container.querySelectorAll('path[stroke="#ec4899"]').length).toBe(0)

    // Restore both.
    fireEvent.click(screen.getByRole('checkbox', { name: 'Show Revenue' }))
    fireEvent.click(screen.getByRole('checkbox', { name: 'Show Trend' }))
    expect(container.querySelectorAll('rect').length).toBe(2)
    expect(container.querySelectorAll('path[stroke="#ec4899"]').length).toBe(1)
  })
})
