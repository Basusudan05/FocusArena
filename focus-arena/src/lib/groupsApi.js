import { apiFetch } from './api'

export const groupsApi = {
  list: () => apiFetch('/api/groups'),
  create: (name, description) =>
    apiFetch('/api/groups', { method: 'POST', body: JSON.stringify({ name, description }) }),
  get: (id) => apiFetch(`/api/groups/${id}`),
  leaderboard: (id) => apiFetch(`/api/groups/${id}/leaderboard`),
  join: (id) => apiFetch(`/api/groups/${id}/join`, { method: 'POST' }),
  leave: (id) => apiFetch(`/api/groups/${id}/leave`, { method: 'DELETE' }),
}
