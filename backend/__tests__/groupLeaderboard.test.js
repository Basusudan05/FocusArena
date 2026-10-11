/**
 * Unit tests for GET /api/groups/:id/leaderboard
 * Supabase is fully stubbed — no network calls are made.
 *
 * The controller executes these queries in order:
 *  1. groups:         .from('groups').select('id,name').eq('id', gid).single()
 *  2. membership:     .from('group_members').select('user_id').eq('group_id',gid).eq('user_id',uid).single()
 *  3. members list:   .from('group_members').select('user_id').eq('group_id', gid)
 *  4. profiles:       .from('profiles').select('id,full_name,username,email').in('id', memberIds)
 *  5. sessions:       .from('study_sessions').select('user_id,points').eq('group_id',gid).in('user_id', memberIds)
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockFrom = vi.fn()
vi.mock('../config/supabase.js', () => ({ default: { from: mockFrom } }))

const { getGroupLeaderboard } = await import('../controllers/groupController.js')

// ── Constants ────────────────────────────────────────────────────────────────
const GID      = 'aaaaaaaa-0000-0000-0000-000000000000'
const ALICE_ID = 'bbbbbbbb-0000-0000-0000-000000000000'
const BOB_ID   = 'cccccccc-0000-0000-0000-000000000000'

function makeReq(groupId = GID, userId = ALICE_ID) {
  return { params: { id: groupId }, user: { id: userId } }
}
function makeRes() {
  const r = {}
  r.status = vi.fn(() => r)
  r.json   = vi.fn(() => r)
  return r
}

// Build a chain that matches exactly how the controller uses Supabase.
// value: the { data, error } object that the terminal await resolves to.
function resolve(value) {
  return Promise.resolve(value)
}

// Query 1: .select().eq('id', x).single()
function q1Chain(value) {
  return {
    select: () => ({ eq: () => ({ single: () => resolve(value) }) }),
  }
}

// Query 2 (membership check): .select('user_id').eq('group_id',x).eq('user_id',y).single()
function q2Chain(value) {
  return {
    select: () => ({ eq: () => ({ eq: () => ({ single: () => resolve(value) }) }) }),
  }
}

// Query 3 (members list): .select('user_id').eq('group_id', x)
function q3Chain(value) {
  return {
    select: () => ({ eq: () => resolve(value) }),
  }
}

// Query 4 (profiles): .select('id,full_name,username,email').in('id', memberIds)
function q4Chain(value) {
  return {
    select: () => ({ in: () => resolve(value) }),
  }
}

// Query 5 (sessions): .select('user_id,points').eq('group_id',x).in('user_id', memberIds)
function q5Chain(value, onEq) {
  return {
    select: () => ({
      eq: (col, val) => {
        if (onEq) onEq(col, val)
        return { in: () => resolve(value) }
      },
    }),
  }
}

// Sequence helper: provide ordered return values per .from() call
function sequence(...chains) {
  let i = 0
  return chains.map((c) => c) // just return array
}

// ── Tests ────────────────────────────────────────────────────────────────────
describe('getGroupLeaderboard', () => {
  beforeEach(() => vi.clearAllMocks())

  it('returns 404 when group does not exist', async () => {
    mockFrom.mockReturnValueOnce(
      q1Chain({ data: null, error: { code: 'PGRST116', message: 'not found' } })
    )
    const res = makeRes()
    await getGroupLeaderboard(makeReq(), res)
    expect(res.status).toHaveBeenCalledWith(404)
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ error: 'Group not found' }))
  })

  it('returns 403 when requesting user is not a member', async () => {
    mockFrom
      .mockReturnValueOnce(q1Chain({ data: { id: GID, name: 'G' }, error: null }))
      .mockReturnValueOnce(q2Chain({ data: null, error: { code: 'PGRST116', message: 'no row' } }))
    const res = makeRes()
    await getGroupLeaderboard(makeReq(GID, 'outsider'), res)
    expect(res.status).toHaveBeenCalledWith(403)
  })

  it('returns empty entries when group has no members', async () => {
    mockFrom
      .mockReturnValueOnce(q1Chain({ data: { id: GID, name: 'G' }, error: null }))
      .mockReturnValueOnce(q2Chain({ data: { user_id: ALICE_ID }, error: null }))
      .mockReturnValueOnce(q3Chain({ data: [], error: null }))
    const res = makeRes()
    await getGroupLeaderboard(makeReq(), res)
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ entries: [] }))
  })

  it('ranks members by total points descending', async () => {
    mockFrom
      .mockReturnValueOnce(q1Chain({ data: { id: GID, name: 'G' }, error: null }))
      .mockReturnValueOnce(q2Chain({ data: { user_id: ALICE_ID }, error: null }))
      .mockReturnValueOnce(q3Chain({ data: [{ user_id: ALICE_ID }, { user_id: BOB_ID }], error: null }))
      .mockReturnValueOnce(q4Chain({ data: [
        { id: ALICE_ID, full_name: 'Alice', username: null, email: 'a@a.com' },
        { id: BOB_ID,   full_name: 'Bob',   username: null, email: 'b@b.com' },
      ], error: null }))
      .mockReturnValueOnce(q5Chain({ data: [
        { user_id: ALICE_ID, points: 30 },
        { user_id: ALICE_ID, points: 20 }, // Alice total = 50
        { user_id: BOB_ID,   points: 80 }, // Bob total = 80 → rank 1
      ], error: null }))

    const res = makeRes()
    await getGroupLeaderboard(makeReq(), res)
    const { entries } = res.json.mock.calls[0][0]
    expect(entries[0].username).toBe('Bob')
    expect(entries[0].totalPoints).toBe(80)
    expect(entries[0].rank).toBe(1)
    expect(entries[1].username).toBe('Alice')
    expect(entries[1].totalPoints).toBe(50)
    expect(entries[1].rank).toBe(2)
  })

  it('includes members with zero points', async () => {
    mockFrom
      .mockReturnValueOnce(q1Chain({ data: { id: GID, name: 'G' }, error: null }))
      .mockReturnValueOnce(q2Chain({ data: { user_id: ALICE_ID }, error: null }))
      .mockReturnValueOnce(q3Chain({ data: [{ user_id: ALICE_ID }, { user_id: BOB_ID }], error: null }))
      .mockReturnValueOnce(q4Chain({ data: [
        { id: ALICE_ID, full_name: 'Alice', username: null, email: null },
        { id: BOB_ID,   full_name: 'Bob',   username: null, email: null },
      ], error: null }))
      // No sessions for Bob
      .mockReturnValueOnce(q5Chain({ data: [{ user_id: ALICE_ID, points: 10 }], error: null }))

    const res = makeRes()
    await getGroupLeaderboard(makeReq(), res)
    const { entries } = res.json.mock.calls[0][0]
    expect(entries).toHaveLength(2)
    const bob = entries.find((e) => e.username === 'Bob')
    expect(bob).toBeDefined()
    expect(bob.totalPoints).toBe(0)
  })

  it('only counts sessions with the correct group_id filter', async () => {
    let capturedGroupId = null
    mockFrom
      .mockReturnValueOnce(q1Chain({ data: { id: GID, name: 'G' }, error: null }))
      .mockReturnValueOnce(q2Chain({ data: { user_id: ALICE_ID }, error: null }))
      .mockReturnValueOnce(q3Chain({ data: [{ user_id: ALICE_ID }], error: null }))
      .mockReturnValueOnce(q4Chain({ data: [
        { id: ALICE_ID, full_name: 'Alice', username: null, email: null },
      ], error: null }))
      .mockReturnValueOnce(
        q5Chain({ data: [], error: null }, (col, val) => {
          if (col === 'group_id') capturedGroupId = val
        })
      )

    const res = makeRes()
    await getGroupLeaderboard(makeReq(), res)
    expect(capturedGroupId).toBe(GID)
  })

  it('returns 500 when sessions query fails', async () => {
    mockFrom
      .mockReturnValueOnce(q1Chain({ data: { id: GID, name: 'G' }, error: null }))
      .mockReturnValueOnce(q2Chain({ data: { user_id: ALICE_ID }, error: null }))
      .mockReturnValueOnce(q3Chain({ data: [{ user_id: ALICE_ID }], error: null }))
      .mockReturnValueOnce(q4Chain({ data: [
        { id: ALICE_ID, full_name: 'Alice', username: null, email: null },
      ], error: null }))
      .mockReturnValueOnce(q5Chain({ data: null, error: { message: 'DB timeout' } }))

    const res = makeRes()
    await getGroupLeaderboard(makeReq(), res)
    expect(res.status).toHaveBeenCalledWith(500)
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ error: 'DB timeout' }))
  })
})
