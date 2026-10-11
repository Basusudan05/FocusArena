import supabase from '../config/supabase.js'

// POST /api/groups — create a group, auto-add creator as member
export const createGroup = async (req, res) => {
  const { name, description } = req.body
  const userId = req.user.id

  if (!name || !name.trim()) {
    return res.status(400).json({ error: 'Group name is required' })
  }

  // Create the group
  let group
  try {
    const { data, error: groupError } = await supabase
      .from('groups')
      .insert({ name: name.trim(), description: description?.trim() ?? null, created_by: userId })
      .select()
      .single()

    if (groupError) {
      console.error('Create group error:', groupError.message)
      return res.status(500).json({ error: groupError.message })
    }

    if (!data) {
      console.error('Create group: insert returned no data (check RLS policies on groups table)')
      return res.status(500).json({ error: 'Group insert returned no data — check Supabase RLS policies' })
    }

    group = data
  } catch (err) {
    console.error('Create group threw:', err.message)
    return res.status(500).json({ error: err.message })
  }

  // Add creator as first member
  try {
    const { error: memberError } = await supabase
      .from('group_members')
      .insert({ group_id: group.id, user_id: userId })

    if (memberError) {
      console.error('Add creator member error:', memberError.message)
      // Group created but membership failed — still return the group
    }
  } catch (err) {
    console.error('Add creator member threw:', err.message)
  }

  res.status(201).json(group)
}

// GET /api/groups — groups the logged-in user belongs to
export const getMyGroups = async (req, res) => {
  const userId = req.user.id

  try {
    const { data, error } = await supabase
      .from('group_members')
      .select('group_id, groups(*)')
      .eq('user_id', userId)

    if (error) {
      console.error('Get groups error:', error.message)
      return res.status(500).json({ error: error.message })
    }

    const groups = (data ?? []).map((row) => row.groups).filter(Boolean)
    res.json(groups)
  } catch (err) {
    console.error('Get groups threw:', err.message)
    res.status(500).json({ error: err.message })
  }
}

// GET /api/groups/:id — group details + members with profile info
export const getGroupById = async (req, res) => {
  const { id } = req.params

  try {
    const { data: group, error: groupError } = await supabase
      .from('groups')
      .select('*')
      .eq('id', id)
      .single()

    if (groupError) {
      const status = groupError.code === 'PGRST116' ? 404 : 500
      return res.status(status).json({ error: groupError.message })
    }

    const { data: members, error: membersError } = await supabase
      .from('group_members')
      .select('user_id, created_at, profiles(id, full_name, username, email)')
      .eq('group_id', id)

    if (membersError) {
      console.error('Get members error:', membersError.message)
      return res.status(500).json({ error: membersError.message })
    }

    res.json({ ...group, members: members ?? [] })
  } catch (err) {
    console.error('Get group by id threw:', err.message)
    res.status(500).json({ error: err.message })
  }
}

// POST /api/groups/:id/join — add current user to group
export const joinGroup = async (req, res) => {
  const { id } = req.params
  const userId = req.user.id

  try {
    const { data: group, error: groupError } = await supabase
      .from('groups')
      .select('id')
      .eq('id', id)
      .single()

    if (groupError || !group) {
      return res.status(404).json({ error: 'Group not found' })
    }

    const { error } = await supabase
      .from('group_members')
      .insert({ group_id: id, user_id: userId })

    if (error) {
      if (error.code === '23505') {
        return res.status(409).json({ error: 'You are already a member of this group' })
      }
      console.error('Join group error:', error.message)
      return res.status(500).json({ error: error.message })
    }

    res.status(200).json({ message: 'Joined group successfully' })
  } catch (err) {
    console.error('Join group threw:', err.message)
    res.status(500).json({ error: err.message })
  }
}

// GET /api/groups/:id/leaderboard — ranked members by total points in this group
export const getGroupLeaderboard = async (req, res) => {
  const { id: groupId } = req.params
  const requestingUserId = req.user.id

  try {
    // 1. Verify group exists
    const { data: group, error: groupError } = await supabase
      .from('groups')
      .select('id, name')
      .eq('id', groupId)
      .single()

    if (groupError) {
      const status = groupError.code === 'PGRST116' ? 404 : 500
      return res.status(status).json({ error: 'Group not found' })
    }

    // 2. Verify requesting user is a member
    const { data: membership, error: memberCheckError } = await supabase
      .from('group_members')
      .select('user_id')
      .eq('group_id', groupId)
      .eq('user_id', requestingUserId)
      .single()

    if (memberCheckError || !membership) {
      return res.status(403).json({ error: 'You are not a member of this group' })
    }

    // 3. Get all members of the group
    const { data: members, error: membersError } = await supabase
      .from('group_members')
      .select('user_id')
      .eq('group_id', groupId)

    if (membersError) {
      console.error('[getGroupLeaderboard] members error:', membersError.message)
      return res.status(500).json({ error: membersError.message })
    }

    if (!members || members.length === 0) {
      return res.json({ group_id: groupId, group_name: group.name, entries: [] })
    }

    const memberIds = members.map((m) => m.user_id)

    // 4. Fetch profiles for all members
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, full_name, username, email')
      .in('id', memberIds)

    if (profilesError) {
      console.error('[getGroupLeaderboard] profiles error:', profilesError.message)
      return res.status(500).json({ error: profilesError.message })
    }

    // 5. Aggregate points from study_sessions scoped to this group per member
    const { data: sessions, error: sessionsError } = await supabase
      .from('study_sessions')
      .select('user_id, points')
      .eq('group_id', groupId)
      .in('user_id', memberIds)

    if (sessionsError) {
      console.error('[getGroupLeaderboard] sessions error:', sessionsError.message)
      return res.status(500).json({ error: sessionsError.message })
    }

    // Build a points map: user_id → total points
    const pointsMap = {}
    for (const s of sessions ?? []) {
      pointsMap[s.user_id] = (pointsMap[s.user_id] ?? 0) + (s.points ?? 0)
    }

    // Build a profile map for O(1) lookup
    const profileMap = {}
    for (const p of profiles ?? []) {
      profileMap[p.id] = p
    }

    // 6. Build sorted leaderboard entries (include members with 0 points)
    const entries = memberIds
      .map((uid) => {
        const profile = profileMap[uid] ?? {}
        const totalPoints = pointsMap[uid] ?? 0
        return {
          userId: uid,
          username: profile.full_name ?? profile.username ?? profile.email ?? 'Unknown',
          totalPoints,
        }
      })
      .sort((a, b) => b.totalPoints - a.totalPoints)
      .map((entry, idx) => ({ ...entry, rank: idx + 1 }))

    res.json({ group_id: groupId, group_name: group.name, entries })
  } catch (err) {
    console.error('[getGroupLeaderboard] threw:', err.message)
    res.status(500).json({ error: err.message })
  }
}

// DELETE /api/groups/:id/leave — remove current user from group
export const leaveGroup = async (req, res) => {
  const { id } = req.params
  const userId = req.user.id

  try {
    const { error } = await supabase
      .from('group_members')
      .delete()
      .eq('group_id', id)
      .eq('user_id', userId)

    if (error) {
      console.error('Leave group error:', error.message)
      return res.status(500).json({ error: error.message })
    }

    res.status(200).json({ message: 'Left group successfully' })
  } catch (err) {
    console.error('Leave group threw:', err.message)
    res.status(500).json({ error: err.message })
  }
}
