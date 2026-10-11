import { Navigate } from 'react-router-dom'
import { useApp } from '../../context/AppContext'
import LoadingSpinner from '../ui/LoadingSpinner'

function ProtectedRoute({ children }) {
  const { authLoading, isLoggedIn } = useApp()

  if (authLoading) {
    return (
      <div className="auth-page">
        <div style={{ textAlign: 'center' }}>
          <LoadingSpinner size="lg" />
          <p className="text-gray" style={{ marginTop: '1rem' }}>Loading…</p>
        </div>
      </div>
    )
  }

  if (!isLoggedIn) {
    return <Navigate to="/login" replace />
  }

  return children
}

export default ProtectedRoute
