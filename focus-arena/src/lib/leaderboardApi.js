import { supabase } from './supabase'

async function getAuthHeader() {
  const { data: { session } } = await supabase.auth.getSession()
  if (!session?.access_token) throw new Error('Not authenticated')
  return { Authorization: `Bearer ${session.access_token}` }
}

async function apiFetch(path, options = {}) {
  const authHeader = await getAuthHeader()
  let res
  try {
    res = await fetch(path, {
      ...options,
      headers: { 'Content-Type': 'application/json', ...authHeader, ...options.headers },
    })
  } catch (networkErr) {
    throw new Error(`Network error — is the backend running? (${networkErr.message})`)
  }
  const text = await res.text()
  if (!text) throw new Error(`Empty response (HTTP ${res.status})`)
  let json
  try { json = JSON.parse(text) } catch {
    throw new Error(`Non-JSON response (HTTP ${res.status}): ${text.slice(0, 100)}`)
  }
  if (!res.ok) throw new Error(json.error ?? `Request failed: ${res.status}`)
  return json
}

export const leaderboardApi = {
  /** period: 'allTime' | 'today' | 'week' | 'month' */
  get: (period = 'allTime') => apiFetch(`/api/leaderboard?period=${period}`),
}
