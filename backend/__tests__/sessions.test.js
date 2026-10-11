/**
 * Unit tests for POST /api/study-sessions and GET /api/study-sessions.
 *
 * Supabase and auth middleware are fully stubbed — no network calls are made.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'

// ── Stub Supabase before importing the controller ────────────────────────────
const mockSingle = vi.fn()
const mockSelect = vi.fn(() => ({ single: mockSingle }))
const mockOrder = vi.fn(() => ({ data: [], error: null }))
const mockEq = vi.fn(() => ({ order: mockOrder, single: mockSingle }))
const mockInsert = vi.fn(() => ({ select: mockSelect }))
const mockFrom = vi.fn(() => ({
  insert: mockInsert,
  select: vi.fn(() => ({ eq: mockEq })),
  eq: mockEq,
}))

vi.mock('../config/supabase.js', () => ({
  default: { from: mockFrom },
}))

// Import controller after mocks are set up
const { createSession, getSessions } = await import('../controllers/sessionController.js')

// ── Helpers ──────────────────────────────────────────────────────────────────
function makeReq(body = {}, userId = 'user-uuid-123') {
  return { body, user: { id: userId } }
}

function makeRes() {
  const res = {}
  res.status = vi.fn(() => res)
  res.json = vi.fn(() => res)
  return res
}

// ── POST /api/study-sessions ─────────────────────────────────────────────────
describe('createSession', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns 400 when duration_minutes is missing', async () => {
    const req = makeReq({})
    const res = makeRes()
    await createSession(req, res)
    expect(res.status).toHaveBeenCalledWith(400)
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ error: expect.stringContaining('duration_minutes') })
    )
  })

  it('returns 400 when duration_minutes is 0', async () => {
    const req = makeReq({ duration_minutes: 0 })
    const res = makeRes()
    await createSession(req, res)
    expect(res.status).toHaveBeenCalledWith(400)
  })

  it('returns 400 when duration_minutes is negative', async () => {
    const req = makeReq({ duration_minutes: -5 })
    const res = makeRes()
    await createSession(req, res)
    expect(res.status).toHaveBeenCalledWith(400)
  })

  it('returns 400 when duration_minutes is not an integer', async () => {
    const req = makeReq({ duration_minutes: 'abc' })
    const res = makeRes()
    await createSession(req, res)
    expect(res.status).toHaveBeenCalledWith(400)
  })

  it('returns 400 when group_id is not a valid UUID', async () => {
    const req = makeReq({ duration_minutes: 30, group_id: 'not-a-uuid' })
    const res = makeRes()
    await createSession(req, res)
    expect(res.status).toHaveBeenCalledWith(400)
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ error: expect.stringContaining('group_id') })
    )
  })

  it('returns 403 when group_id UUID is not a group the user belongs to', async () => {
    // Mock the membership check to return no row
    mockFrom.mockReturnValueOnce({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          eq: vi.fn(() => ({
            single: vi.fn().mockResolvedValue({ data: null, error: { message: 'not found' } }),
          })),
        })),
      })),
    })
    const req = makeReq({
      duration_minutes: 30,
      group_id: '00000000-0000-0000-0000-000000000000',
    })
    const res = makeRes()
    await createSession(req, res)
    expect(res.status).toHaveBeenCalledWith(403)
  })

  it('saves session and returns 201 with saved record on valid input', async () => {
    const savedRecord = {
      id: 'new-session-id',
      user_id: 'user-uuid-123',
      duration_minutes: 30,
      points: 30,
      started_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
    }
    mockSingle.mockResolvedValue({ data: savedRecord, error: null })
    mockSelect.mockReturnValue({ single: mockSingle })
    mockInsert.mockReturnValue({ select: mockSelect })
    mockFrom.mockReturnValue({ insert: mockInsert })

    const req = makeReq({ duration_minutes: 30 })
    const res = makeRes()
    await createSession(req, res)

    expect(res.status).toHaveBeenCalledWith(201)
    expect(res.json).toHaveBeenCalledWith(savedRecord)
  })

  it('returns 500 when Supabase insert fails', async () => {
    mockSingle.mockResolvedValue({ data: null, error: { message: 'DB constraint violation' } })
    mockSelect.mockReturnValue({ single: mockSingle })
    mockInsert.mockReturnValue({ select: mockSelect })
    mockFrom.mockReturnValue({ insert: mockInsert })

    const req = makeReq({ duration_minutes: 30 })
    const res = makeRes()
    await createSession(req, res)

    expect(res.status).toHaveBeenCalledWith(500)
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ error: 'DB constraint violation' })
    )
  })

  it('calculates points as 1 per minute', async () => {
    let capturedInsertArg = null
    mockSingle.mockResolvedValue({
      data: { id: 'x', duration_minutes: 45, points: 45 },
      error: null,
    })
    mockSelect.mockReturnValue({ single: mockSingle })
    mockInsert.mockImplementation((payload) => {
      capturedInsertArg = payload
      return { select: mockSelect }
    })
    mockFrom.mockReturnValue({ insert: mockInsert })

    const req = makeReq({ duration_minutes: 45 })
    const res = makeRes()
    await createSession(req, res)

    expect(capturedInsertArg.points).toBe(45)
  })

  it('sets user_id from req.user.id, not from request body', async () => {
    let capturedInsertArg = null
    mockSingle.mockResolvedValue({ data: { id: 'x' }, error: null })
    mockSelect.mockReturnValue({ single: mockSingle })
    mockInsert.mockImplementation((payload) => {
      capturedInsertArg = payload
      return { select: mockSelect }
    })
    mockFrom.mockReturnValue({ insert: mockInsert })

    // Attacker tries to supply a different user_id in the body
    const req = makeReq({ duration_minutes: 10, user_id: 'attacker-id' }, 'real-user-id')
    const res = makeRes()
    await createSession(req, res)

    expect(capturedInsertArg.user_id).toBe('real-user-id')
    expect(capturedInsertArg.user_id).not.toBe('attacker-id')
  })
})

// ── GET /api/study-sessions ──────────────────────────────────────────────────
describe('getSessions', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns sessions ordered by started_at descending', async () => {
    const sessions = [
      { id: 's2', user_id: 'uid', duration_minutes: 20, started_at: '2026-10-11T10:00:00Z' },
      { id: 's1', user_id: 'uid', duration_minutes: 30, started_at: '2026-10-10T09:00:00Z' },
    ]
    mockOrder.mockReturnValue({ data: sessions, error: null })
    mockEq.mockReturnValue({ order: mockOrder })
    mockFrom.mockReturnValue({
      select: vi.fn(() => ({ eq: mockEq })),
    })

    const req = makeReq({}, 'uid')
    const res = makeRes()
    await getSessions(req, res)

    expect(res.json).toHaveBeenCalledWith(sessions)
  })

  it('returns empty array when user has no sessions', async () => {
    mockOrder.mockReturnValue({ data: [], error: null })
    mockEq.mockReturnValue({ order: mockOrder })
    mockFrom.mockReturnValue({
      select: vi.fn(() => ({ eq: mockEq })),
    })

    const req = makeReq({}, 'uid-no-sessions')
    const res = makeRes()
    await getSessions(req, res)

    expect(res.json).toHaveBeenCalledWith([])
  })

  it('returns 500 when Supabase query fails', async () => {
    mockOrder.mockReturnValue({ data: null, error: { message: 'connection timeout' } })
    mockEq.mockReturnValue({ order: mockOrder })
    mockFrom.mockReturnValue({
      select: vi.fn(() => ({ eq: mockEq })),
    })

    const req = makeReq({}, 'uid')
    const res = makeRes()
    await getSessions(req, res)

    expect(res.status).toHaveBeenCalledWith(500)
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ error: 'connection timeout' })
    )
  })

  it('only queries for the authenticated user, not all users', async () => {
    let capturedUserId = null
    mockOrder.mockReturnValue({ data: [], error: null })
    mockEq.mockImplementation((col, val) => {
      if (col === 'user_id') capturedUserId = val
      return { order: mockOrder }
    })
    mockFrom.mockReturnValue({
      select: vi.fn(() => ({ eq: mockEq })),
    })

    const req = makeReq({}, 'specific-user-id')
    const res = makeRes()
    await getSessions(req, res)

    expect(capturedUserId).toBe('specific-user-id')
  })
})
