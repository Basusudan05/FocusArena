import supabase from '../config/supabase.js'

// Points rule: 1 point per completed study minute
const POINTS_PER_MINUTE = 1

/**
 * POST /api/study-sessions
 * Body: { duration_minutes, group_id? }
 * Saves a completed study session for the authenticated user.
 */
export const createSession = async (req, res) => {
  const userId = req.user.id
  const { duration_minutes, group_id } = req.body

  // Validate duration
  if (duration_minutes === undefined || duration_minutes === null) {
    return res.status(400).json({ error: 'duration_minutes is required' })
  }
  const duration = parseInt(duration_minutes, 10)
  if (!Number.isInteger(duration) || duration < 1) {
    return res.status(400).json({ error: 'duration_minutes must be an integer ≥ 1' })
  }

  // Validate group_id if provided — must reference a group the user actually belongs to
  if (group_id !== undefined && group_id !== null) {
    const uuidRe = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    if (!uuidRe.test(group_id)) {
      return res.status(400).json({ error: 'group_id must be a valid UUID' })
    }
    const { data: membership, error: memberErr } = await supabase
      .from('group_members')
      .select('user_id')
      .eq('group_id', group_id)
      .eq('user_id', userId)
      .single()
    if (memberErr || !membership) {
      return res.status(403).json({ error: 'You are not a member of the specified group' })
    }
  }

  const points = duration * POINTS_PER_MINUTE
  // started_at = now minus the session duration so it reflects when the session actually began
  const startedAt = new Date(Date.now() - duration * 60 * 1000).toISOString()

  const insertPayload = {
    user_id: userId,
    duration_minutes: duration,
    points,
    started_at: startedAt,
    ...(group_id ? { group_id } : {}),
  }

  const { data, error } = await supabase
    .from('study_sessions')
    .insert(insertPayload)
    .select()
    .single()

  if (error) {
    console.error('[createSession] Supabase error:', error.message)
    return res.status(500).json({ error: error.message })
  }

  res.status(201).json(data)
}

/**
 * GET /api/study-sessions
 * Returns the authenticated user's sessions ordered by started_at descending.
 */
export const getSessions = async (req, res) => {
  const userId = req.user.id

  const { data, error } = await supabase
    .from('study_sessions')
    .select('*')
    .eq('user_id', userId)
    .order('started_at', { ascending: false })

  if (error) {
    console.error('[getSessions] Supabase error:', error.message)
    return res.status(500).json({ error: error.message })
  }

  res.json(data ?? [])
}
