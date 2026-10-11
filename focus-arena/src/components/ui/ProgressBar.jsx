function ProgressBar({ value = 0, label, color = 'indigo' }) {
  // Clamp value between 0 and 100
  const pct = Math.min(100, Math.max(0, value))
  const containerClass = `progress-bar progress-bar--${color}`

  return (
    <div className={containerClass}>
      {label && (
        <div className="progress-bar__header">
          <span className="progress-bar__label">{label}</span>
          <span className="progress-bar__pct">{Math.round(pct)}%</span>
        </div>
      )}
      <div className="progress-bar__track" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}>
        <div
          className="progress-bar__fill"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}

export default ProgressBar
