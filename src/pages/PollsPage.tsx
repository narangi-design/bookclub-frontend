import { useState } from 'react'
import { usePolls, usePollVotes, useBooks, useAuthors } from '@/hooks'
import type { Book, Poll } from '@/types'
import './PollsPage.scss'

const MONTHS = ['янв', 'фев', 'мар', 'апр', 'май', 'июн', 'июл', 'авг', 'сен', 'окт', 'ноя', 'дек']
function fmtDate(d: string): string {
  const [y, m, day] = d.split('-')
  return `${+day} ${MONTHS[+m - 1]} ${y}`
}

type Filter = 'all' | 'won' | 'open'

interface Session {
  stage1: Poll
  stage2: Poll | null
  winner_book_id: number | null
}

export default function PollsPage() {
  const { data: polls   = [] } = usePolls()
  const { data: votes   = [] } = usePollVotes()
  const { data: books   = [] } = useBooks()
  const { data: authors = [] } = useAuthors()
  const [expandedId, setExpandedId] = useState<number | null>(null)
  const [filter, setFilter] = useState<Filter>('all')

  const bookById:   Record<number, Book>   = Object.fromEntries(books.map(b => [b.id, b]))
  const authorById: Record<number, string> = Object.fromEntries(authors.map(a => [a.id, a.value]))

  // Group into sessions: one stage-1 poll + optional stage-2 runoff
  const stage2ByParent: Record<number, Poll> = {}
  for (const p of polls.filter(p => p.stage === 2)) {
    if (p.parent_poll_id != null) stage2ByParent[p.parent_poll_id] = p
  }
  const sessions: Session[] = polls
    .filter(p => p.stage === 1)
    .sort((a, b) => b.date.localeCompare(a.date))
    .map(s1 => {
      const s2 = stage2ByParent[s1.id] ?? null
      return {
        stage1: s1,
        stage2: s2,
        winner_book_id: s2 ? s2.winner_book_id : s1.winner_book_id,
      }
    })

  const counts = {
    all:  sessions.length,
    won:  sessions.filter(s => s.winner_book_id !== null).length,
    open: sessions.filter(s => s.winner_book_id === null).length,
  }

  const filtered =
    filter === 'won'  ? sessions.filter(s => s.winner_book_id !== null) :
    filter === 'open' ? sessions.filter(s => s.winner_book_id === null) :
    sessions

  return (
    <div className="page">
      <h1 className="page-title">Голосования</h1>

      <div className="filter-row">
        {(['all', 'won', 'open'] as Filter[]).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`filter-btn${filter === f ? ' filter-btn--active' : ''}`}
          >
            {f === 'all' ? 'Все' : f === 'won' ? 'С победителем' : 'Без победителя'}
            <span className="filter-count">{counts[f]}</span>
          </button>
        ))}
      </div>

      <div className="list">
        {filtered.map(({ stage1, stage2, winner_book_id }) => {
          const winner = winner_book_id != null ? bookById[winner_book_id] : null
          const isOpen = expandedId === stage1.id

          const s1Votes = votes.filter(v => v.poll_id === stage1.id)
                               .sort((a, b) => b.votes_count - a.votes_count)
          const s2Votes = stage2
            ? votes.filter(v => v.poll_id === stage2.id).sort((a, b) => b.votes_count - a.votes_count)
            : []

          const s1Max = s1Votes[0]?.votes_count ?? 1
          const s2Max = s2Votes[0]?.votes_count ?? 1
          const totalCandidates = new Set([...s1Votes, ...s2Votes].map(v => v.book_id)).size

          return (
            <div key={stage1.id} className={`card${isOpen ? ' card--open' : ''}`}>
              <button
                className="card-header"
                onClick={() => setExpandedId(prev => prev === stage1.id ? null : stage1.id)}
              >
                <div className="header-left">
                  <span className="date">{fmtDate(stage1.date)}</span>
                  <span className="poll-id">#{stage1.id}</span>
                  {stage2 && <span className="stage-badge">2 тура</span>}
                </div>

                <div className="header-center">
                  {winner
                    ? <span className="winner-name">{winner.title}</span>
                    : <span className="no-winner">без победителя</span>
                  }
                </div>

                <div className="header-right">
                  {stage1.total_voters != null && (
                    <span className="meta">{stage1.total_voters} уч.</span>
                  )}
                  <span className="meta">{totalCandidates} кн.</span>
                  <span className={`chevron${isOpen ? ' chevron--up' : ''}`}>▾</span>
                </div>
              </button>

              {isOpen && (
                <div className="body">
                  <VoteSection
                    label={stage2 ? '1 тур' : null}
                    pollVotes={s1Votes}
                    maxVotes={s1Max}
                    winner_book_id={stage2 ? null : winner_book_id}
                    bookById={bookById}
                    authorById={authorById}
                  />
                  {stage2 && (
                    <VoteSection
                      label="Финал"
                      pollVotes={s2Votes}
                      maxVotes={s2Max}
                      winner_book_id={winner_book_id}
                      bookById={bookById}
                      authorById={authorById}
                      accent
                    />
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

function VoteSection({
  label,
  pollVotes,
  maxVotes,
  winner_book_id,
  bookById,
  authorById,
  accent = false,
}: {
  label: string | null
  pollVotes: { id: number; book_id: number; votes_count: number }[]
  maxVotes: number
  winner_book_id: number | null
  bookById: Record<number, Book>
  authorById: Record<number, string>
  accent?: boolean
}) {
  return (
    <div className={`section${accent ? ' section--accent' : ''}`}>
      {label && <div className="section-label">{label}</div>}
      {pollVotes.map(vote => {
        const book = bookById[vote.book_id]
        const isWinner = vote.book_id === winner_book_id
        const pct = Math.round((vote.votes_count / maxVotes) * 100)
        return (
          <div
            key={vote.id}
            className={`vote-row${isWinner ? ' vote-row--win' : ''}`}
          >
            <div className="vote-title">
              {isWinner && <span className="trophy">★</span>}
              {book?.title ?? `Book #${vote.book_id}`}
              {book?.author_id != null && <span className="vote-author">{authorById[book.author_id]}</span>}
            </div>
            <div className="vote-bar-wrap">
              <div
                className={`vote-bar${isWinner ? ' vote-bar--accent' : ''}`}
                style={{ width: `${pct}%` }}
              />
            </div>
            <div className="vote-count">{vote.votes_count}</div>
          </div>
        )
      })}
    </div>
  )
}
