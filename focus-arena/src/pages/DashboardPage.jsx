import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Clock, Star, Flame, Trophy, Timer } from 'lucide-react'
import { useApp } from '../context/AppContext'
import { leaderboardApi } from '../lib/leaderboardApi'
import StatCard from '../components/ui/StatCard'
import ProgressBar from '../components/ui/ProgressBar'
import Button from '../components/ui/Button'
import Card from '../components/ui/Card'
import Alert from '../components/ui/Alert'
import EmptyState from '../components/ui/EmptyState'
import LoadingSpinner from '../components/ui/LoadingSpinner'
import StudySessionItem from '../components/features/StudySessionItem'
import MiniLeaderboard from '../components/features/MiniLeaderboard'

const TODAY_GOAL_MINUTES = 120

function formatTime(minutes) {
  if (minutes < 60) return `${minutes}m`
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return m > 0 ? `${h}h ${m}m` : `${h}h`
}

function getGreeting() {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 17) return 'Good afternoon'
  return 'Good evening'
}

function sessionDate(s) {
  return s.started_at ? s.started_at.slice(0, 10) : (s.date ?? '')
}

function sessionMinutes(s) {
  return s.duration_minutes ?? s.durationMinutes ?? 0
}

function DashboardPage() {
  const {
    currentUser,
    sessions,
    sessionsLoading,
    sessionsError,
    sessionsVersion,
    groups,
    authLoading,
  } = useApp()
  const navigate = useNavigate()

  const [topEntries, setTopEntries] = useState([])
  const [lbLoading, setLbLoading] = useState(true)

  // Load today's top 3 from real API; refresh whenever a session is saved
  useEffect(() => {
    let cancelled = false
    setLbLoading(true)
    leaderboardApi.get('today')
      .then((data) => { if (!cancelled) setTopEntries((data ?? []).slice(0, 3)) })
      .catch(() => { if (!cancelled) setTopEntries([]) })
      .finally(() => { if (!cancelled) setLbLoading(false) })
    return () => { cancelled = true }
  }, [sessionsVersion])

  const today = new Date().toISOString().slice(0, 10)

  if (authLoading || sessionsLoading) {
    return (
      <div className="page loading-center">
        <LoadingSpinner size="lg" />
        <p className="text-gray">Loading your dashboard…</p>
      </div>
    )
  }

  const todayMinutes = sessions.reduce(
    (sum, s) => (sessionDate(s) === today ? sum + sessionMinutes(s) : sum),
    0
  )
  const progressPct = Math.min(100, Math.round((todayMinutes / TODAY_GOAL_MINUTES) * 100))
  const recentSessions = sessions.slice(0, 5)
  const currentGroup = groups.length > 0 ? groups[0] : null

  return (
    <div className="page">
      {sessionsError && (
        <Alert type="error" message={`Could not load study sessions: ${sessionsError}`} />
      )}

      <div className="page-header">
        <div>
          <h1 className="page-title">
            {getGreeting()}, {(currentUser.name ?? 'there').split(' ')[0]}
          </h1>
          <p className="page-subtitle">Here's your study overview for today</p>
        </div>
        <Button variant="primary" onClick={() => navigate('/timer')}>
          <Timer size={16} aria-hidden="true" /> Start Studying
        </Button>
      </div>

      <div className="stats-grid">
        <StatCard label="Today's Study Time" value={formatTime(todayMinutes)} icon={<Clock size={20} />} color="indigo" />
        <StatCard label="Total Points" value={(currentUser.points ?? 0).toLocaleString()} icon={<Star size={20} />} color="yellow" />
        <StatCard label="Study Streak" value={`${currentUser.streak ?? 0} days`} icon={<Flame size={20} />} color="green" />
        <StatCard label="Groups Joined" value={groups.length} icon={<Trophy size={20} />} color="indigo" />
      </div>

      <div className="dashboard-row">
        <Card className="flex-2">
          <h2 className="card-section-title">Today's Goal</h2>
          <ProgressBar
            value={progressPct}
            label={`${formatTime(todayMinutes)} / ${formatTime(TODAY_GOAL_MINUTES)}`}
            color="indigo"
          />
          <p className="progress-note">
            {progressPct >= 100
              ? 'Goal reached! Keep going.'
              : `${formatTime(TODAY_GOAL_MINUTES - todayMinutes)} left to reach your daily goal`}
          </p>
        </Card>

        <Card className="flex-1">
          <h2 className="card-section-title">Current Group</h2>
          {currentGroup ? (
            <div className="group-summary">
              <div className="group-summary__name">{currentGroup.name}</div>
              {currentGroup.description && (
                <div className="group-summary__meta" style={{ fontSize: '0.85rem', color: 'var(--color-gray-400)' }}>
                  {currentGroup.description}
                </div>
              )}
              <Button variant="secondary" size="sm" onClick={() => navigate(`/groups/${currentGroup.id}`)}>
                View Group →
              </Button>
            </div>
          ) : (
            <EmptyState
              title="No group yet"
              description="Join a group to compete with friends."
              action={
                <Button variant="primary" size="sm" onClick={() => navigate('/groups')}>
                  Browse Groups
                </Button>
              }
            />
          )}
        </Card>
      </div>

      <div className="dashboard-row">
        <Card className="flex-2">
          <h2 className="card-section-title">Recent Study Sessions</h2>
          {recentSessions.length > 0 ? (
            <div className="sessions-list">
              {recentSessions.map((s) => (
                <StudySessionItem key={s.id} session={s} />
              ))}
            </div>
          ) : (
            <EmptyState title="No sessions yet" description="Start the timer to log your first session." />
          )}
        </Card>

        <Card className="flex-1">
          <h2 className="card-section-title">Today's Top 3</h2>
          {lbLoading ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: 'var(--space-3) 0' }}>
              <LoadingSpinner size="sm" />
              <span className="text-gray" style={{ fontSize: '0.85rem' }}>Loading…</span>
            </div>
          ) : topEntries.length > 0 ? (
            <MiniLeaderboard entries={topEntries} currentUserId={currentUser.id} />
          ) : (
            <p className="text-gray" style={{ fontSize: '0.85rem', padding: 'var(--space-2) 0' }}>
              No study activity today yet.
            </p>
          )}
          <Button variant="secondary" size="sm" onClick={() => navigate('/leaderboard')} className="mt-4">
            Full Leaderboard →
          </Button>
        </Card>
      </div>
    </div>
  )
}

export default DashboardPage
