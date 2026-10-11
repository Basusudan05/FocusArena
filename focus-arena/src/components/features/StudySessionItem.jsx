import Badge from '../ui/Badge'

// DB sessions don't have a subject field — show a neutral label
const SUBJECT_COLORS = {
  DSA: 'indigo',
  React: 'green',
  'Node.js': 'yellow',
  PostgreSQL: 'gray',
  Other: 'gray',
}

function formatDuration(minutes) {
  if (!minutes) return '0m'
  if (minutes < 60) return `${minutes}m`
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return m > 0 ? `${h}h ${m}m` : `${h}h`
}

function formatDate(session) {
  // DB sessions have started_at (ISO timestamp); legacy mock sessions have date (YYYY-MM-DD)
  const raw = session.started_at ?? session.date
  if (!raw) return ''
  return raw.slice(0, 10)
}

function StudySessionItem({ session }) {
  // DB sessions don't store subject; fall back to 'Study' label
  const subject = session.subject ?? 'Study'
  const color = SUBJECT_COLORS[subject] ?? 'indigo'
  // DB uses duration_minutes; legacy mock uses durationMinutes
  const duration = session.duration_minutes ?? session.durationMinutes ?? 0
  const points = session.points ?? null

  return (
    <div className="session-item">
      <div className="session-item__left">
        <Badge color={color}>{subject}</Badge>
        <span className="session-item__date">{formatDate(session)}</span>
      </div>
      <div className="session-item__right">
        {points !== null && (
          <span className="session-item__points">+{points}pts</span>
        )}
        <span className="session-item__duration">{formatDuration(duration)}</span>
      </div>
    </div>
  )
}

export default StudySessionItem
