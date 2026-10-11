import { supabase } from './supabase'

async function getAuthHeader() {
  const { data: { session } } = await supabase.auth.getSession()
  if (!session?.access_token) throw new Error('Not authenticated')
  return { Authorization: `Bearer ${session.access_token}` }
}

async function apiFetch(path, options = {}) {
  const headers = await getAuthHeader()
  let res
  try {
    res = await fetch(path, {
      ...options,
      headers: { 'Content-Type': 'application/json', ...headers, ...options.headers },
    })
  } catch (networkErr) {
    throw new Error(`Network error — is the backend running? (${networkErr.message})`)
  }

  // Read body as text first so we never throw on empty body
  const text = await res.text()

  if (!text) {
    throw new Error(`Server returned an empty response (HTTP ${res.status})`)
  }

  let json
  try {
    json = JSON.parse(text)
  } catch {
    throw new Error(`Server returned non-JSON response (HTTP ${res.status}): ${text.slice(0, 100)}`)
  }

  if (!res.ok) {
    throw new Error(json.error ?? `Request failed: ${res.status}`)
  }

  return json
}

export const groupsApi = {
  list: () => apiFetch('/api/groups'),
  create: (name, description) =>
    apiFetch('/api/groups', { method: 'POST', body: JSON.stringify({ name, description }) }),
  get: (id) => apiFetch(`/api/groups/${id}`),
  leaderboard: (id) => apiFetch(`/api/groups/${id}/leaderboard`),
  join: (id) => apiFetch(`/api/groups/${id}/join`, { method: 'POST' }),
  leave: (id) => apiFetch(`/api/groups/${id}/leave`, { method: 'DELETE' }),
}
