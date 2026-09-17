import './VoteRounds.scss'
import type { ReactNode } from 'react'
import VoteBarList, { type VoteEntry } from './VoteBarList'

export interface VoteRound {
  key: string | number
  entries: VoteEntry[]
  winnerKey?: string | number | null
  totalVoters?: number | null
  meta?: ReactNode
}

interface Props {
  /** Rounds in chronological order (earliest first, decisive round last). */
  rounds: VoteRound[]
}

export default function VoteRounds({ rounds }: Props) {
  const isMulti = rounds.length > 1
  const ordered = isMulti ? [...rounds].reverse() : rounds

  return (
    <div className="vote-rounds">
      {ordered.map((round, i) => {
        const label = isMulti ? (i === 0 ? 'Итог' : 'Этап I') : undefined
        return (
          <div
            key={round.key}
            className={`vote-round${i > 0 ? ' vote-round--divider' : ''}`}
          >
            {(label || round.meta) && (
              <div className="vote-round-header">
                {label && <span className="vote-round-label">{label}</span>}
                {round.meta && <span className="vote-round-meta">{round.meta}</span>}
              </div>
            )}
            <VoteBarList entries={round.entries} winnerKey={round.winnerKey} totalVoters={round.totalVoters} />
          </div>
        )
      })}
    </div>
  )
}
