function GroupCard({ group, onClick }) {
  return (
    <div
      className="group-card card card--padding-md"
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && onClick()}
    >
      <div className="group-card__header">
        <div className="group-card__icon">👥</div>
      </div>
      <h3 className="group-card__name">{group.name}</h3>
      {group.description && <p className="group-card__desc">{group.description}</p>}
    </div>
  )
}

export default GroupCard
