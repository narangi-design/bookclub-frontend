import './VoteBarList.scss'

export interface VoteEntry {
  key: string | number
  title: string
  subtitle?: string   // e.g. author name
  value: number
}

interface Props {
  entries: VoteEntry[]
  winnerKey?: string | number | null
  accentWinner?: boolean   // subtle background on winner row
}

export default function VoteBarList({ entries, winnerKey, accentWinner = false }: Props) {
  const total = entries.reduce((s, e) => s + e.value, 0)

  return (
    <div className="vote-bar-list">
      {entries.map(entry => {
        const isWinner = entry.key === winnerKey
        const pct = total > 0 ? (entry.value / total) * 100 : 0
        const countStr = `${entry.value} · ${total > 0 ? Math.round((entry.value / total) * 100) : 0}%`
        return (
          <div
            key={entry.key}
            className={`vbl-entry${isWinner && accentWinner ? ' vbl-entry--accent' : ''}`}
          >
            <div className="vbl-legend">
              <div className={`vbl-count${isWinner ? ' vbl-count--winner' : ''}`}>{countStr}</div>
              <div className={`vbl-title${isWinner ? ' vbl-title--winner' : ''}`}>
                {entry.title}
                {entry.subtitle && <span className="vbl-subtitle">{entry.subtitle}</span>}
                {isWinner && <span className="vbl-trophy"> ★</span>}
              </div>
            </div>
            <div className="vbl-bar-wrap">
              <div
                className={`vbl-bar${isWinner ? ' vbl-bar--winner' : ''}`}
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
        )
      })}
    </div>
  )
}