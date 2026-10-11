function StatCard({ label, value, icon, color = 'default' }) {
  const classes = ['stat-card', `stat-card--${color}`].join(' ')

  return (
    <div className={classes}>
      {icon && (
        <div className="stat-card__icon" aria-hidden="true">
          {icon}
        </div>
      )}
      <div className="stat-card__value">{value}</div>
      <div className="stat-card__label">{label}</div>
    </div>
  )
}

export default StatCard
