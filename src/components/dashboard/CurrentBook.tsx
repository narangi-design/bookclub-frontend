import { useState } from 'react'
import type { Book, User, Poll, PollVote, PollRunoff } from '@/types'
import styles from './CurrentBook.module.css'

interface Props {
  book: Book
  addedByUser?: User
  poll?: Poll
  pollVotes: PollVote[]
  runoff?: PollRunoff
  allBooks: Book[]
}

const COVER_FORMATS = ['jpg', 'jpeg', 'png', 'webp']

function CoverImage({ bookId, title }: { bookId: number; title: string }) {
  const [attempt, setAttempt] = useState(0)

  if (attempt >= COVER_FORMATS.length) {
    return (
      <div className={styles.coverPlaceholder}>
        <span className={styles.coverInitials}>{title.slice(0, 2)}</span>
      </div>
    )
  }
  return (
    <img
      key={attempt}
      src={`/covers/${bookId}.${COVER_FORMATS[attempt]}`}
      alt={title}
      className={styles.cover}
      onError={() => setAttempt(a => a + 1)}
    />
  )
}

function formatDate(iso: string) {
  return new Intl.DateTimeFormat('ru-RU', {
    day: 'numeric', month: 'short', year: 'numeric',
  }).format(new Date(iso))
}

function VoteList({
  votes,
  maxVotes,
  winnerId,
  bookById,
  countLabel,
}: {
  votes: Array<{ book_id: number; votes_count: number }>
  maxVotes: number
  winnerId: number
  bookById: Record<number, Book>
  countLabel: (n: number, total: number) => string
}) {
  const total = votes.reduce((s, v) => s + v.votes_count, 0)
  return (
    <div className={styles.voteList}>
      {votes.map((v, i) => {
        const vBook = bookById[v.book_id]
        if (!vBook) return null
        const isWinner = v.book_id === winnerId
        const pct = (v.votes_count / maxVotes) * 100
        return (
          <div key={i} className={styles.voteRow}>
            <div className={styles.voteMain}>
              <span className={`${styles.voteTitle} ${isWinner ? styles.voteWinner : ''}`}>
                {isWinner && '★ '}{vBook.title}
              </span>
              <div className={styles.barTrack}>
                <div
                  className={`${styles.bar} ${isWinner ? styles.barWinner : ''}`}
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
            <span className={`${styles.voteCount} ${isWinner ? styles.voteWinner : ''}`}>{countLabel(v.votes_count, total)}</span>
          </div>
        )
      })}
    </div>
  )
}

const TOP_VOTES = 6

export default function CurrentBook({ book, addedByUser, poll, pollVotes, runoff, allBooks }: Props) {
  const bookById = Object.fromEntries(allBooks.map(b => [b.id, b]))

  const stage1AllVotes = pollVotes.filter(v => v.poll_id === poll?.id)
  const stage1Votes = stage1AllVotes
    .sort((a, b) => b.votes_count - a.votes_count)
    .slice(0, TOP_VOTES)

  const stage1Max = stage1Votes[0]?.votes_count ?? 1

  const stage2Votes = runoff
    ? [...runoff.votes].sort((a, b) => b.votes_count - a.votes_count)
    : []
  const stage2Max = stage2Votes[0]?.votes_count ?? 1

  return (
    <div className={styles.card}>
      <div className={styles.coverWrap}>
        <CoverImage bookId={book.id} title={book.title} />
      </div>

      <div className={styles.info}>
        <div className={styles.badge}>Сейчас читаем</div>

        <h2 className={styles.title}>{book.title}</h2>

        <div className={styles.meta}>
          {book.author && <span>{book.author}</span>}
          {book.author && book.country && <span className={styles.dot}>·</span>}
          {book.country && <span>{book.country}</span>}
        </div>

        {addedByUser && book.added_at && (
          <div className={styles.addedBy}>
            Ведёт книгу <span className={styles.username}>{addedByUser.username}</span>
            {' · '}{formatDate(book.added_at)}
          </div>
        )}

        {poll && stage1Votes.length > 0 && (
          <div className={styles.poll}>

            <div className={styles.stageHeader}>
              <span className={styles.stageLabel}>
                {runoff ? 'Голосование · Этап I' : `Голосование`}
              </span>
              <span className={styles.stageDate}>{formatDate(poll.date)}</span>
            </div>
            <VoteList
              votes={stage1Votes}
              maxVotes={stage1Max}
              winnerId={book.id}
              bookById={bookById}
              countLabel={(n, total) => `${n} · ${Math.round((n / total) * 100)}%`}
            />

            {runoff && stage2Votes.length > 0 && (
              <>
                <div className={`${styles.stageHeader} ${styles.stageHeaderRunoff}`}>
                  <span className={styles.stageLabel}>Голосование · Итог</span>
                  <span className={styles.stageDate}>{formatDate(runoff.date)}</span>
                </div>
                <VoteList
                  votes={stage2Votes}
                  maxVotes={stage2Max}
                  winnerId={book.id}
                  bookById={bookById}
                  countLabel={(n, total) => `${n} · ${Math.round((n / total) * 100)}%`}
                />
              </>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
