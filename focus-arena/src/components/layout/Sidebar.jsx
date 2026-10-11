import { NavLink } from 'react-router-dom'
import { LayoutDashboard, Timer, Users, Trophy, Target } from 'lucide-react'
import { useTimer } from '../../context/TimerContext'

const NAV_ITEMS = [
  { Icon: LayoutDashboard, label: 'Dashboard',   to: '/dashboard' },
  { Icon: Timer,           label: 'Study Timer', to: '/timer' },
  { Icon: Users,           label: 'Groups',      to: '/groups' },
  { Icon: Trophy,          label: 'Leaderboard', to: '/leaderboard' },
]

function pad(n) { return String(n).padStart(2, '0') }

function Sidebar() {
  const { elapsedSeconds, isRunning, subject } = useTimer()

  return (
    <aside className="sidebar">
      {/* Logo */}
      <div className="sidebar__logo">
        <Target size={22} className="sidebar__logo-icon" aria-hidden="true" />
        <span className="sidebar__logo-text">FocusArena</span>
      </div>

      {/* Navigation */}
      <nav className="sidebar__nav" aria-label="Main navigation">
        {NAV_ITEMS.map(({ Icon, label, to }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              isActive
                ? 'sidebar__nav-item sidebar__nav-item--active'
                : 'sidebar__nav-item'
            }
          >
            <Icon size={18} className="sidebar__nav-icon" aria-hidden="true" />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Active timer indicator in sidebar */}
      {isRunning && (
        <div className="sidebar__timer-pill">
          <span className="sidebar__timer-dot" aria-hidden="true" />
          <span className="sidebar__timer-text font-mono">
            {pad(Math.floor(elapsedSeconds / 3600))}:{pad(Math.floor((elapsedSeconds % 3600) / 60))}:{pad(elapsedSeconds % 60)}
          </span>
          <span className="sidebar__timer-subject">{subject}</span>
        </div>
      )}
    </aside>
  )
}

export default Sidebar
