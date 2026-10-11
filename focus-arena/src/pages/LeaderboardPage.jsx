import { useState, useEffect, useCallback } from 'react'
import { useApp } from '../context/AppContext'
import { leaderboardApi } from '../lib/leaderboardApi'
import LeaderboardTable from '../components/features/LeaderboardTable'
import EmptyState from '../components/ui/EmptyState'
import LoadingSpinner from '../components/ui/LoadingSpinner'
import Alert from '../components/ui/Alert'

const FILTERS = [
  { key: 'today',   label: 'Today' },
  { key: 'week',    label: 'This Week' },
  { key: 'month',   label: 'This Month' },
  { key: 'allTime', label: 'All Time' },
]

function LeaderboardPage() {
  const { currentUser, sessionsVersion } = useApp()
  const [active, setActive] = useState('allTime')
  const [entries, setEntries] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchLeaderboard = useCallback(async (period) => {
    setLoading(true)
    setError(null)
    try {
      const data = await leaderboardApi.get(period)
      setEntries(data ?? [])
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  // Fetch on mount and when filter changes
  useEffect(() => {
    fetchLeaderboard(active)
  }, [active, fetchLeaderboard])

  // Refresh after the user saves a new session
  useEffect(() => {
    if (sessionsVersion > 0) fetchLeaderboard(active)
  }, [sessionsVersion]) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Leaderboard</h1>
          <p className="page-subtitle">See how you rank against everyone</p>
        </div>
      </div>

      {/* Period filters */}
      <div className="lb-filters">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            className={`lb-filter-btn${active === f.key ? ' lb-filter-btn--active' : ''}`}
            onClick={() => setActive(f.key)}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="card card--padding-none">
        {loading && (
          <div className="loading-center" style={{ padding: 'var(--space-6)' }}>
            <LoadingSpinner size="lg" />
            <p className="text-gray">Loading leaderboard…</p>
          </div>
        )}
        {!loading && error && (
          <div style={{ padding: 'var(--space-4)' }}>
            <Alert type="error" message={`Could not load leaderboard: ${error}`} />
          </div>
        )}
        {!loading && !error && entries.length === 0 && (
          <EmptyState
            title="No data yet"
            description="Complete study sessions to appear on the leaderboard."
          />
        )}
        {!loading && !error && entries.length > 0 && (
          <LeaderboardTable entries={entries} currentUserId={currentUser.id} />
        )}
      </div>
    </div>
  )
}

export default LeaderboardPage
