import './PollCard.scss'
import { useState } from 'react'
import { formatDate, pollVotesToEntries } from '@/utils'
import type { Book, Poll, PollVote } from '@/types'
import VoteBarList from '@/components/layout/VoteBarList'

interface Props {
  stage1: Poll
  stage2: Poll | null
  winner_book_id: number | null
  bookById: Record<number, Book>
  authorById: Record<number, string>
  votes: PollVote[]
}

export default function PollCard({ stage1, stage2, winner_book_id, bookById, authorById, votes }: Props) {
  const [isOpen, setIsOpen] = useState(false)

  const winner = winner_book_id != null ? bookById[winner_book_id] : null

  const s1Votes = votes
    .filter(v => v.poll_id === stage1.id)
    .sort((a, b) => b.votes_count - a.votes_count)
  const s2Votes = stage2
    ? votes.filter(v => v.poll_id === stage2.id).sort((a, b) => b.votes_count - a.votes_count)
    : []

  const totalCandidates = new Set([...s1Votes, ...s2Votes].map(v => v.book_id)).size

  const toEntries = (vs: PollVote[]) => pollVotesToEntries(vs, bookById, authorById)

  return (
    <div className={`poll-card${isOpen ? ' poll-card--open' : ''}`}>
      <button
        className="poll-card-header"
        onClick={() => setIsOpen(o => !o)}
      >
        <div className="poll-card-left">
          <span className="date">{formatDate(stage1.date)}</span>
          <span className="poll-card-id">#{stage1.id}</span>
          {stage2 && <span className="poll-card-badge">2 тура</span>}
        </div>

        <div className="poll-card-center">
          {winner
            ? <span className="poll-card-winner">{winner.title}</span>
            : <span className="poll-card-no-winner">без победителя</span>
          }
        </div>

        <div className="poll-card-right">

          <span className={`poll-card-chevron${isOpen ? ' poll-card-chevron--up' : ''}`}>▾</span>
        </div>
      </button>

      {isOpen && (
        <div className="poll-card-body">
          <span className="poll-card-meta">
            {stage1.total_voters != null && <>{stage1.total_voters} человек голосовало · </>}
            Выбор из {totalCandidates} книг
          </span>
          <div className="poll-card-section">
            {stage2 && <div className="poll-card-section-label">1 тур</div>}
            <VoteBarList
              entries={toEntries(s1Votes)}
              winnerKey={stage2 ? undefined : winner_book_id ?? undefined}
              totalVoters={stage1.total_voters}
            />
          </div>
          {stage2 && s2Votes.length > 0 && (
            <div className="poll-card-section poll-card-section--accent">
              <div className="poll-card-section-label">Финал</div>
              <VoteBarList
                entries={toEntries(s2Votes)}
                winnerKey={winner_book_id ?? undefined}
                totalVoters={stage2.total_voters}
              />
            </div>
          )}
        </div>
      )}
    </div>
  )
}
