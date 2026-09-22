import './AntiAwardSection.scss'
import type { AwardVote, Book } from '@/types'
import VoteRounds, { type VoteRound } from '@/components/layout/VoteRounds'
import { type VoteEntry } from '@/components/layout/VoteBarList'

interface Props {
  votes: AwardVote[]
  books: Book[]
  authorById?: Record<number, string>
  totalVoters?: number | null
}

const TOP_N = 10

export default function AntiAwardSection({ votes, books, authorById, totalVoters }: Props) {
  const bookById = Object.fromEntries(books.map(b => [b.id, b]))

  const toTitle = (bookId: number) => {
    const book = bookById[bookId]
    const author = book?.author_id != null ? authorById?.[book.author_id] : null
    return book ? `«${book.title}»${author ? `, ${author}` : ''}` : `#${bookId}`
  }

  const disliked = votes.filter(v => v.disliked_votes !== null)
  const sorted = [...disliked].sort((a, b) => (b.disliked_votes ?? 0) - (a.disliked_votes ?? 0)).slice(0, TOP_N)
  const mainEntries: VoteEntry[] = sorted.map(v => ({
    key: v.book_id, title: toTitle(v.book_id), value: v.disliked_votes ?? 0, href: `/books/${v.book_id}`,
  }))

  const round2 = votes
    .filter(v => v.anti_round2_votes !== null)
    .sort((a, b) => (b.anti_round2_votes ?? 0) - (a.anti_round2_votes ?? 0))
  const round2Entries: VoteEntry[] = round2.map(v => ({
    key: v.book_id, title: toTitle(v.book_id), value: v.anti_round2_votes ?? 0, href: `/books/${v.book_id}`,
  }))

  if (mainEntries.length === 0) return null

  // The anti-winner is whichever book leads the decisive round (round 2 if a
  // tiebreak happened, otherwise round 1) — computed live, not stored, unlike
  // the "Книга года" is_winner flag.
  const finalPool = round2.length > 0 ? round2 : sorted
  const antiWinnerId = finalPool[0]?.book_id ?? null

  const rounds: VoteRound[] = [
    { key: 'main', entries: mainEntries, winnerKey: round2Entries.length === 0 ? antiWinnerId : null, totalVoters },
    ...(round2Entries.length > 0
      ? [{ key: 'round2', entries: round2Entries, winnerKey: antiWinnerId, totalVoters }]
      : []),
  ]

  return (
    <div className="card anti-award-card">
      <div className="anti-award-header">
        <span className="anti-award-label">Антикнига года</span>
      </div>
      <VoteRounds rounds={rounds} />
    </div>
  )
}
