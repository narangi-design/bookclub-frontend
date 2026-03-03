import { useState } from 'react'
import { usePolls, usePollVotes, useBooks } from '@/hooks'
import type { Book, Poll } from '@/types'
import styles from './PollsPage.module.css'

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
  const { data: polls = [] } = usePolls()
  const { data: votes = [] } = usePollVotes()
  const { data: books = [] } = useBooks()
  const [expandedId, setExpandedId] = useState<number | null>(null)
  const [filter, setFilter] = useState<Filter>('all')

  const bookById: Record<number, Book> = Object.fromEntries(books.map(b => [b.id, b]))

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
    <div className={styles.page}>
      <h1 className={styles.pageTitle}>Голосования</h1>

      <div className={styles.filterRow}>
        {([
          ['all',  'Все'],
          ['won',  'С победителем'],
          ['open', 'Без победителя'],
        ] as [Filter, string][]).map(([f, label]) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`${styles.filterBtn} ${filter === f ? styles.filterBtnActive : ''}`}
          >
            {label}
            <span className={styles.filterCount}>{counts[f]}</span>
          </button>
        ))}
      </div>

      <div className={styles.list}>
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
            <div key={stage1.id} className={`${styles.card} ${isOpen ? styles.cardOpen : ''}`}>
              <button
                className={styles.cardHeader}
                onClick={() => setExpandedId(prev => prev === stage1.id ? null : stage1.id)}
              >
                <div className={styles.headerLeft}>
                  <span className={styles.date}>{fmtDate(stage1.date)}</span>
                  <span className={styles.pollId}>#{stage1.id}</span>
                  {stage2 && <span className={styles.stageBadge}>2 тура</span>}
                </div>

                <div className={styles.headerCenter}>
                  {winner
                    ? <span className={styles.winnerName}>{winner.title}</span>
                    : <span className={styles.noWinner}>без победителя</span>
                  }
                </div>

                <div className={styles.headerRight}>
                  {stage1.total_voters != null && (
                    <span className={styles.meta}>{stage1.total_voters} уч.</span>
                  )}
                  <span className={styles.meta}>{totalCandidates} кн.</span>
                  <span className={`${styles.chevron} ${isOpen ? styles.chevronUp : ''}`}>▾</span>
                </div>
              </button>

              {isOpen && (
                <div className={styles.body}>
                  <VoteSection
                    label={stage2 ? '1 тур' : null}
                    pollVotes={s1Votes}
                    maxVotes={s1Max}
                    winner_book_id={stage2 ? null : winner_book_id}
                    bookById={bookById}
                  />
                  {stage2 && (
                    <VoteSection
                      label="Финал"
                      pollVotes={s2Votes}
                      maxVotes={s2Max}
                      winner_book_id={winner_book_id}
                      bookById={bookById}
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
  accent = false,
}: {
  label: string | null
  pollVotes: { id: number; book_id: number; votes_count: number }[]
  maxVotes: number
  winner_book_id: number | null
  bookById: Record<number, Book>
  accent?: boolean
}) {
  return (
    <div className={`${styles.section} ${accent ? styles.sectionAccent : ''}`}>
      {label && <div className={styles.sectionLabel}>{label}</div>}
      {pollVotes.map(vote => {
        const book = bookById[vote.book_id]
        const isWinner = vote.book_id === winner_book_id
        const pct = Math.round((vote.votes_count / maxVotes) * 100)
        return (
          <div
            key={vote.id}
            className={`${styles.voteRow} ${isWinner ? styles.voteRowWin : ''}`}
          >
            <div className={styles.voteTitle}>
              {isWinner && <span className={styles.trophy}>★</span>}
              {book?.title ?? `Book #${vote.book_id}`}
              {book?.author && <span className={styles.voteAuthor}>{book.author}</span>}
            </div>
            <div className={styles.voteBarWrap}>
              <div
                className={`${styles.voteBar} ${isWinner ? styles.voteBarAccent : ''}`}
                style={{ width: `${pct}%` }}
              />
            </div>
            <div className={styles.voteCount}>{vote.votes_count}</div>
          </div>
        )
      })}
    </div>
  )
}
