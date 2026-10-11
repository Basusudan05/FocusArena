import { NavLink } from 'react-router-dom'
import { LayoutDashboard, Timer, Users, Trophy } from 'lucide-react'

const NAV_ITEMS = [
  { Icon: LayoutDashboard, label: 'Dashboard',   to: '/dashboard' },
  { Icon: Timer,           label: 'Timer',       to: '/timer' },
  { Icon: Users,           label: 'Groups',      to: '/groups' },
  { Icon: Trophy,          label: 'Leaderboard', to: '/leaderboard' },
]

function Navbar() {
  return (
    <nav className="bottom-nav" aria-label="Mobile navigation">
      {NAV_ITEMS.map(({ Icon, label, to }) => (
        <NavLink
          key={to}
          to={to}
          className={({ isActive }) =>
            isActive
              ? 'bottom-nav__item bottom-nav__item--active'
              : 'bottom-nav__item'
          }
        >
          <Icon size={20} className="bottom-nav__icon" aria-hidden="true" />
          <span className="bottom-nav__label">{label}</span>
        </NavLink>
      ))}
    </nav>
  )
}

export default Navbar
