import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { useBooks, usePolls, useUsers, useAwardVotes, usePollVotes, usePollRunoffs } from '@/hooks'
import AwardCard from '@/components/dashboard/AwardCard'
import CurrentBook from '@/components/dashboard/CurrentBook'
import styles from './DashboardPage.module.css'

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
  const currentPoll    = polls.find(p => p.id === currentBook?.elected_poll_id)
  const currentAddedBy = users.find(u => u.id === currentBook?.added_by_user_id)
  const currentRunoff  = pollRunoffs.find(r => r.poll_id === currentBook?.elected_poll_id)

  const votes2023 = awardVotes.filter(v => v.year === 2023)
  const votes2024 = awardVotes.filter(v => v.year === 2024)

  // Books read per year for bar chart
  const byYear = ['2022', '2023', '2024'].map(yr => ({
    year: yr,
    count: readBooks.filter(b => b.elected_at?.startsWith(yr)).length,
  }))

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

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Премии книжного клуба</h2>
        <div className={styles.awardsGrid}>
          <AwardCard year={2023} votes={votes2023} books={books} />
          <AwardCard year={2024} votes={votes2024} books={books} />
        </div>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Книг прочитано</h2>
        <div className={styles.chartCard}>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={byYear} barSize={48}>
              <XAxis
                dataKey="year"
                axisLine={false}
                tickLine={false}
                tick={{ fill: 'var(--color-text-muted)', fontSize: 13 }}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: 'var(--color-text-muted)', fontSize: 12 }}
                width={28}
              />
              <Tooltip
                cursor={{ fill: 'var(--color-border)' }}
                contentStyle={{
                  background: 'var(--color-surface)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 8,
                  color: 'var(--color-text)',
                  fontSize: 13,
                }}
                formatter={(v: number | undefined) => [v ?? 0, 'books read']}
              />
              <Bar dataKey="count" radius={[4, 4, 0, 0]} fill="var(--color-accent)" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>
    </div>
  )
}
