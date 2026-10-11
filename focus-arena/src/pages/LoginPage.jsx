import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { validateEmail, validateRequired } from '../utils/validation'
import Button from '../components/ui/Button'

function LoginPage() {
  const { login } = useApp()
  const navigate = useNavigate()

  const [form, setForm] = useState({ email: '', password: '' })
  const [errors, setErrors] = useState({})
  const [serverError, setServerError] = useState(null)
  const [loading, setLoading] = useState(false)

  function handleChange(e) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
    setErrors((prev) => ({ ...prev, [e.target.name]: null }))
    setServerError(null)
  }

  function validate() {
    const emailErr = validateEmail(form.email)
    const passErr = validateRequired(form.password, 'Password')
    const next = {}
    if (emailErr) next.email = emailErr
    if (passErr) next.password = passErr
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
      await login({ email: form.email.trim(), password: form.password })
      navigate('/dashboard')
    } catch (err) {
      setServerError(err.message ?? 'Login failed. Please try again.')
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
          <h1 className="auth-card__title">Welcome back</h1>
          <p className="auth-card__subtitle">Sign in to continue your study streak</p>
        </div>

        {serverError && (
          <div className="form-error" style={{ marginBottom: '1rem', display: 'block' }}>
            {serverError}
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          <div className="auth-form">
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
                autoComplete="current-password"
                className={`form-input${errors.password ? ' form-input--error' : ''}`}
                placeholder="••••••••"
                value={form.password}
                onChange={handleChange}
              />
              {errors.password && <span className="form-error">{errors.password}</span>}
            </div>

            <Button type="submit" variant="primary" className="w-full btn--lg" disabled={loading}>
              {loading ? 'Signing in…' : 'Sign In'}
            </Button>
          </div>
        </form>

        <p className="auth-card__footer">
          Don't have an account?{' '}
          <Link to="/register">Create one</Link>
        </p>
      </div>
    </div>
  )
}

export default LoginPage
