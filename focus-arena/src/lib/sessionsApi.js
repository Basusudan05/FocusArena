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
      headers: {
        'Content-Type': 'application/json',
        ...authHeader,
        ...options.headers,
      },
    })
  } catch (networkErr) {
    throw new Error(`Network error — is the backend running? (${networkErr.message})`)
  }

  const text = await res.text()
  if (!text) throw new Error(`Server returned an empty response (HTTP ${res.status})`)

  let json
  try {
    json = JSON.parse(text)
  } catch {
    throw new Error(`Non-JSON response (HTTP ${res.status}): ${text.slice(0, 100)}`)
  }

  if (!res.ok) throw new Error(json.error ?? `Request failed: ${res.status}`)
  return json
}

export const sessionsApi = {
  /**
   * Save a completed session.
   * @param {{ duration_minutes: number, group_id?: string }} payload
   */
  create: (payload) =>
    apiFetch('/api/study-sessions', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  /** Fetch the current user's sessions, ordered by most recent first. */
  list: () => apiFetch('/api/study-sessions'),
}
