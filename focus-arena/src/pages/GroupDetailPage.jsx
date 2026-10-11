import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { groupsApi } from '../lib/groupsApi'
import StatCard from '../components/ui/StatCard'
import Button from '../components/ui/Button'
import Alert from '../components/ui/Alert'
import LoadingSpinner from '../components/ui/LoadingSpinner'
import EmptyState from '../components/ui/EmptyState'

const MEDALS = { 1: '🥇', 2: '🥈', 3: '🥉' }

function GroupDetailPage() {
  const { id } = useParams()
  const { currentUser, sessionsVersion } = useApp()
  const navigate = useNavigate()

  const [group, setGroup] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [alert, setAlert] = useState(null)
  const [leaving, setLeaving] = useState(false)
  const [joining, setJoining] = useState(false)

  // Leaderboard state
  const [lbEntries, setLbEntries] = useState([])
  const [lbLoading, setLbLoading] = useState(false)
  const [lbError, setLbError] = useState(null)

  const fetchGroup = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await groupsApi.get(id)
      setGroup(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [id])

  const fetchLeaderboard = useCallback(async () => {
    setLbLoading(true)
    setLbError(null)
    try {
      const data = await groupsApi.leaderboard(id)
      setLbEntries(data.entries ?? [])
    } catch (err) {
      setLbError(err.message)
    } finally {
      setLbLoading(false)
    }
  }, [id])

  useEffect(() => {
    fetchGroup()
    fetchLeaderboard()
  }, [fetchGroup, fetchLeaderboard])

  // Re-fetch leaderboard whenever the user saves a new session
  useEffect(() => {
    if (sessionsVersion > 0) fetchLeaderboard()
  }, [sessionsVersion, fetchLeaderboard])

  const isMember = group?.members?.some((m) => m.user_id === currentUser.id)

  async function handleLeave() {
    setLeaving(true)
    try {
      await groupsApi.leave(id)
      navigate('/groups')
    } catch (err) {
      setAlert({ type: 'error', message: err.message })
    } finally {
      setLeaving(false)
    }
  }

  async function handleJoin() {
    setJoining(true)
    try {
      await groupsApi.join(id)
      setAlert({ type: 'success', message: 'You joined the group!' })
      fetchGroup()
      fetchLeaderboard()
    } catch (err) {
      setAlert({ type: 'error', message: err.message })
    } finally {
      setJoining(false)
    }
  }

  if (loading) {
    return (
      <div className="page loading-center">
        <LoadingSpinner size="lg" />
        <p className="text-gray">Loading group…</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="page">
        <div className="error-state">
          <div className="error-state__icon">⚠️</div>
          <h2 className="error-state__title">Could not load group</h2>
          <p className="error-state__desc">{error}</p>
          <Button variant="primary" onClick={() => navigate('/groups')}>Back to Groups</Button>
        </div>
      </div>
    )
  }

  if (!group) return null

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <button className="back-link" onClick={() => navigate('/groups')}>← Back to Groups</button>
          <h1 className="page-title">{group.name}</h1>
          {group.description && <p className="page-subtitle">{group.description}</p>}
        </div>
        <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
          {isMember ? (
            <Button variant="secondary" onClick={handleLeave} disabled={leaving}>
              {leaving ? 'Leaving…' : 'Leave Group'}
            </Button>
          ) : (
            <Button variant="primary" onClick={handleJoin} disabled={joining}>
              {joining ? 'Joining…' : 'Join Group'}
            </Button>
          )}
        </div>
      </div>

      {alert && (
        <Alert type={alert.type} message={alert.message} onClose={() => setAlert(null)} />
      )}

      <div className="stats-grid">
        <StatCard label="Members" value={group.members?.length ?? 0} icon="👥" color="indigo" />
        <StatCard label="Created" value={new Date(group.created_at).toLocaleDateString()} icon="📅" color="default" />
      </div>

      {/* Group Leaderboard */}
      <div className="card card--padding-md">
        <h2 className="card-section-title">Group Leaderboard</h2>

        {lbLoading && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', padding: 'var(--space-4) 0' }}>
            <LoadingSpinner size="sm" />
            <span className="text-gray">Loading leaderboard…</span>
          </div>
        )}

        {!lbLoading && lbError && (
          <Alert type="error" message={`Could not load leaderboard: ${lbError}`} />
        )}

        {!lbLoading && !lbError && lbEntries.length === 0 && (
          <EmptyState
            title="No points yet"
            description="Complete study sessions in this group to appear on the leaderboard."
          />
        )}

        {!lbLoading && !lbError && lbEntries.length > 0 && (
          <div className="lb-table-wrap">
            <table className="lb-table">
              <thead>
                <tr>
                  <th className="lb-table__th lb-table__th--rank">Rank</th>
                  <th className="lb-table__th">Member</th>
                  <th className="lb-table__th lb-table__th--num">Points</th>
                </tr>
              </thead>
              <tbody>
                {lbEntries.map((entry) => {
                  const isYou = entry.userId === currentUser.id
                  return (
                    <tr
                      key={entry.userId}
                      className={isYou ? 'lb-table__row lb-table__row--you' : 'lb-table__row'}
                    >
                      <td className="lb-table__td lb-table__td--rank">
                        {MEDALS[entry.rank] ?? `#${entry.rank}`}
                      </td>
                      <td className="lb-table__td">
                        <span className="lb-table__name">{entry.username}</span>
                        {isYou && <span className="lb-table__you-tag">You</span>}
                      </td>
                      <td className="lb-table__td lb-table__td--num lb-table__td--points">
                        {entry.totalPoints.toLocaleString()}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Members list */}
      <div className="card card--padding-md">
        <h2 className="card-section-title">Members</h2>
        {!group.members || group.members.length === 0 ? (
          <EmptyState title="No members yet" description="Be the first to join!" />
        ) : (
          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            {group.members.map((m) => {
              const name = m.profiles?.full_name ?? m.profiles?.username ?? m.profiles?.email ?? 'Unknown'
              const isYou = m.user_id === currentUser.id
              return (
                <li
                  key={m.user_id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 'var(--space-3)',
                    padding: 'var(--space-2) 0',
                    borderBottom: '1px solid var(--color-border)',
                  }}
                >
                  <div
                    style={{
                      width: 36, height: 36, borderRadius: '50%',
                      background: 'var(--color-indigo-100, #e0e7ff)',
                      color: 'var(--color-indigo-700, #4338ca)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontWeight: 600, fontSize: '0.9rem', flexShrink: 0,
                    }}
                  >
                    {name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p style={{ margin: 0, fontWeight: 500 }}>
                      {name} {isYou && <span className="badge badge--indigo">You</span>}
                    </p>
                  </div>
                </li>
              )
            })}
          </ul>
        )}
      </div>
    </div>
  )
}

export default GroupDetailPage
