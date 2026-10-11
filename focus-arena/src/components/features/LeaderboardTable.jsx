function formatTime(minutes) {
  if (!minutes && minutes !== 0) return '—'
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return h > 0 ? `${h}h ${m}m` : `${m}m`
}

const MEDALS = { 1: '🥇', 2: '🥈', 3: '🥉' }

function LeaderboardTable({ entries = [], currentUserId }) {
  if (entries.length === 0) return null

  return (
    <div className="lb-table-wrap">
      <table className="lb-table">
        <thead>
          <tr>
            <th className="lb-table__th lb-table__th--rank">Rank</th>
            <th className="lb-table__th">User</th>
            <th className="lb-table__th lb-table__th--num">Study Time</th>
            <th className="lb-table__th lb-table__th--num">Points</th>
            <th className="lb-table__th lb-table__th--num">Streak</th>
          </tr>
        </thead>
        <tbody>
          {entries.map((entry) => {
            const isYou = entry.userId === currentUserId
            return (
              <tr key={entry.userId} className={isYou ? 'lb-table__row lb-table__row--you' : 'lb-table__row'}>
                <td className="lb-table__td lb-table__td--rank">
                  {MEDALS[entry.rank] ?? `#${entry.rank}`}
                </td>
                <td className="lb-table__td">
                  <span className="lb-table__name">{entry.username}</span>
                  {isYou && <span className="lb-table__you-tag">You</span>}
                </td>
                <td className="lb-table__td lb-table__td--num">{formatTime(entry.studyTimeMinutes)}</td>
                <td className="lb-table__td lb-table__td--num lb-table__td--points">
                  {(entry.points ?? 0).toLocaleString()}
                </td>
                <td className="lb-table__td lb-table__td--num">
                  🔥 {entry.streak ?? 0}d
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

export default LeaderboardTable
