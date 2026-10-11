import { Routes, Route, Navigate } from 'react-router-dom'
import LandingPage from './pages/LandingPage.jsx'
import LoginPage from './pages/LoginPage.jsx'
import RegisterPage from './pages/RegisterPage.jsx'
import DashboardPage from './pages/DashboardPage.jsx'
import TimerPage from './pages/TimerPage.jsx'
import GroupsPage from './pages/GroupsPage.jsx'
import GroupDetailPage from './pages/GroupDetailPage.jsx'
import LeaderboardPage from './pages/LeaderboardPage.jsx'
import ProfilePage from './pages/ProfilePage.jsx'
import Layout from './components/layout/Layout.jsx'
import ProtectedRoute from './components/auth/ProtectedRoute.jsx'
import PublicOnlyRoute from './components/auth/PublicOnlyRoute.jsx'

function App() {
  return (
    <Routes>
      {/* Public — always accessible */}
      <Route path="/" element={<LandingPage />} />

      {/* Public-only — redirect to dashboard if already logged in */}
      <Route path="/login" element={<PublicOnlyRoute><LoginPage /></PublicOnlyRoute>} />
      <Route path="/register" element={<PublicOnlyRoute><RegisterPage /></PublicOnlyRoute>} />

      {/* Protected — redirect to login if not authenticated */}
      <Route path="/dashboard" element={
        <ProtectedRoute><Layout><DashboardPage /></Layout></ProtectedRoute>
      } />
      <Route path="/timer" element={
        <ProtectedRoute><Layout><TimerPage /></Layout></ProtectedRoute>
      } />
      <Route path="/groups" element={
        <ProtectedRoute><Layout><GroupsPage /></Layout></ProtectedRoute>
      } />
      <Route path="/groups/:id" element={
        <ProtectedRoute><Layout><GroupDetailPage /></Layout></ProtectedRoute>
      } />
      <Route path="/leaderboard" element={
        <ProtectedRoute><Layout><LeaderboardPage /></Layout></ProtectedRoute>
      } />
      <Route path="/profile" element={
        <ProtectedRoute><Layout><ProfilePage /></Layout></ProtectedRoute>
      } />

      {/* Catch-all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App
