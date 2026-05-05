import './VoteBarList.scss'

export interface VoteEntry {
  key: string | number
  title: string
  subtitle?: string
  value: number
}

interface Props {
  entries: VoteEntry[]
  winnerKey?: string | number | null
  accentWinner?: boolean
  totalVoters?: number | null
}

export default function VoteBarList({ entries, winnerKey, totalVoters }: Props) {
  const total = entries.reduce((s, e) => s + e.value, 0)
  const barBase = totalVoters ?? Math.max(...entries.map(e => e.value))

  return (
    <div className="vote-bar-list">
      {entries.map(entry => {
        const isWinner = entry.key === winnerKey
        const barPct = barBase > 0 ? (entry.value / barBase) * 100 : 0
        const pct = barBase > 0 ? Math.round((entry.value / barBase) * 100) : 0

        return (
          <div key={entry.key} className={`vbl-row${isWinner ? ' vbl-row--winner' : ''}`}>
            <div className="vbl-bar-wrap">
              <div className="vbl-bar" style={{ width: `${barPct}%` }} />
              <span className="vbl-inner">
                <span className="vbl-count">{entry.value} · {pct}%</span>
                <span className="vbl-title">
                  {entry.title}
                  {isWinner && <span className="vbl-trophy"> ★</span>}
                </span>
              </span>
            </div>
          </div>
        )
      })}
    </div>
  )
}
