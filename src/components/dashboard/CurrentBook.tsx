import './CurrentBook.scss'
import type { Book, User, Poll, PollVote } from '@/types'
import { formatDate } from '@/utils'
import VoteBarList, { type VoteEntry } from '@/components/layout/VoteBarList'
import CoverImage from '@/components/layout/CoverImage'
import { Link } from 'react-router-dom'

interface Props {
  book: Book
  authorName?: string
  addedByUser?: User
  poll?: Poll
  pollVotes: PollVote[]
  runoffPoll?: Poll
  allBooks: Book[]
}

const TOP_VOTES = 10

export default function CurrentBook({ book, authorName, addedByUser, poll, pollVotes, runoffPoll, allBooks }: Props) {
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

  const stage2Entries: VoteEntry[] = runoffPoll
    ? pollVotes
        .filter(v => v.poll_id === runoffPoll.id)
        .sort((a, b) => b.votes_count - a.votes_count)
        .map(v => ({
          key: v.book_id,
          title: bookById[v.book_id]?.title ?? `#${v.book_id}`,
          value: v.votes_count,
        }))
    : []

  return (
    <div className="card">
      <div className="card-header">
        <CoverImage coverSize="default" bookId={book.id} title={book.title} />
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
              В списке с {formatDate(book.added_at)}
              {' · '}
              Ведёт книгу {addedByUser && (
                <Link to={`/users/${addedByUser.id}`} className="user-link">
                  {addedByUser.username}
                </Link>
              )}
            </div>
          )}
        </div>
      </div>
      {poll && stage1Entries.length > 0 && (
        <div className="poll">
          <div className="stage-header">
            <span className="stage-label">
              {runoffPoll ? 'Голосование · Этап I' : 'Голосование'}
            </span>
            <span className="date">{formatDate(poll.date)}</span>
          </div>
          <VoteBarList entries={stage1Entries} winnerKey={book.id} />

          {runoffPoll && stage2Entries.length > 0 && (
            <>
              <div className="stage-header stage-header--runoff">
                <span className="stage-label">Голосование · Итог</span>
                <span className="date">{formatDate(runoffPoll.date)}</span>
              </div>
              <VoteBarList entries={stage2Entries} winnerKey={book.id} />
            </>
          )}
        </div>
      )}
    </div>
  )
}