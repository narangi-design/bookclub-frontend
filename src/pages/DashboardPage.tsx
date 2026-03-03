import { useState } from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { useBooks, usePolls, useUsers, useAwardVotes, usePollVotes, usePollRunoffs } from '@/hooks'
import AwardCard from '@/components/dashboard/AwardCard'
import CurrentBook from '@/components/dashboard/CurrentBook'
import styles from './DashboardPage.module.css'

const COVER_FORMATS = ['jpg', 'jpeg', 'png', 'webp']

function SmallCover({ bookId, title }: { bookId: number; title: string }) {
  const [attempt, setAttempt] = useState(0)
  if (attempt >= COVER_FORMATS.length) {
    return <div className={styles.recentCoverPlaceholder}>{title.slice(0, 2)}</div>
  }
  return (
    <img
      key={attempt}
      src={`/covers/${bookId}.${COVER_FORMATS[attempt]}`}
      alt={title}
      className={styles.recentCover}
      onError={() => setAttempt(a => a + 1)}
    />
  )
}

function formatDate(iso: string) {
  return new Intl.DateTimeFormat('ru-RU', {
    day: 'numeric', month: 'short', year: 'numeric',
  }).format(new Date(iso))
}

interface StatCardProps {
  value: number
  label: string
}
function StatCard({ value, label }: StatCardProps) {
  return (
    <div className={styles.statCard}>
      <div className={styles.statValue}>{value}</div>
      <div className={styles.statLabel}>{label}</div>
    </div>
  )
}

export default function DashboardPage() {
  const { data: books      = [] } = useBooks()
  const { data: polls      = [] } = usePolls()
  const { data: users      = [] } = useUsers()
  const { data: awardVotes = [] } = useAwardVotes()
  const { data: pollVotes   = [] } = usePollVotes()
  const { data: pollRunoffs = [] } = usePollRunoffs()

  const readBooks   = books.filter(b => b.status === 'read')
  const toReadBooks = books.filter(b => b.status === 'to_read')

  // Current book = last elected (highest elected_poll_id)
  const currentBook    = readBooks
    .filter(b => b.elected_poll_id !== null)
    .sort((a, b) => (b.elected_poll_id ?? 0) - (a.elected_poll_id ?? 0))[0]
  const electedPoll    = polls.find(p => p.id === currentBook?.elected_poll_id)
  // If elected via runoff (stage 2), resolve to parent stage-1 poll for stage1Votes
  const currentPoll    = electedPoll?.stage === 2
    ? polls.find(p => p.id === electedPoll.parent_poll_id) ?? electedPoll
    : electedPoll
  const currentAddedBy = users.find(u => u.id === currentBook?.added_by_user_id)
  const currentRunoff  = electedPoll?.stage === 2
    ? pollRunoffs.find(r => r.poll_id === electedPoll.id)
    : undefined

  // Last 5 read books excluding the current one
  const recentBooks = readBooks
    .filter(b => b.elected_at !== null && b.id !== currentBook?.id)
    .sort((a, b) => (b.elected_at ?? '').localeCompare(a.elected_at ?? ''))
    .slice(0, 5)

  const votes2023 = awardVotes.filter(v => v.year === 2023)
  const votes2024 = awardVotes.filter(v => v.year === 2024)

  return (
    <div className={styles.page}>
      <h1 className={styles.pageTitle}>Привет, мы книжный клуб!</h1>

      <div className={styles.statsRow}>
        <StatCard value={books.length}       label="Книг в списке"      />
        <StatCard value={readBooks.length}   label="Прочитано"          />
        <StatCard value={toReadBooks.length} label="Предстоит прочитать"/>
        <StatCard value={users.length}       label="Активных участников"/>
      </div>

      {currentBook && (
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Сейчас читаем</h2>
          <CurrentBook
            book={currentBook}
            addedByUser={currentAddedBy}
            poll={currentPoll}
            pollVotes={pollVotes}
            runoff={currentRunoff}
            allBooks={books}
          />
        </section>
      )}

      {recentBooks.length > 0 && (
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Последние прочитанные</h2>
          <div className={styles.recentList}>
            {recentBooks.map(book => {
              const addedBy = users.find(u => u.id === book.added_by_user_id)
              return (
                <div key={book.id} className={styles.recentItem}>
                  <SmallCover bookId={book.id} title={book.title} />
                  <div className={styles.recentInfo}>
                    <div className={styles.recentTitle}>{book.title}</div>
                    {(book.author || book.country) && (
                      <div className={styles.recentMeta}>
                        {[book.author, book.country].filter(Boolean).join(' · ')}
                      </div>
                    )}
                    <div className={styles.recentFooter}>
                      {book.elected_at && <span>{formatDate(book.elected_at)}</span>}
                      {addedBy && (
                        <>
                          <span className={styles.recentDot}>·</span>
                          <span>от {addedBy.username}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </section>
      )}

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Премии книжного клуба</h2>
        <div className={styles.awardsGrid}>
          <AwardCard year={2023} votes={votes2023} books={books} />
          <AwardCard year={2024} votes={votes2024} books={books} />
        </div>
      </section>
    </div>
  )
}
