import supabase from '../config/supabase.js'

// Only these profile columns are writable by users — prevents arbitrary column injection
const ALLOWED_PROFILE_FIELDS = new Set(['full_name', 'username', 'avatar_url', 'email'])

export const getUsers = async (req, res) => {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, full_name, username, avatar_url, email, created_at')

  if (error) {
    console.error('[getUsers] Supabase error:', error.message)
    return res.status(500).json({ error: 'Failed to retrieve users' })
  }

  res.json(data ?? [])
}

export const getProfileById = async (req, res) => {
  const { id } = req.params
  const requestingUserId = req.user.id

  // Users can only read their own profile
  if (id !== requestingUserId) {
    return res.status(403).json({ error: 'You can only view your own profile' })
  }

  const { data, error } = await supabase
    .from('profiles')
    .select('id, full_name, username, avatar_url, email, created_at')
    .eq('id', id)
    .single()

  if (error) {
    const status = error.code === 'PGRST116' ? 404 : 500
    return res.status(status).json({ error: status === 404 ? 'Profile not found' : 'Failed to retrieve profile' })
  }

  res.json(data)
}

export const upsertProfile = async (req, res) => {
  const { id } = req.params
  const requestingUserId = req.user.id

  // Users can only update their own profile
  if (id !== requestingUserId) {
    return res.status(403).json({ error: 'You can only update your own profile' })
  }

  const body = req.body
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return res.status(400).json({ error: 'Request body must be a JSON object' })
  }

  // Strip any keys that are not in the allowed set
  const updates = {}
  for (const key of Object.keys(body)) {
    if (ALLOWED_PROFILE_FIELDS.has(key)) {
      updates[key] = body[key]
    }
  }

  if (Object.keys(updates).length === 0) {
    return res.status(400).json({ error: 'No valid fields provided for update' })
  }

  const { data, error } = await supabase
    .from('profiles')
    .upsert({ id, ...updates }, { onConflict: 'id' })
    .select('id, full_name, username, avatar_url, email, created_at')
    .single()

  if (error) {
    console.error('[upsertProfile] Supabase error:', error.message)
    return res.status(500).json({ error: 'Failed to update profile' })
  }

  res.json(data)
}
