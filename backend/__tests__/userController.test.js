/**
 * Unit tests for profile endpoints (userController).
 * Verifies auth enforcement, field-level protection, and correct HTTP codes.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockFrom = vi.fn()
vi.mock('../config/supabase.js', () => ({ default: { from: mockFrom } }))

const { getProfileById, upsertProfile, getUsers } = await import('../controllers/userController.js')

function makeRes() {
  const r = {}
  r.status = vi.fn(() => r)
  r.json = vi.fn(() => r)
  return r
}

// Minimal Supabase chain helpers
function singleChain(value) {
  return { select: () => ({ eq: () => ({ single: () => Promise.resolve(value) }) }) }
}
function upsertChain(value) {
  const p = Promise.resolve(value)
  return {
    upsert: () => ({
      select: () => ({ single: () => p }),
    }),
  }
}
function selectAllChain(value) {
  return { select: () => Promise.resolve(value) }
}

// ── getProfileById ───────────────────────────────────────────────────────────
describe('getProfileById', () => {
  beforeEach(() => vi.clearAllMocks())

  it('returns 403 when requesting a different user profile', async () => {
    const req = { params: { id: 'other-user' }, user: { id: 'current-user' } }
    const res = makeRes()
    await getProfileById(req, res)
    expect(res.status).toHaveBeenCalledWith(403)
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ error: expect.stringContaining('own') }))
  })

  it('returns 200 with profile data for own profile', async () => {
    const profile = { id: 'user-1', full_name: 'Alice', email: 'a@a.com' }
    mockFrom.mockReturnValueOnce(singleChain({ data: profile, error: null }))
    const req = { params: { id: 'user-1' }, user: { id: 'user-1' } }
    const res = makeRes()
    await getProfileById(req, res)
    expect(res.json).toHaveBeenCalledWith(profile)
  })

  it('returns 404 when profile not found', async () => {
    mockFrom.mockReturnValueOnce(singleChain({ data: null, error: { code: 'PGRST116', message: 'no rows' } }))
    const req = { params: { id: 'user-1' }, user: { id: 'user-1' } }
    const res = makeRes()
    await getProfileById(req, res)
    expect(res.status).toHaveBeenCalledWith(404)
  })
})

// ── upsertProfile ────────────────────────────────────────────────────────────
describe('upsertProfile', () => {
  beforeEach(() => vi.clearAllMocks())

  it('returns 403 when trying to update another user profile', async () => {
    const req = { params: { id: 'victim' }, user: { id: 'attacker' }, body: { full_name: 'Hacked' } }
    const res = makeRes()
    await upsertProfile(req, res)
    expect(res.status).toHaveBeenCalledWith(403)
  })

  it('returns 400 when body has no valid fields', async () => {
    const req = { params: { id: 'user-1' }, user: { id: 'user-1' }, body: { unknown_column: 'x' } }
    const res = makeRes()
    await upsertProfile(req, res)
    expect(res.status).toHaveBeenCalledWith(400)
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ error: expect.stringContaining('No valid fields') }))
  })

  it('returns 400 when body is empty', async () => {
    const req = { params: { id: 'user-1' }, user: { id: 'user-1' }, body: {} }
    const res = makeRes()
    await upsertProfile(req, res)
    expect(res.status).toHaveBeenCalledWith(400)
  })

  it('strips disallowed fields and saves only allowed ones', async () => {
    let capturedUpsertArg = null
    mockFrom.mockReturnValueOnce({
      upsert: (payload) => {
        capturedUpsertArg = payload
        return { select: () => ({ single: () => Promise.resolve({ data: { id: 'user-1', full_name: 'Alice' }, error: null }) }) }
      },
    })
    const req = {
      params: { id: 'user-1' },
      user: { id: 'user-1' },
      body: { full_name: 'Alice', evil_column: 'DROP TABLE', role: 'admin' },
    }
    const res = makeRes()
    await upsertProfile(req, res)
    expect(capturedUpsertArg).not.toHaveProperty('evil_column')
    expect(capturedUpsertArg).not.toHaveProperty('role')
    expect(capturedUpsertArg).toHaveProperty('full_name', 'Alice')
    expect(res.json).toHaveBeenCalled()
  })

  it('returns 500 when Supabase upsert fails', async () => {
    mockFrom.mockReturnValueOnce({
      upsert: () => ({ select: () => ({ single: () => Promise.resolve({ data: null, error: { message: 'DB error' } }) }) }),
    })
    const req = { params: { id: 'user-1' }, user: { id: 'user-1' }, body: { full_name: 'Alice' } }
    const res = makeRes()
    await upsertProfile(req, res)
    expect(res.status).toHaveBeenCalledWith(500)
    // Should not leak raw DB error message in production; we return generic message
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ error: 'Failed to update profile' }))
  })
})

// ── getUsers ─────────────────────────────────────────────────────────────────
describe('getUsers', () => {
  beforeEach(() => vi.clearAllMocks())

  it('returns list of profiles', async () => {
    const users = [{ id: 'u1', full_name: 'Alice' }]
    mockFrom.mockReturnValueOnce({ select: () => Promise.resolve({ data: users, error: null }) })
    const req = { user: { id: 'u1' } }
    const res = makeRes()
    await getUsers(req, res)
    expect(res.json).toHaveBeenCalledWith(users)
  })

  it('returns 500 on DB error', async () => {
    mockFrom.mockReturnValueOnce({ select: () => Promise.resolve({ data: null, error: { message: 'fail' } }) })
    const req = { user: { id: 'u1' } }
    const res = makeRes()
    await getUsers(req, res)
    expect(res.status).toHaveBeenCalledWith(500)
    // Should return generic message, not raw DB message
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ error: 'Failed to retrieve users' }))
  })
})
