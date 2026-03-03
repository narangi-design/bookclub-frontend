import type { AwardVote, Book } from '@/types'
import styles from './AwardCard.module.css'

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
    <div className={styles.card}>
      <div className={styles.header}>
        <span className={styles.label}>Книга года</span>
        <span className={styles.year}>{year}</span>
      </div>

      <p className={styles.subtitle}>Результаты опроса · топ {TOP_N}</p>

      <div className={styles.list}>
        {sorted.map(v => {
          const book = bookById[v.book_id]
          if (!book) return null
          const pct = (v.liked_votes / maxLiked) * 100
          return (
            <div key={v.id} className={styles.row}>
              <div className={styles.rowMain}>
                <span className={`${styles.rowTitle} ${v.is_winner ? styles.winner : ''}`}>
                  {v.is_winner && <span className={styles.star}>★ </span>}
                  {book.title}
                </span>
                <div className={styles.barTrack}>
                  <div
                    className={`${styles.bar} ${v.is_winner ? styles.barWinner : ''}`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
              <span className={`${styles.count} ${v.is_winner ? styles.winner : ''}`}>{v.liked_votes} · {Math.round((v.liked_votes / totalLiked) * 100)}%</span>
            </div>
          )
        })}
      </div>

      {telegramNominees.length > 0 && (
        <>
          <hr className={styles.divider} />
          <p className={styles.telegramLabel}>Финал</p>
          <div className={styles.list}>
            {telegramNominees.map(v => {
              const book = bookById[v.book_id]
              if (!book) return null
              const pct = ((v.telegram_votes ?? 0) / maxTelegram) * 100
              const totalVotes = telegramNominees.reduce((s, x) => s + (x.telegram_votes ?? 0), 0)
              const percent = totalVotes > 0
                ? Math.round(((v.telegram_votes ?? 0) / totalVotes) * 100)
                : 0
              return (
                <div key={v.id} className={styles.row}>
                  <div className={styles.rowMain}>
                    <span className={`${styles.rowTitle} ${v.is_winner ? styles.winner : ''}`}>
                      {v.is_winner ? '✓ ' : '  '}{book.title}
                    </span>
                    <div className={styles.barTrack}>
                      <div
                        className={`${styles.bar} ${v.is_winner ? styles.barWinner : ''}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                  <span className={`${styles.count} ${v.is_winner ? styles.winner : ''}`}>{v.telegram_votes} · {percent}%</span>
                </div>
              )
            })}
          </div>
        </>
      )}
    </div>
  )
}
