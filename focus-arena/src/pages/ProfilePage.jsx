import { useState } from 'react'
import { Clock, Star, Flame, Users } from 'lucide-react'
import { useApp } from '../context/AppContext'
import { supabase } from '../lib/supabase'
import { validateEmail, validateRequired } from '../utils/validation'
import StatCard from '../components/ui/StatCard'
import Button from '../components/ui/Button'
import Alert from '../components/ui/Alert'
import LoadingSpinner from '../components/ui/LoadingSpinner'
import StudySessionItem from '../components/features/StudySessionItem'
import EmptyState from '../components/ui/EmptyState'

function formatTime(minutes) {
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return h > 0 ? `${h}h ${m}m` : `${m}m`
}

function ProfilePage() {
  const { currentUser, sessions, groups, updateUser } = useApp()

  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState({ name: currentUser.name ?? '', email: currentUser.email ?? '' })
  const [errors, setErrors] = useState({})
  const [alert, setAlert] = useState(null)
  const [saving, setSaving] = useState(false)

  // Sessions are already the authenticated user's own — no userId filter needed (API enforces it)
  const mySessions = sessions.slice(0, 8)

  function handleChange(e) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
    setErrors((prev) => ({ ...prev, [e.target.name]: null }))
  }

  async function handleSave(e) {
    e.preventDefault()
    const nameErr = validateRequired(form.name, 'Name')
    const emailErr = validateEmail(form.email)
    if (nameErr || emailErr) {
      setErrors({ name: nameErr, email: emailErr })
      return
    }

    setSaving(true)
    try {
      const userId = currentUser.id
      const { data: { session } } = await supabase.auth.getSession()
      const res = await fetch(`/api/profiles/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {}),
        },
        body: JSON.stringify({ full_name: form.name.trim(), email: form.email.trim() }),
      })
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body.error ?? `Failed to save profile (HTTP ${res.status})`)
      }
      const updated = await res.json()
      // Reflect immediately in context
      updateUser({ full_name: updated.full_name, email: updated.email })
      setEditing(false)
      setErrors({})
      setAlert({ type: 'success', message: 'Profile updated successfully.' })
    } catch (err) {
      setAlert({ type: 'error', message: err.message })
    } finally {
      setSaving(false)
    }
  }

  function handleCancel() {
    setForm({ name: currentUser.name ?? '', email: currentUser.email ?? '' })
    setErrors({})
    setEditing(false)
  }

  return (
    <div className="page">
      {/* Header */}
      <div className="profile-header card card--padding-lg">
        <div className="profile-header__avatar">
          {(currentUser.name ?? '?').charAt(0).toUpperCase()}
        </div>
        <div className="profile-header__info">
          <h1 className="profile-header__name">{currentUser.name}</h1>
          <p className="profile-header__email">{currentUser.email}</p>
          {currentUser.rank ? (
            <span className="badge badge--indigo">Rank #{currentUser.rank}</span>
          ) : null}
        </div>
        {!editing && (
          <Button variant="secondary" size="sm" onClick={() => setEditing(true)}>
            Edit Profile
          </Button>
        )}
      </div>

      {alert && (
        <Alert type={alert.type} message={alert.message} onClose={() => setAlert(null)} />
      )}

      {/* Edit form */}
      {editing && (
        <div className="card card--padding-md">
          <h2 className="card-section-title">Edit Profile</h2>
          <form onSubmit={handleSave} noValidate>
            <div className="auth-form">
              <div className="form-group">
                <label className="form-label" htmlFor="pname">Name</label>
                <input
                  id="pname"
                  name="name"
                  className={`form-input${errors.name ? ' form-input--error' : ''}`}
                  value={form.name}
                  onChange={handleChange}
                />
                {errors.name && <span className="form-error">{errors.name}</span>}
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="pemail">Email</label>
                <input
                  id="pemail"
                  name="email"
                  type="email"
                  className={`form-input${errors.email ? ' form-input--error' : ''}`}
                  value={form.email}
                  onChange={handleChange}
                />
                {errors.email && <span className="form-error">{errors.email}</span>}
              </div>
              <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
                <Button type="submit" variant="primary" disabled={saving}>
                  {saving ? 'Saving…' : 'Save Changes'}
                </Button>
                <Button type="button" variant="secondary" onClick={handleCancel} disabled={saving}>
                  Cancel
                </Button>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* Stats — derived from real sessions and groups */}
      <div className="stats-grid">
        <StatCard
          label="Total Study Time"
          value={formatTime(currentUser.totalStudyMinutes ?? 0)}
          icon={<Clock size={20} />}
          color="indigo"
        />
        <StatCard
          label="Total Points"
          value={(currentUser.points ?? 0).toLocaleString()}
          icon={<Star size={20} />}
          color="yellow"
        />
        <StatCard
          label="Study Streak"
          value={`${currentUser.streak ?? 0} days`}
          icon={<Flame size={20} />}
          color="green"
        />
        <StatCard
          label="Groups Joined"
          value={groups.length}
          icon={<Users size={20} />}
          color="default"
        />
      </div>

      {/* Recent activity */}
      <div className="card card--padding-md">
        <h2 className="card-section-title">Recent Study Activity</h2>
        {mySessions.length > 0 ? (
          <div className="sessions-list">
            {mySessions.map((s) => (
              <StudySessionItem key={s.id} session={s} />
            ))}
          </div>
        ) : (
          <EmptyState title="No sessions yet" description="Start studying to see your activity here." />
        )}
      </div>
    </div>
  )
}

export default ProfilePage
