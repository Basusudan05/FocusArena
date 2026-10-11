import supabase from '../config/supabase.js'

/**
 * Verifies the Supabase JWT sent in the Authorization header.
 * Attaches req.user = { id, email, ... } on success.
 */
const auth = async (req, res, next) => {
  const header = req.headers.authorization
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing or invalid Authorization header' })
  }

  const token = header.replace('Bearer ', '').trim()

  let user = null
  try {
    const { data, error } = await supabase.auth.getUser(token)
    if (error) {
      console.error('[auth] getUser error:', error.message)
      return res.status(401).json({ error: 'Invalid or expired token' })
    }
    user = data.user
  } catch (err) {
    console.error('[auth] getUser threw:', err.message)
    return res.status(503).json({ error: 'Auth service unavailable — check backend connectivity' })
  }

  if (!user) {
    return res.status(401).json({ error: 'Invalid or expired token' })
  }

  req.user = user
  next()
}

export default auth
