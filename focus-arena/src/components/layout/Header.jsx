import { useState, useRef, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Timer, ChevronDown, User, LogOut, Sun, Moon } from 'lucide-react'
import { useApp } from '../../context/AppContext'
import { useTimer } from '../../context/TimerContext'

function pad(n) {
  return String(n).padStart(2, '0')
}

function formatElapsed(seconds) {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = seconds % 60
  return `${pad(h)}:${pad(m)}:${pad(s)}`
}

const PAGE_TITLES = {
  '/dashboard':  'Dashboard',
  '/timer':      'Study Timer',
  '/groups':     'Groups',
  '/leaderboard':'Leaderboard',
}

function Header() {
  const { currentUser, logout, theme, toggleTheme } = useApp()
  const { elapsedSeconds, isRunning, subject } = useTimer()
  const navigate = useNavigate()
  const location = useLocation()
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef = useRef(null)

  const title = Object.entries(PAGE_TITLES).find(([path]) =>
    location.pathname.startsWith(path)
  )?.[1] ?? 'FocusArena'

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  async function handleLogout() {
    setDropdownOpen(false)
    try { await logout() } catch {}
    navigate('/')
  }

  const showMiniTimer = isRunning && location.pathname !== '/timer'

  return (
    <header className="app-header">
      <div className="app-header__left">
        <h1 className="app-header__title">{title}</h1>
      </div>

      <div className="app-header__right">
        {/* Mini-timer pill — shown when timer is running and user is on another page */}
        {showMiniTimer && (
          <button
            className="mini-timer"
            onClick={() => navigate('/timer')}
            title="Go to timer"
            aria-label="Active timer indicator"
          >
            <span className="mini-timer__dot" aria-hidden="true" />
            <Timer size={14} aria-hidden="true" />
            <span className="mini-timer__time font-mono">{formatElapsed(elapsedSeconds)}</span>
            <span className="mini-timer__subject">{subject}</span>
          </button>
        )}

        {/* Theme toggle */}
        <button
          className="icon-btn"
          onClick={toggleTheme}
          aria-label="Toggle theme"
        >
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        {/* User dropdown */}
        <div className="user-dropdown" ref={dropdownRef}>
          <button
            className="user-dropdown__trigger"
            onClick={() => setDropdownOpen((o) => !o)}
            aria-expanded={dropdownOpen}
            aria-haspopup="true"
          >
            <div className="user-avatar" aria-hidden="true">
              {(currentUser?.name ?? 'U').charAt(0).toUpperCase()}
            </div>
            <span className="user-dropdown__name">{(currentUser?.name ?? 'User').split(' ')[0]}</span>
            <ChevronDown size={14} className={`user-dropdown__chevron${dropdownOpen ? ' user-dropdown__chevron--open' : ''}`} />
          </button>

          {dropdownOpen && (
            <div className="user-dropdown__menu" role="menu">
              <div className="user-dropdown__info">
                <div className="user-dropdown__full-name">{currentUser?.name ?? 'User'}</div>
                <div className="user-dropdown__email">{currentUser?.email ?? ''}</div>
              </div>
              <div className="user-dropdown__divider" />
              <button
                className="user-dropdown__item"
                role="menuitem"
                onClick={() => { setDropdownOpen(false); navigate('/profile') }}
              >
                <User size={15} aria-hidden="true" />
                Profile
              </button>
              <button
                className="user-dropdown__item user-dropdown__item--danger"
                role="menuitem"
                onClick={handleLogout}
              >
                <LogOut size={15} aria-hidden="true" />
                Sign out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}

export default Header
