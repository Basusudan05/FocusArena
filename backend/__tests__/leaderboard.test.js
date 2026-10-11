/**
 * Unit tests for GET /api/leaderboard
 * Supabase is fully stubbed — no network calls are made.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockFrom = vi.fn()
vi.mock('../config/supabase.js', () => ({ default: { from: mockFrom } }))

const { getGlobalLeaderboard } = await import('../controllers/leaderboardController.js')

function makeReq(query = {}) {
  return { query, user: { id: 'some-user' } }
}
function makeRes() {
  const r = {}
  r.status = vi.fn(() => r)
  r.json = vi.fn(() => r)
  return r
}

// Build a chain matching: .select().gte().  OR  .select() (no gte)
function sessionsChain(value, expectGte = false) {
  const p = Promise.resolve(value)
  return {
    select: () => ({
      gte: () => p,   // period-filtered path
      then: p.then.bind(p), // no-filter path (direct await)
      // make it awaitable directly when no .gte() is called
      ...p,
    }),
  }
}

// Simpler: chain that always resolves, handles both .gte() and direct await
function makeSessionsFrom(value) {
  const p = Promise.resolve(value)
  return {
    select: () => {
      const inner = { ...p }
      inner.gte = () => Promise.resolve(value)
      // Spread promise so the object itself is thenable
      inner[Symbol.toStringTag] = 'Promise'
      inner.then = p.then.bind(p)
      inner.catch = p.catch.bind(p)
      inner.finally = p.finally.bind(p)
      return inner
    },
  }
}

function profilesChain(value) {
  return {
    select: () => ({ in: () => Promise.resolve(value) }),
  }
}

describe('getGlobalLeaderboard', () => {
  beforeEach(() => vi.clearAllMocks())

  it('returns empty array when no sessions exist', async () => {
    mockFrom.mockReturnValueOnce(makeSessionsFrom({ data: [], error: null }))
    const req = makeReq({ period: 'allTime' })
    const res = makeRes()
    await getGlobalLeaderboard(req, res)
    expect(res.json).toHaveBeenCalledWith([])
  })

  it('returns ranked entries sorted by points descending', async () => {
    mockFrom
      .mockReturnValueOnce(makeSessionsFrom({ data: [
        { user_id: 'u1', points: 30, duration_minutes: 30 },
        { user_id: 'u2', points: 80, duration_minutes: 80 },
        { user_id: 'u1', points: 20, duration_minutes: 20 }, // u1 total = 50
      ], error: null }))
      .mockReturnValueOnce(profilesChain({ data: [
        { id: 'u1', full_name: 'Alice', username: null, email: null },
        { id: 'u2', full_name: 'Bob',   username: null, email: null },
      ], error: null }))

    const req = makeReq({ period: 'allTime' })
    const res = makeRes()
    await getGlobalLeaderboard(req, res)
    const entries = res.json.mock.calls[0][0]
    expect(entries[0].username).toBe('Bob')
    expect(entries[0].points).toBe(80)
    expect(entries[0].rank).toBe(1)
    expect(entries[1].username).toBe('Alice')
    expect(entries[1].points).toBe(50)
    expect(entries[1].rank).toBe(2)
  })

  it('returns 500 when sessions query fails', async () => {
    mockFrom.mockReturnValueOnce(makeSessionsFrom({ data: null, error: { message: 'DB error' } }))
    const req = makeReq({})
    const res = makeRes()
    await getGlobalLeaderboard(req, res)
    expect(res.status).toHaveBeenCalledWith(500)
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ error: 'DB error' }))
  })

  it('returns 500 when profiles query fails', async () => {
    mockFrom
      .mockReturnValueOnce(makeSessionsFrom({ data: [
        { user_id: 'u1', points: 10, duration_minutes: 10 },
      ], error: null }))
      .mockReturnValueOnce(profilesChain({ data: null, error: { message: 'profiles error' } }))
    const req = makeReq({})
    const res = makeRes()
    await getGlobalLeaderboard(req, res)
    expect(res.status).toHaveBeenCalledWith(500)
  })

  it('falls back to email when full_name and username are missing', async () => {
    mockFrom
      .mockReturnValueOnce(makeSessionsFrom({ data: [
        { user_id: 'u1', points: 5, duration_minutes: 5 },
      ], error: null }))
      .mockReturnValueOnce(profilesChain({ data: [
        { id: 'u1', full_name: null, username: null, email: 'user@test.com' },
      ], error: null }))
    const req = makeReq({})
    const res = makeRes()
    await getGlobalLeaderboard(req, res)
    const entries = res.json.mock.calls[0][0]
    expect(entries[0].username).toBe('user@test.com')
  })
})
