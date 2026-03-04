import { useState } from 'react'
import { usePolls, usePollVotes, useBooks, useAuthors } from '@/hooks'
import type { Book, Poll } from '@/types'
import VoteBarList, { type VoteEntry } from '@/components/VoteBarList'
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

          const totalCandidates = new Set([...s1Votes, ...s2Votes].map(v => v.book_id)).size

          const toEntries = (vs: typeof s1Votes): VoteEntry[] => vs.map(v => {
            const book = bookById[v.book_id]
            return {
              key: v.id,
              title: book?.title ?? `#${v.book_id}`,
              subtitle: book?.author_id != null ? authorById[book.author_id] : undefined,
              value: v.votes_count,
            }
          })

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
                  <div className="section">
                    {stage2 && <div className="section-label">1 тур</div>}
                    <VoteBarList
                      entries={toEntries(s1Votes)}
                      winnerKey={stage2 ? undefined : winner_book_id ?? undefined}
                      accentWinner
                    />
                  </div>
                  {stage2 && s2Votes.length > 0 && (
                    <div className="section section--accent">
                      <div className="section-label">Финал</div>
                      <VoteBarList
                        entries={toEntries(s2Votes)}
                        winnerKey={winner_book_id ?? undefined}
                        accentWinner
                      />
                    </div>
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