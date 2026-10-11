import { useState, useRef } from 'react'
import { Play, Pause, RotateCcw, CheckCircle, Clock, BookOpen, Target, Users } from 'lucide-react'
import { useApp } from '../context/AppContext'
import { useTimer, SUBJECTS } from '../context/TimerContext'
import Alert from '../components/ui/Alert'
import StatCard from '../components/ui/StatCard'
import LoadingSpinner from '../components/ui/LoadingSpinner'

function pad(n) { return String(n).padStart(2, '0') }

function formatElapsed(seconds) {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = seconds % 60
  return `${pad(h)}:${pad(m)}:${pad(s)}`
}

function formatTime(minutes) {
  if (minutes < 60) return `${minutes}m`
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return m > 0 ? `${h}h ${m}m` : `${h}h`
}

function TimerPage() {
  const {
    sessions,
    addSession,
    groups,
    groupsLoading,
    selectedGroupId,
    setSelectedGroupId,
  } = useApp()
  const { elapsedSeconds, isRunning, subject, start, pause, reset, setSubject, getSession } = useTimer()
  const [alert, setAlert] = useState(null)
  const [saving, setSaving] = useState(false)
  const savingRef = useRef(false)

  const today = new Date().toISOString().slice(0, 10)

  const todayMinutes = sessions.reduce((sum, s) => {
    const sessionDate = s.started_at ? s.started_at.slice(0, 10) : (s.date ?? '')
    const mins = s.duration_minutes ?? s.durationMinutes ?? 0
    return sessionDate === today ? sum + mins : sum
  }, 0)

  const todayCount = sessions.filter((s) => {
    const sessionDate = s.started_at ? s.started_at.slice(0, 10) : (s.date ?? '')
    return sessionDate === today
  }).length

  async function handleStop() {
    if (savingRef.current) return
    pause()
    const session = getSession()
    if (!session) {
      setAlert({ type: 'warning', message: 'Study for at least 1 minute to save a session.' })
      return
    }

    savingRef.current = true
    setSaving(true)
    setAlert(null)

    try {
      // Pass selectedGroupId so the session is attributed to the active group
      const payload = { duration_minutes: session.duration_minutes }
      if (selectedGroupId) payload.group_id = selectedGroupId

      const saved = await addSession(payload)
      const groupName = groups.find((g) => g.id === selectedGroupId)?.name
      const groupNote = groupName ? ` for ${groupName}` : ''
      setAlert({
        type: 'success',
        message: `${session.durationMinutes} min saved${groupNote}! +${saved.points} points`,
      })
      reset()
    } catch (err) {
      setAlert({ type: 'error', message: `Failed to save session: ${err.message}` })
    } finally {
      setSaving(false)
      savingRef.current = false
    }
  }

  function handleReset() {
    reset()
    setAlert(null)
  }

  return (
    <div className="page">
      {alert && (
        <Alert type={alert.type} message={alert.message} onClose={() => setAlert(null)} />
      )}

      <div className="timer-layout">
        {/* Timer card */}
        <div className="timer-card card card--padding-lg">

          {/* Group selector */}
          <div className="timer-subjects">
            <p className="timer-subjects__label">
              <Users size={14} style={{ display: 'inline', marginRight: 4 }} />
              Study Group
            </p>
            {groupsLoading ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <LoadingSpinner size="sm" />
                <span className="text-gray" style={{ fontSize: '0.85rem' }}>Loading groups…</span>
              </div>
            ) : (
              <select
                className="form-input"
                value={selectedGroupId ?? ''}
                onChange={(e) => setSelectedGroupId(e.target.value || null)}
                disabled={isRunning}
                style={{ maxWidth: 260 }}
                aria-label="Select study group"
              >
                <option value="">No group (personal only)</option>
                {groups.map((g) => (
                  <option key={g.id} value={g.id}>{g.name}</option>
                ))}
              </select>
            )}
            {!groupsLoading && groups.length === 0 && (
              <p style={{ fontSize: '0.8rem', color: 'var(--color-gray-400)', marginTop: 4 }}>
                Join a group to have sessions count toward group rankings.
              </p>
            )}
          </div>

          {/* Subject selector */}
          <div className="timer-subjects">
            <p className="timer-subjects__label">Subject</p>
            <div className="timer-subjects__grid" role="group" aria-label="Select subject">
              {SUBJECTS.map((s) => (
                <button
                  key={s}
                  className={`timer-subject-btn${subject === s ? ' timer-subject-btn--active' : ''}${isRunning ? ' timer-subject-btn--locked' : ''}`}
                  onClick={() => setSubject(s)}
                  disabled={isRunning}
                  aria-pressed={subject === s}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Timer display */}
          <div className="timer-display">
            <div
              className={`timer-display__ring${isRunning ? ' timer-display__ring--active' : ''}`}
              aria-live="polite"
              aria-label={`Elapsed time: ${formatElapsed(elapsedSeconds)}`}
            >
              <div className="timer-display__time font-mono">{formatElapsed(elapsedSeconds)}</div>
              {isRunning && <div className="timer-display__status">Studying</div>}
            </div>
          </div>

          {/* Controls */}
          <div className="timer-controls">
            {!isRunning ? (
              <button
                className="timer-btn timer-btn--start"
                onClick={start}
                disabled={saving}
                aria-label="Start timer"
              >
                <Play size={22} fill="currentColor" />
                <span>Start</span>
              </button>
            ) : (
              <button
                className="timer-btn timer-btn--pause"
                onClick={pause}
                disabled={saving}
                aria-label="Pause timer"
              >
                <Pause size={22} fill="currentColor" />
                <span>Pause</span>
              </button>
            )}
            {elapsedSeconds > 0 && (
              <button
                className="timer-btn timer-btn--save"
                onClick={handleStop}
                disabled={saving}
                aria-label="Save session"
              >
                {saving ? <LoadingSpinner size="sm" /> : <CheckCircle size={22} />}
                <span>{saving ? 'Saving…' : 'Save'}</span>
              </button>
            )}
            <button
              className="timer-btn timer-btn--reset"
              onClick={handleReset}
              disabled={(elapsedSeconds === 0 && !isRunning) || saving}
              aria-label="Reset timer"
            >
              <RotateCcw size={18} />
              <span>Reset</span>
            </button>
          </div>
        </div>

        {/* Today's stats */}
        <div className="timer-stats">
          <StatCard
            label="Today's Study Time"
            value={formatTime(todayMinutes)}
            icon={<Clock size={20} />}
            color="indigo"
          />
          <StatCard
            label="Sessions Today"
            value={todayCount}
            icon={<BookOpen size={20} />}
            color="green"
          />
          <StatCard
            label="Current Subject"
            value={subject}
            icon={<Target size={20} />}
            color="yellow"
          />
        </div>
      </div>
    </div>
  )
}

export default TimerPage
