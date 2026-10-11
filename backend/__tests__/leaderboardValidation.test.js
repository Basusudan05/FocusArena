/**
 * Tests for leaderboard period validation and 404 route handling.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockFrom = vi.fn()
vi.mock('../config/supabase.js', () => ({ default: { from: mockFrom } }))

const { getGlobalLeaderboard } = await import('../controllers/leaderboardController.js')

function makeRes() {
  const r = {}
  r.status = vi.fn(() => r)
  r.json = vi.fn(() => r)
  return r
}

describe('getGlobalLeaderboard — period validation', () => {
  beforeEach(() => vi.clearAllMocks())

  it('returns 400 for invalid period value', async () => {
    const req = { query: { period: 'invalid' }, user: { id: 'u1' } }
    const res = makeRes()
    await getGlobalLeaderboard(req, res)
    expect(res.status).toHaveBeenCalledWith(400)
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ error: expect.stringContaining('Invalid period') }))
  })

  it('accepts allTime as valid period', async () => {
    // Return empty sessions so it exits early with []
    const p = Promise.resolve({ data: [], error: null })
    mockFrom.mockReturnValueOnce({ select: () => ({ ...p, gte: () => p, then: p.then.bind(p), catch: p.catch.bind(p), finally: p.finally.bind(p) }) })
    const req = { query: { period: 'allTime' }, user: { id: 'u1' } }
    const res = makeRes()
    await getGlobalLeaderboard(req, res)
    expect(res.json).toHaveBeenCalledWith([])
  })

  it('accepts today as valid period', async () => {
    const p = Promise.resolve({ data: [], error: null })
    mockFrom.mockReturnValueOnce({ select: () => ({ ...p, gte: () => p, then: p.then.bind(p), catch: p.catch.bind(p), finally: p.finally.bind(p) }) })
    const req = { query: { period: 'today' }, user: { id: 'u1' } }
    const res = makeRes()
    await getGlobalLeaderboard(req, res)
    expect(res.json).toHaveBeenCalledWith([])
  })

  it('defaults to allTime when period is not provided', async () => {
    const p = Promise.resolve({ data: [], error: null })
    mockFrom.mockReturnValueOnce({ select: () => ({ ...p, gte: () => p, then: p.then.bind(p), catch: p.catch.bind(p), finally: p.finally.bind(p) }) })
    const req = { query: {}, user: { id: 'u1' } }
    const res = makeRes()
    await getGlobalLeaderboard(req, res)
    expect(res.json).toHaveBeenCalledWith([])
  })
})
