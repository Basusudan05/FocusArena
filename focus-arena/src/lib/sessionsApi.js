import { apiFetch } from './api'

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
