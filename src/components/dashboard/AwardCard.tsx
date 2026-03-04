import type { AwardVote, Book } from '@/types'
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

  const maxLiked = sorted[0]?.liked_votes ?? 1
  const totalLiked = votes.reduce((s, v) => s + v.liked_votes, 0)

  const telegramNominees = votes
    .filter(v => v.telegram_votes !== null)
    .sort((a, b) => (b.telegram_votes ?? 0) - (a.telegram_votes ?? 0))
  const maxTelegram = telegramNominees[0]?.telegram_votes ?? 1

  return (
    <div className="card">
      <div className="header">
        <span className="label">Книга года</span>
        <span className="year">{year}</span>
      </div>

      <p className="subtitle">Результаты опроса · топ {TOP_N}</p>

      <div className="list">
        {sorted.map(v => {
          const book = bookById[v.book_id]
          if (!book) return null
          const pct = (v.liked_votes / maxLiked) * 100
          return (
            <div key={v.id} className="row">
              <div className="row-main">
                <span className={`row-title${v.is_winner ? ' winner' : ''}`}>
                  {v.is_winner && <span className="star">★ </span>}
                  {book.title}
                </span>
                <div className="bar-track">
                  <div
                    className="bar"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
              <span className={`count${v.is_winner ? ' winner' : ''}`}>{v.liked_votes} · {Math.round((v.liked_votes / totalLiked) * 100)}%</span>
            </div>
          )
        })}
      </div>

      {telegramNominees.length > 0 && (
        <>
          <hr className="divider" />
          <p className="telegram-label">Финал</p>
          <div className="list">
            {telegramNominees.map(v => {
              const book = bookById[v.book_id]
              if (!book) return null
              const pct = ((v.telegram_votes ?? 0) / maxTelegram) * 100
              const totalVotes = telegramNominees.reduce((s, x) => s + (x.telegram_votes ?? 0), 0)
              const percent = totalVotes > 0
                ? Math.round(((v.telegram_votes ?? 0) / totalVotes) * 100)
                : 0
              return (
                <div key={v.id} className="row">
                  <div className="row-main">
                    <span className={`row-title${v.is_winner ? ' winner' : ''}`}>
                      {v.is_winner ? '✓ ' : '  '}{book.title}
                    </span>
                    <div className="bar-track">
                      <div
                        className="bar"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                  <span className={`count${v.is_winner ? ' winner' : ''}`}>{v.telegram_votes} · {percent}%</span>
                </div>
              )
            })}
          </div>
        </>
      )}
    </div>
  )
}
