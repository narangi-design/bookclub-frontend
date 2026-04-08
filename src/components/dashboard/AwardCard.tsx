import './AwardCard.scss'
import type { AwardVote, Book } from '@/types'
import VoteBarList, { type VoteEntry } from '@/components/layout/VoteBarList'
import BookCard from '@/components/layout/BookCard'
import { useMemberVisibility } from '@/hooks'

interface Props {
  year: number
  votes: AwardVote[]
  books: Book[]
  authorById?: Record<number, string>
  memberById?: Record<number, string>
}

const TOP_N = 10
const MEDALS = ['🥇', '🥈', '🥉']

export default function AwardCard({ year, votes, books, authorById, memberById: memberById }: Props) {
  const memberVisibility = useMemberVisibility()
  const bookById = Object.fromEntries(books.map(b => [b.id, b]))

  const sorted = [...votes]
    .sort((a, b) => b.liked_votes - a.liked_votes)
    .slice(0, TOP_N)

  const winnerId = votes.find(v => v.is_winner)?.book_id ?? null

  const mainEntries: VoteEntry[] = sorted
    .map(v => ({ key: v.book_id, title: bookById[v.book_id]?.title ?? `#${v.book_id}`, value: v.liked_votes }))

  const round2Nominees = votes
    .filter(v => v.round2_votes !== null)
    .sort((a, b) => (b.round2_votes ?? 0) - (a.round2_votes ?? 0))

  const round2Entries: VoteEntry[] = round2Nominees
    .map(v => ({ key: v.book_id, title: bookById[v.book_id]?.title ?? `#${v.book_id}`, value: v.round2_votes! }))

  const winner = votes.find(v => v.is_winner)
  const finalVotes = round2Nominees.length > 0 ? round2Nominees : sorted
  const runners = finalVotes.filter(v => !v.is_winner)
  const podiumSlots = [
    { rank: 1, vote: winner },
    { rank: 2, vote: runners[0] },
    { rank: 3, vote: runners[1] },
  ]

  return (
    <div className="card">
      <div className="header">
        <span className="label">Книга года</span>
        <span className="year">{year}</span>
      </div>

      {(winner || runners.length > 0) && (
        <div className="podium">
          {podiumSlots.map(({ rank, vote }) => {
            if (!vote) return null
            const book = bookById[vote.book_id]
            if (!book) return null
            return (
              <div key={rank} className={`podium-slot podium-slot--${rank}`}>
                <BookCard
                  book={book}
                  showAuthor={true}
                  authorName={book.author_id != null ? authorById?.[book.author_id] : undefined}
                  showMember={memberVisibility}
                  memberName={book.added_by_member_id != null ? memberById?.[book.added_by_member_id] : undefined}
                  titleBadge={<span className="podium-medal">{MEDALS[rank - 1]}</span>}
                  showStatus={false}
                />
              </div>
            )
          })}
        </div>
      )}

      <p className="label">Итоги</p>

      {round2Entries.length > 0 && (
        <>
          <VoteBarList entries={round2Entries} winnerKey={winnerId} />
          <hr className="divider" />
          <p className="subtitle">Первые результаты · топ {TOP_N}</p>
        </>
      )}
      <VoteBarList entries={mainEntries} winnerKey={round2Entries.length === 0 ? winnerId : null} />
    </div>
  )
}
