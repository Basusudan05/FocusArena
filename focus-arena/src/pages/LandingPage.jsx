import { Link } from 'react-router-dom'
import Button from '../components/ui/Button'

const STEPS = [
  { num: '01', title: 'Create or Join a Group', desc: 'Invite friends and form a study crew ready to compete.' },
  { num: '02', title: 'Start the Timer', desc: 'Hit Start when you begin studying. Every minute counts.' },
  { num: '03', title: 'Earn Points', desc: 'Study time is converted into points automatically.' },
  { num: '04', title: 'Check the Leaderboard', desc: 'See who studied the most today, this week, or all time.' },
]

const FEATURES = [
  { icon: '⏱️', title: 'Study Timer', desc: 'Track every session with a clean, distraction-free timer.' },
  { icon: '👥', title: 'Study Groups', desc: 'Create groups with friends and study toward shared goals.' },
  { icon: '🏆', title: 'Leaderboards', desc: 'Compete daily, weekly, monthly or all-time rankings.' },
  { icon: '🔥', title: 'Streaks', desc: 'Build daily habits and keep your streak alive.' },
  { icon: '⭐', title: 'Points System', desc: 'Earn points for every minute you study. No shortcuts.' },
  { icon: '📊', title: 'Progress Dashboard', desc: 'See your stats, goals and recent sessions at a glance.' },
]

function LandingPage() {
  return (
    <div className="landing">
      {/* ── Navbar ── */}
      <header className="landing-nav">
        <div className="landing-nav__logo">
          <span>🎯</span>
          <span className="landing-nav__logo-text">FocusArena</span>
        </div>
        <div className="landing-nav__actions">
          <Link to="/login">
            <Button variant="secondary" size="sm">Login</Button>
          </Link>
          <Link to="/register">
            <Button variant="primary" size="sm">Get Started</Button>
          </Link>
        </div>
      </header>

      {/* ── Hero ── */}
      <section className="hero">
        <div className="hero__content">
          <div className="badge badge--indigo hero__badge">✨ Social Study Platform</div>
          <h1 className="hero__headline">
            Study Together.<br />
            <span className="hero__headline-accent">Compete. Grow.</span>
          </h1>
          <p className="hero__subtext">
            Turn your study sessions into friendly competition. Track time, earn points,
            climb leaderboards — and stay consistent with your friends.
          </p>
          <div className="hero__cta">
            <Link to="/register">
              <Button variant="primary" size="lg">Get Started Free</Button>
            </Link>
            <Link to="/login">
              <Button variant="secondary" size="lg">Sign In</Button>
            </Link>
          </div>
        </div>

        {/* Dashboard preview mockup */}
        <div className="hero__preview">
          <div className="dashboard-mockup">
            <div className="dashboard-mockup__header">
              <span className="dashboard-mockup__dot dashboard-mockup__dot--red" />
              <span className="dashboard-mockup__dot dashboard-mockup__dot--yellow" />
              <span className="dashboard-mockup__dot dashboard-mockup__dot--green" />
              <span className="dashboard-mockup__title">FocusArena Dashboard</span>
            </div>
            <div className="dashboard-mockup__body">
              <div className="mockup-greeting">👋 Good morning, Alex!</div>
              <div className="mockup-stats">
                <div className="mockup-stat mockup-stat--green">
                  <div className="mockup-stat__val">2h 15m</div>
                  <div className="mockup-stat__label">Today</div>
                </div>
                <div className="mockup-stat mockup-stat--yellow">
                  <div className="mockup-stat__val">3,840</div>
                  <div className="mockup-stat__label">Points</div>
                </div>
                <div className="mockup-stat mockup-stat--indigo">
                  <div className="mockup-stat__val">🔥 14</div>
                  <div className="mockup-stat__label">Streak</div>
                </div>
                <div className="mockup-stat">
                  <div className="mockup-stat__val">#1</div>
                  <div className="mockup-stat__label">Rank</div>
                </div>
              </div>
              <div className="mockup-progress-label">Today's Goal</div>
              <div className="mockup-progress-track">
                <div className="mockup-progress-fill" style={{ width: '72%' }} />
              </div>
              <div className="mockup-leaderboard">
                <div className="mockup-lb-row mockup-lb-row--you">
                  <span>🥇 Alex Johnson</span><span>3,840 pts</span>
                </div>
                <div className="mockup-lb-row">
                  <span>🥈 Maria Garcia</span><span>3,210 pts</span>
                </div>
                <div className="mockup-lb-row">
                  <span>🥉 James Lee</span><span>2,750 pts</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── How It Works ── */}
      <section className="section section--alt">
        <div className="section__container">
          <h2 className="section__title">How It Works</h2>
          <p className="section__subtitle">Four simple steps to a better study habit</p>
          <div className="steps">
            {STEPS.map((s) => (
              <div key={s.num} className="step-card">
                <div className="step-card__num">{s.num}</div>
                <h3 className="step-card__title">{s.title}</h3>
                <p className="step-card__desc">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section className="section">
        <div className="section__container">
          <h2 className="section__title">Everything You Need</h2>
          <p className="section__subtitle">Built for students who want to study smarter together</p>
          <div className="features-grid">
            {FEATURES.map((f) => (
              <div key={f.title} className="feature-card card card--padding-md">
                <div className="feature-card__icon">{f.icon}</div>
                <h3 className="feature-card__title">{f.title}</h3>
                <p className="feature-card__desc">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="cta-section">
        <div className="cta-section__inner">
          <h2 className="cta-section__title">Ready to level up your study game?</h2>
          <p className="cta-section__sub">Join thousands of students already competing on FocusArena.</p>
          <Link to="/register">
            <Button variant="primary" size="lg">Start for Free</Button>
          </Link>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="landing-footer">
        <div className="landing-footer__logo">
          <span>🎯</span>
          <span>FocusArena</span>
        </div>
        <p className="landing-footer__copy">© 2025 FocusArena. Built for students, by students.</p>
      </footer>
    </div>
  )
}

export default LandingPage
