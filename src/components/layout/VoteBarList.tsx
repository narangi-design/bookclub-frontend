import './VoteBarList.scss'
import { Link } from 'react-router-dom'

export interface VoteEntry {
  key: string | number
  title: string
  subtitle?: string
  value: number
  href?: string
}

interface Props {
  entries: VoteEntry[]
  winnerKey?: string | number | null
  accentWinner?: boolean
  totalVoters?: number | null
}

export default function VoteBarList({ entries, winnerKey, totalVoters }: Props) {
  const barBase = totalVoters ?? Math.max(...entries.map(e => e.value))

  return (
    <div className="vote-bar-list">
      {entries.map(entry => {
        const isWinner = entry.key === winnerKey
        const barPct = barBase > 0 ? (entry.value / barBase) * 100 : 0
        const pct = barBase > 0 ? Math.round((entry.value / barBase) * 100) : 0

        const inner = (
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
        )

        return entry.href
          ? <Link key={entry.key} to={entry.href} className={`vbl-row${isWinner ? ' vbl-row--winner' : ''}`}>{inner}</Link>
          : <div key={entry.key} className={`vbl-row${isWinner ? ' vbl-row--winner' : ''}`}>{inner}</div>
      })}
    </div>
  )
}
