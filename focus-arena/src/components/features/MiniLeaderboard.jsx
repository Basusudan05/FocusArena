function MiniLeaderboard({ entries = [], currentUserId }) {
  const MEDALS = ['🥇', '🥈', '🥉']

  function formatTime(minutes) {
    const h = Math.floor(minutes / 60)
    const m = minutes % 60
    return h > 0 ? `${h}h ${m}m` : `${m}m`
  }

  return (
    <div className="mini-lb">
      {entries.map((entry, i) => {
        const isYou = entry.userId === currentUserId
        return (
          <div
            key={entry.userId}
            className={`mini-lb__row${isYou ? ' mini-lb__row--you' : ''}`}
          >
            <span className="mini-lb__rank">{MEDALS[i] ?? `#${entry.rank}`}</span>
            <span className="mini-lb__name">
              {entry.username}
              {isYou && <span className="mini-lb__you-tag"> (You)</span>}
            </span>
            <span className="mini-lb__pts">{formatTime(entry.studyTimeMinutes)}</span>
          </div>
        )
      })}
    </div>
  )
}

export default MiniLeaderboard
