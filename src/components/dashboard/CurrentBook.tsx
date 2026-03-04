import { useState } from 'react'
import type { Book, User, Poll, PollVote, PollRunoff } from '@/types'
import VoteBarList, { type VoteEntry } from '@/components/VoteBarList'
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

const TOP_VOTES = 6

export default function CurrentBook({ book, authorName, addedByUser, poll, pollVotes, runoff, allBooks }: Props) {
  const bookById = Object.fromEntries(allBooks.map(b => [b.id, b]))

  const stage1Votes = pollVotes
    .filter(v => v.poll_id === poll?.id)
    .sort((a, b) => b.votes_count - a.votes_count)
    .slice(0, TOP_VOTES)

  const stage1Entries: VoteEntry[] = stage1Votes.map(v => ({
    key: v.book_id,
    title: bookById[v.book_id]?.title ?? `#${v.book_id}`,
    value: v.votes_count,
  }))

  const stage2Votes = runoff
    ? [...runoff.votes].sort((a, b) => b.votes_count - a.votes_count)
    : []

  const stage2Entries: VoteEntry[] = stage2Votes.map(v => ({
    key: v.book_id,
    title: bookById[v.book_id]?.title ?? `#${v.book_id}`,
    value: v.votes_count,
  }))

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

        {poll && stage1Entries.length > 0 && (
          <div className="poll">
            <div className="stage-header">
              <span className="stage-label">
                {runoff ? 'Голосование · Этап I' : 'Голосование'}
              </span>
              <span className="stage-date">{formatDate(poll.date)}</span>
            </div>
            <VoteBarList entries={stage1Entries} winnerKey={book.id} />

            {runoff && stage2Entries.length > 0 && (
              <>
                <div className="stage-header stage-header--runoff">
                  <span className="stage-label">Голосование · Итог</span>
                  <span className="stage-date">{formatDate(runoff.date)}</span>
                </div>
                <VoteBarList entries={stage2Entries} winnerKey={book.id} />
              </>
            )}
          </div>
        )}
      </div>
    </div>
  )
}