import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { validateRequired } from '../utils/validation'
import { groupsApi } from '../lib/groupsApi'
import GroupCard from '../components/features/GroupCard'
import Button from '../components/ui/Button'
import Modal from '../components/ui/Modal'
import EmptyState from '../components/ui/EmptyState'
import Alert from '../components/ui/Alert'
import LoadingSpinner from '../components/ui/LoadingSpinner'

function GroupsPage() {
  const { currentUser } = useApp()
  const navigate = useNavigate()

  const [groups, setGroups] = useState([])
  const [loading, setLoading] = useState(true)
  const [fetchError, setFetchError] = useState(null)

  const [showCreate, setShowCreate] = useState(false)
  const [form, setForm] = useState({ name: '', description: '' })
  const [formError, setFormError] = useState(null)
  const [creating, setCreating] = useState(false)

  const [alert, setAlert] = useState(null)

  const fetchGroups = useCallback(async () => {
    setLoading(true)
    setFetchError(null)
    try {
      const data = await groupsApi.list()
      setGroups(data)
    } catch (err) {
      setFetchError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchGroups() }, [fetchGroups])

  function handleChange(e) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
    setFormError(null)
  }

  async function handleCreate(e) {
    e.preventDefault()
    const err = validateRequired(form.name, 'Group name')
    if (err) { setFormError(err); return }

    setCreating(true)
    try {
      await groupsApi.create(form.name.trim(), form.description.trim())
      setForm({ name: '', description: '' })
      setFormError(null)
      setShowCreate(false)
      setAlert({ type: 'success', message: `Group "${form.name.trim()}" created!` })
      fetchGroups()
    } catch (err) {
      setFormError(err.message)
    } finally {
      setCreating(false)
    }
  }

  function closeCreate() {
    setShowCreate(false)
    setFormError(null)
    setForm({ name: '', description: '' })
  }

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Study Groups</h1>
          <p className="page-subtitle">Study together, compete together</p>
        </div>
        <Button variant="primary" onClick={() => setShowCreate(true)}>+ Create Group</Button>
      </div>

      {alert && (
        <Alert type={alert.type} message={alert.message} onClose={() => setAlert(null)} />
      )}

      {loading && (
        <div className="loading-center">
          <LoadingSpinner size="lg" />
          <p className="text-gray">Loading groups…</p>
        </div>
      )}

      {!loading && fetchError && (
        <Alert type="error" message={fetchError} onClose={() => setFetchError(null)} />
      )}

      {!loading && !fetchError && groups.length === 0 && (
        <EmptyState
          title="No groups yet"
          description="Create a group to start competing with friends."
          action={<Button variant="primary" onClick={() => setShowCreate(true)}>Create your first group</Button>}
        />
      )}

      {!loading && !fetchError && groups.length > 0 && (
        <div className="groups-grid">
          {groups.map((group) => (
            <GroupCard
              key={group.id}
              group={{
                ...group,
                memberIds: [],       // real count comes from group detail
                totalPoints: 0,
              }}
              onClick={() => navigate(`/groups/${group.id}`)}
            />
          ))}
        </div>
      )}

      <Modal isOpen={showCreate} onClose={closeCreate} title="Create Group">
        <form onSubmit={handleCreate}>
          <div className="auth-form">
            <div className="form-group">
              <label className="form-label" htmlFor="gname">Group Name *</label>
              <input
                id="gname"
                name="name"
                className={`form-input${formError ? ' form-input--error' : ''}`}
                placeholder="e.g. DSA Grinders"
                value={form.name}
                onChange={handleChange}
              />
              {formError && <span className="form-error">{formError}</span>}
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="gdesc">Description</label>
              <input
                id="gdesc"
                name="description"
                className="form-input"
                placeholder="What will you study?"
                value={form.description}
                onChange={handleChange}
              />
            </div>
            <div style={{ display: 'flex', gap: 'var(--space-3)', justifyContent: 'flex-end' }}>
              <Button variant="secondary" type="button" onClick={closeCreate} disabled={creating}>Cancel</Button>
              <Button variant="primary" type="submit" disabled={creating}>
                {creating ? 'Creating…' : 'Create Group'}
              </Button>
            </div>
          </div>
        </form>
      </Modal>
    </div>
  )
}

export default GroupsPage
