import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  validateEmail,
  validatePassword,
  validatePasswordMatch,
  validateRequired,
} from '../utils/validation'
import { useApp } from '../context/AppContext'
import Button from '../components/ui/Button'

function RegisterPage() {
  const { register } = useApp()
  const navigate = useNavigate()
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' })
  const [errors, setErrors] = useState({})
  const [serverError, setServerError] = useState(null)
  const [loading, setLoading] = useState(false)

  function handleChange(e) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
    setErrors((prev) => ({ ...prev, [e.target.name]: null }))
    setServerError(null)
  }

  function validate() {
    const next = {}
    const nameErr = validateRequired(form.name, 'Name')
    const emailErr = validateEmail(form.email)
    const passErr = validatePassword(form.password)
    const matchErr = validatePasswordMatch(form.password, form.confirm)
    if (nameErr) next.name = nameErr
    if (emailErr) next.email = emailErr
    if (passErr) next.password = passErr
    if (!passErr && matchErr) next.confirm = matchErr
    if (passErr && form.confirm) next.confirm = matchErr
    return next
  }

  async function handleSubmit(e) {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length > 0) {
      setErrors(errs)
      return
    }
    setLoading(true)
    setServerError(null)
    try {
      await register({
        email: form.email.trim(),
        password: form.password,
        name: form.name.trim(),
      })
      navigate('/login')
    } catch (err) {
      setServerError(err.message ?? 'Registration failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card card card--padding-lg">
        <div className="auth-card__header">
          <div className="auth-logo">
            <span className="auth-logo__icon">🎯</span>
            <span className="auth-logo__text">FocusArena</span>
          </div>
          <h1 className="auth-card__title">Create your account</h1>
          <p className="auth-card__subtitle">Join friends and start competing</p>
        </div>

        {serverError && (
          <div className="form-error" style={{ marginBottom: '1rem', display: 'block' }}>
            {serverError}
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          <div className="auth-form">
            <div className="form-group">
              <label className="form-label" htmlFor="name">Name</label>
              <input
                id="name"
                name="name"
                type="text"
                autoComplete="name"
                className={`form-input${errors.name ? ' form-input--error' : ''}`}
                placeholder="Your full name"
                value={form.name}
                onChange={handleChange}
              />
              {errors.name && <span className="form-error">{errors.name}</span>}
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="email">Email</label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                className={`form-input${errors.email ? ' form-input--error' : ''}`}
                placeholder="you@example.com"
                value={form.email}
                onChange={handleChange}
              />
              {errors.email && <span className="form-error">{errors.email}</span>}
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="password">Password</label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                className={`form-input${errors.password ? ' form-input--error' : ''}`}
                placeholder="Min. 8 characters"
                value={form.password}
                onChange={handleChange}
              />
              {errors.password && <span className="form-error">{errors.password}</span>}
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="confirm">Confirm Password</label>
              <input
                id="confirm"
                name="confirm"
                type="password"
                autoComplete="new-password"
                className={`form-input${errors.confirm ? ' form-input--error' : ''}`}
                placeholder="Repeat your password"
                value={form.confirm}
                onChange={handleChange}
              />
              {errors.confirm && <span className="form-error">{errors.confirm}</span>}
            </div>

            <Button type="submit" variant="primary" className="w-full btn--lg" disabled={loading}>
              {loading ? 'Creating account…' : 'Create Account'}
            </Button>
          </div>
        </form>

        <p className="auth-card__footer">
          Already have an account?{' '}
          <Link to="/login">Sign in</Link>
        </p>
      </div>
    </div>
  )
}

export default RegisterPage
