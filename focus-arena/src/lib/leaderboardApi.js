import { apiFetch } from './api'

export const leaderboardApi = {
  /** period: 'allTime' | 'today' | 'week' | 'month' */
  get: (period = 'allTime') => apiFetch(`/api/leaderboard?period=${period}`),
}
