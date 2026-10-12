import { describe, expect, it } from 'vitest'
import { groupPostsByCategory } from './group'

const alpha = { slug: 'a', category: 'math' }
const beta = { slug: 'b', category: 'posts' }
const gamma = { slug: 'c', category: 'math' }
const delta = { slug: 'd', category: 'art' }

describe('groupPostsByCategory', () => {
  it('groups posts while preserving input order inside a group', () => {
    const groups = groupPostsByCategory([alpha, gamma, beta])
    expect(Object.fromEntries(groups)).toEqual({
      math: [alpha, gamma],
      posts: [beta],
    })
  })

  it('returns categories sorted alphabetically', () => {
    const categories = groupPostsByCategory([alpha, beta, delta]).map(([category]) => category)
    expect(categories).toEqual(['art', 'math', 'posts'])
  })

  it('never yields empty groups', () => {
    expect(groupPostsByCategory([])).toEqual([])
  })

  it('handles a single group', () => {
    expect(groupPostsByCategory([alpha])).toEqual([['math', [alpha]]])
  })
})
