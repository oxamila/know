import { render, screen, waitFor } from '@testing-library/react'
import type { ComponentProps } from 'react'
import { describe, expect, it, vi } from 'vitest'
import { PostCard } from './PostCard'

vi.mock('next/link', () => ({
  default: ({ href, children, ...rest }: ComponentProps<'a'>) => (
    <a href={href} {...rest}>
      {children}
    </a>
  ),
}))

const post = {
  slug: 'trigonometry',
  category: 'math',
  title: 'Trigonometric Functions Explained',
  description: 'Explore sine, cosine, and tangent with beautiful visualizations',
  date: '2025-01-20',
  author: 'Math Educator',
  tags: ['trigonometry', 'waves'],
}

describe('PostCard', () => {
  it('links to the canonical post URL', () => {
    render(<PostCard post={post} />)
    const link = screen.getByRole('link')
    expect(link).toHaveAttribute('href', '/posts/math/trigonometry')
  })

  it('renders title, description and author', () => {
    render(<PostCard post={post} />)
    expect(screen.getByText('Trigonometric Functions Explained')).toBeInTheDocument()
    expect(screen.getByText(/Explore sine, cosine/)).toBeInTheDocument()
    expect(screen.getByText(/Math Educator/)).toBeInTheDocument()
  })

  it('renders tag chips', () => {
    render(<PostCard post={post} />)
    expect(screen.getByText('#trigonometry')).toBeInTheDocument()
    expect(screen.getByText('#waves')).toBeInTheDocument()
  })

  it('renders the date deterministically (UTC)', async () => {
    const { container } = render(<PostCard post={post} />)
    await waitFor(() => expect(container.querySelector('time')).not.toBeNull())
    const time = container.querySelector('time')
    expect(time).toHaveAttribute('dateTime', '2025-01-20')
    expect(time).toHaveTextContent('Jan 20, 2025')
  })
})
