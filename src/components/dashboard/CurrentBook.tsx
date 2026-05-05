import './CurrentBook.scss'
import type { Book, Member, Poll, PollVote, MemberVisibility } from '@/types'
import { formatDate, memberName, pollVotesToEntries } from '@/utils'
import VoteBarList from '@/components/layout/VoteBarList'
import CoverImage from '@/components/layout/CoverImage'
import { Link } from 'react-router-dom'

interface Props {
  book: Book
  authorName?: string
  addedByMember?: Member
  memberVisibility?: MemberVisibility
  poll?: Poll
  pollVotes: PollVote[]
  runoffPoll?: Poll
  allBooks: Book[]
  authorById: Record<number, string>
}

const TOP_VOTES = 10

export default function CurrentBook({ book, authorName, addedByMember, memberVisibility, poll, pollVotes, runoffPoll, allBooks, authorById }: Props) {
  const bookById = Object.fromEntries(allBooks.map(b => [b.id, b]))

  const stage1Votes = pollVotes
    .filter(v => v.poll_id === poll?.id)
    .sort((a, b) => b.votes_count - a.votes_count)
    .slice(0, TOP_VOTES)

  const stage1Entries = pollVotesToEntries(stage1Votes, bookById, authorById)

  const stage2Entries = runoffPoll
    ? pollVotesToEntries(
        pollVotes.filter(v => v.poll_id === runoffPoll.id).sort((a, b) => b.votes_count - a.votes_count),
        bookById,
        authorById,
      )
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
          {book.added_at && (memberVisibility === 'visible' ? addedByMember : book.added_by_member_id !== null) && (
            <div className="added-by">
              В списке с {formatDate(book.added_at)}
              {' · '}
              Ведёт книгу{' '}
              {memberVisibility === 'visible' && addedByMember
                ? <Link to={`/members/${addedByMember.id}`} className="member-link">{memberName(addedByMember)}</Link>
                : <span className="member-blur">Участник</span>
              }
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
            <span className="date">
              {formatDate(poll.date)}
              {poll.total_voters != null && <> · {poll.total_voters} чел.</>}
            </span>
          </div>
          <VoteBarList entries={stage1Entries} winnerKey={book.id} totalVoters={poll.total_voters} />

          {runoffPoll && stage2Entries.length > 0 && (
            <>
              <div className="stage-header stage-header--runoff">
                <span className="stage-label">Голосование · Итог</span>
                <span className="date">
                  {formatDate(runoffPoll.date)}
                  {runoffPoll.total_voters != null && <> · {runoffPoll.total_voters} чел.</>}
                </span>
              </div>
              <VoteBarList entries={stage2Entries} winnerKey={book.id} totalVoters={runoffPoll.total_voters} />
            </>
          )}
        </div>
      )}
    </div>
  )
}
