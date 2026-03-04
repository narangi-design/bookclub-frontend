import { useState } from 'react'
import type { Book, User, Poll, PollVote, PollRunoff } from '@/types'
import './CurrentBook.scss'

interface Props {
  book: Book
  authorName?: string
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
      <div className="cover-placeholder">
        <span className="cover-initials">{title.slice(0, 2)}</span>
      </div>
    )
  }
  return (
    <img
      key={attempt}
      src={`/covers/${bookId}.${COVER_FORMATS[attempt]}`}
      alt={title}
      className="cover"
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
    <div className="vote-list">
      {votes.map((v, i) => {
        const vBook = bookById[v.book_id]
        if (!vBook) return null
        const isWinner = v.book_id === winnerId
        const pct = (v.votes_count / maxVotes) * 100
        return (
          <div key={i} className="vote-row">
            <div className="vote-main">
              <span className={`vote-title${isWinner ? ' vote-winner' : ''}`}>
                {isWinner && '★ '}{vBook.title}
              </span>
              <div className="bar-track">
                <div
                  className="bar"
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
            <span className={`vote-count${isWinner ? ' vote-winner' : ''}`}>{countLabel(v.votes_count, total)}</span>
          </div>
        )
      })}
    </div>
  )
}

const TOP_VOTES = 6

export default function CurrentBook({ book, authorName, addedByUser, poll, pollVotes, runoff, allBooks }: Props) {
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
    <div className="card">
      <div className="cover-wrap">
        <CoverImage bookId={book.id} title={book.title} />
      </div>

      <div className="info">
        <div className="badge">Сейчас читаем</div>

        <h2 className="title">{book.title}</h2>

        <div className="meta">
          {authorName && <span>{authorName}</span>}
          {authorName && book.country && <span className="dot">·</span>}
          {book.country && <span>{book.country}</span>}
        </div>

        {addedByUser && book.added_at && (
          <div className="added-by">
            Ведёт книгу <span className="username">{addedByUser.username}</span>
            {' · '}{formatDate(book.added_at)}
          </div>
        )}

        {poll && stage1Votes.length > 0 && (
          <div className="poll">

            <div className="stage-header">
              <span className="stage-label">
                {runoff ? 'Голосование · Этап I' : `Голосование`}
              </span>
              <span className="stage-date">{formatDate(poll.date)}</span>
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
                <div className="stage-header stage-header--runoff">
                  <span className="stage-label">Голосование · Итог</span>
                  <span className="stage-date">{formatDate(runoff.date)}</span>
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
