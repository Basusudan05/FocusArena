import { supabase } from './supabase'

// In production (Vercel), set VITE_API_URL to your deployed backend URL.
// In development, Vite's proxy handles /api → localhost:5000 so this is empty.
const BASE_URL = import.meta.env.VITE_API_URL ?? ''

async function getAuthHeader() {
  const { data: { session } } = await supabase.auth.getSession()
  if (!session?.access_token) throw new Error('Not authenticated')
  return { Authorization: `Bearer ${session.access_token}` }
}

export async function apiFetch(path, options = {}) {
  const authHeader = await getAuthHeader()
  let res
  try {
    res = await fetch(`${BASE_URL}${path}`, {
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

export { BASE_URL }
