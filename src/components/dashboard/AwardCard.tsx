import type { AwardVote, Book } from '@/types'
import VoteBarList, { type VoteEntry } from '@/components/VoteBarList'
import './AwardCard.scss'

interface Props {
  year: number
  votes: AwardVote[]
  books: Book[]
}

const TOP_N = 8

export default function AwardCard({ year, votes, books }: Props) {
  const bookById = Object.fromEntries(books.map(b => [b.id, b]))

  const sorted = [...votes]
    .sort((a, b) => b.liked_votes - a.liked_votes)
    .slice(0, TOP_N)

  const winnerId = votes.find(v => v.is_winner)?.book_id ?? null

  const mainEntries: VoteEntry[] = sorted
    .map(v => ({ key: v.book_id, title: bookById[v.book_id]?.title ?? `#${v.book_id}`, value: v.liked_votes }))

  const telegramNominees = votes
    .filter(v => v.telegram_votes !== null)
    .sort((a, b) => (b.telegram_votes ?? 0) - (a.telegram_votes ?? 0))

  const telegramEntries: VoteEntry[] = telegramNominees
    .map(v => ({ key: v.book_id, title: bookById[v.book_id]?.title ?? `#${v.book_id}`, value: v.telegram_votes! }))

  return (
    <div className="card">
      <div className="header">
        <span className="label">Книга года</span>
        <span className="year">{year}</span>
      </div>

      <p className="subtitle">Результаты опроса · топ {TOP_N}</p>

      <VoteBarList entries={mainEntries} winnerKey={winnerId} />

      {telegramEntries.length > 0 && (
        <>
          <hr className="divider" />
          <p className="telegram-label">Финал</p>
          <VoteBarList entries={telegramEntries} winnerKey={winnerId} />
        </>
      )}
    </div>
  )
}
