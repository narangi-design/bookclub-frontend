import './BookTimeline.scss'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import type { Book, BookHistoryEvent, Member, MemberVisibility, PollVote } from '@/types'
import { formatDate, memberName, pollVotesToEntries } from '@/utils'
import VoteRounds from './VoteRounds'

interface Props {
  events: BookHistoryEvent[]
  bookById: Record<number, Book>
  authorById: Record<number, string>
  memberById: Record<number, Member>
  memberVisibility: MemberVisibility
}

export default function BookTimeline({ events, bookById, authorById, memberById, memberVisibility }: Props) {
  if (events.length === 0) return null

  return (
    <div className="book-timeline">
      {events.map(event => (
        <TimelineNode
          key={eventKey(event)}
          event={event}
          bookById={bookById}
          authorById={authorById}
          memberById={memberById}
          memberVisibility={memberVisibility}
        />
      ))}
    </div>
  )
}

function eventKey(event: BookHistoryEvent): string {
  switch (event.type) {
    case 'poll': return `poll-${event.session_id}`
    case 'award': return `award-${event.year}`
    case 'added': return 'added'
    case 'removed': return 'removed'
  }
}

interface NodeProps {
  event: BookHistoryEvent
  bookById: Record<number, Book>
  authorById: Record<number, string>
  memberById: Record<number, Member>
  memberVisibility: MemberVisibility
}

function TimelineNode({ event, bookById, authorById, memberById, memberVisibility }: NodeProps) {
  const [isOpen, setIsOpen] = useState(false)

  if (event.type === 'removed') {
    return (
      <div className="bt-node bt-node--removed">
        <div className="bt-row">
          <span className="bt-label bt-label--muted">Удалена из очереди</span>
        </div>
      </div>
    )
  }

  if (event.type === 'added') {
    const addedBy = event.added_by_member_id != null ? memberById[event.added_by_member_id] : null
    const showMember = memberVisibility === 'visible' ? !!addedBy : event.added_by_member_id !== null

    return (
      <div className="bt-node">
        <div className="bt-row">
          {event.date && <span className="bt-date">{formatDate(event.date)}</span>}
          <span className="bt-label">
            Добавлена в очередь
            {showMember && (
              <>
                {' — '}
                {memberVisibility === 'visible' && addedBy
                  ? <Link to={`/members/${addedBy.id}`} className="member-link">{memberName(addedBy)}</Link>
                  : <span className="member-blur">Участник</span>}
              </>
            )}
          </span>
        </div>
      </div>
    )
  }

  if (event.type === 'award') {
    return (
      <div className={`bt-node bt-node--win${isOpen ? ' bt-node--open' : ''}`}>
        <button className="bt-row bt-row--button" onClick={() => setIsOpen(o => !o)}>
          <span className="bt-label">🏆 Книга года {event.year}</span>
          <span className={`bt-chevron${isOpen ? ' bt-chevron--up' : ''}`}>▾</span>
        </button>
        {isOpen && (
          <div className="bt-body">
            <dl className="bt-award-stats">
              {event.total_voters != null && (
                <>
                  <dt>Количество судей</dt>
                  <dd>{event.total_voters} чел.</dd>
                </>
              )}
              <dt>За книгу проголосовали</dt>
              <dd>
                {event.liked_votes} чел.
                {event.total_voters ? ` (${Math.round((event.liked_votes / event.total_voters) * 100)}%)` : ''}
              </dd>
              {event.round2_votes != null && (
                <>
                  <dt>2-й тур</dt>
                  <dd>{event.round2_votes} чел.</dd>
                </>
              )}
            </dl>
          </div>
        )}
      </div>
    )
  }

  // event.type === 'poll'
  const s1Votes = event.votes
    .filter(v => v.poll_id === event.stage1.id)
    .sort((a, b) => b.votes_count - a.votes_count)
  const s2Votes = event.stage2
    ? event.votes.filter(v => v.poll_id === event.stage2!.id).sort((a, b) => b.votes_count - a.votes_count)
    : []
  const toEntries = (vs: PollVote[]) => pollVotesToEntries(vs, bookById, authorById)

  const winnerId = event.stage2 ? event.stage2.winner_book_id : event.stage1.winner_book_id
  const winner = winnerId != null ? bookById[winnerId] : null

  return (
    <div className={`bt-node${event.is_win ? ' bt-node--win' : ''}${isOpen ? ' bt-node--open' : ''}`}>
      <button className="bt-row bt-row--button" onClick={() => setIsOpen(o => !o)}>
        <span className="bt-date">{formatDate(event.date)}</span>
        <span className="bt-label">
          {event.is_win
            ? 'Победа в голосовании!'
            : winner
              ? `Голосование — не повезло, клуб выбрал книгу «${winner.title}»`
              : 'Голосование без победителя'}
          {event.stage2 && <span className="bt-badge">2 тура</span>}
        </span>
        <span className={`bt-chevron${isOpen ? ' bt-chevron--up' : ''}`}>▾</span>
      </button>
      {isOpen && (
        <div className="bt-body">
          <VoteRounds
            rounds={[
              {
                key: 's1',
                entries: toEntries(s1Votes),
                winnerKey: event.stage2 ? undefined : winnerId ?? undefined,
                totalVoters: event.stage1.total_voters,
              },
              ...(event.stage2 && s2Votes.length > 0
                ? [{
                    key: 's2',
                    entries: toEntries(s2Votes),
                    winnerKey: winnerId ?? undefined,
                    totalVoters: event.stage2.total_voters,
                  }]
                : []),
            ]}
          />
        </div>
      )}
    </div>
  )
}
