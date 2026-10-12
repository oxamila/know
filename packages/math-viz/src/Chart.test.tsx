import { render, screen, waitFor } from '@testing-library/react'
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
})
