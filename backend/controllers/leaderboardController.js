import supabase from '../config/supabase.js'

/**
 * GET /api/leaderboard?period=allTime|today|week|month
 * Returns all users ranked by total points from study_sessions for the given period.
 * Requires authentication.
 */
export const getGlobalLeaderboard = async (req, res) => {
  const { period = 'allTime' } = req.query

  const VALID_PERIODS = new Set(['today', 'week', 'month', 'allTime'])
  if (!VALID_PERIODS.has(period)) {
    return res.status(400).json({ error: `Invalid period. Must be one of: ${[...VALID_PERIODS].join(', ')}` })
  }

  // Determine the start date filter based on period
  let startDate = null
  const now = new Date()
  if (period === 'today') {
    startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString()
  } else if (period === 'week') {
    const d = new Date(now)
    d.setDate(d.getDate() - d.getDay()) // start of current week (Sunday)
    d.setHours(0, 0, 0, 0)
    startDate = d.toISOString()
  } else if (period === 'month') {
    startDate = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
  }

  try {
    // 1. Fetch all sessions (optionally date-filtered)
    let query = supabase
      .from('study_sessions')
      .select('user_id, points, duration_minutes')

    if (startDate) {
      query = query.gte('started_at', startDate)
    }

    const { data: sessions, error: sessionsError } = await query

    if (sessionsError) {
      console.error('[getGlobalLeaderboard] sessions error:', sessionsError.message)
      return res.status(500).json({ error: sessionsError.message })
    }

    if (!sessions || sessions.length === 0) {
      return res.json([])
    }

    // 2. Aggregate per user
    const statsMap = {} // user_id → { points, studyMinutes }
    for (const s of sessions) {
      if (!statsMap[s.user_id]) {
        statsMap[s.user_id] = { points: 0, studyMinutes: 0 }
      }
      statsMap[s.user_id].points += s.points ?? 0
      statsMap[s.user_id].studyMinutes += s.duration_minutes ?? 0
    }

    const userIds = Object.keys(statsMap)

    // 3. Fetch profiles for those users
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, full_name, username, email')
      .in('id', userIds)

    if (profilesError) {
      console.error('[getGlobalLeaderboard] profiles error:', profilesError.message)
      return res.status(500).json({ error: profilesError.message })
    }

    const profileMap = {}
    for (const p of profiles ?? []) {
      profileMap[p.id] = p
    }

    // 4. Build sorted leaderboard
    const entries = userIds
      .map((uid) => {
        const profile = profileMap[uid] ?? {}
        return {
          userId: uid,
          username: profile.full_name ?? profile.username ?? profile.email ?? 'Unknown',
          points: statsMap[uid].points,
          studyTimeMinutes: statsMap[uid].studyMinutes,
          streak: 0, // not tracked in current schema
        }
      })
      .sort((a, b) => b.points - a.points)
      .map((entry, idx) => ({ ...entry, rank: idx + 1 }))

    res.json(entries)
  } catch (err) {
    console.error('[getGlobalLeaderboard] threw:', err.message)
    res.status(500).json({ error: err.message })
  }
}
