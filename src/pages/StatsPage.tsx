import './StatsPage.scss'
import { useState } from 'react'
import {
  topBooksByVotes, memberActivityData,
  booksAddedByMonth, avgDaysToElect, medianDaysToElect,
  pollParticipationTimeline, topRunnerUps, fastestAndSlowestWins,
} from '@/utils'
import { useBooks, usePollVotes, useMembers, usePolls, useAuthors } from '@/hooks'
import {
  diagramColors,
  HBarChart, SimpleLineChart, DonutChart,
  SimpleBarChart, GroupedBarChart,
} from '@/components/charts'

function SectionTitle({ children }: { children: string }) {
  return <h2 className="section-title">{children}</h2>
}

function ChartCard({ title, children, wide }: { title: string; children: React.ReactNode; wide?: boolean }) {
  return (
    <div className={`card${wide ? ' card--wide' : ''}`}>
      <p className="card-label">{title}</p>
      {children}
    </div>
  )
}

export default function StatsPage() {
  const [runnerUpFilter, setRunnerUpFilter] = useState<'all' | 'to_read'>('all')

  const { data: books = [] } = useBooks()
  const { data: pollVotes = [] } = usePollVotes()
  const { data: members = [] } = useMembers()
  const { data: polls = [] } = usePolls()
  const { data: authors = [] } = useAuthors()


  // ── Section: Книги ───────────────────────────────────────────────────────
  const addedByMonth = booksAddedByMonth(books)
  const avgDays = avgDaysToElect(books)
  const medianDays = medianDaysToElect(books)
  const readByYear = ['2022', '2023', '2024'].map(yr => ({
    year: yr,
    count: books.filter(b => b.status === 'read' && b.elected_at?.startsWith(yr)).length,
  }))
  const statusCounts = [
    { name: 'Прочитаны', value: books.filter(b => b.status === 'read').length, color: diagramColors[0] },
    { name: 'Будем читать', value: books.filter(b => b.status === 'to_read').length, color: diagramColors[4] },
    { name: 'Выбыли', value: books.filter(b => b.status === 'removed').length, color: diagramColors[1] },
  ]

  // ── Section: Голосования ─────────────────────────────────────────────────
  const topVoted = topBooksByVotes(books, pollVotes, 10)
  const participation = pollParticipationTimeline(polls)
  const authorById = Object.fromEntries(authors.map(a => [a.id, a.name]))
  const runnerUps = topRunnerUps(books, polls, pollVotes, 10, runnerUpFilter === 'to_read')
  const { fastest, slowest } = fastestAndSlowestWins(books, 10)

  // ── Section: Участники ───────────────────────────────────────────────────
  const memberActivity = memberActivityData(books, members)

  return (
    <div className="page stats-page">
      <h1 className="page-title">Всякая стата</h1>

      <SectionTitle>Книги</SectionTitle>
      <div className="charts-grid">

        <ChartCard title="Добавлено книг по месяцам" wide>
          <SimpleLineChart data={addedByMonth} xKey="month" yKey="count" xInterval={3} name="Книг" />
        </ChartCard>

        <ChartCard title="Статусы книг">
          <DonutChart data={statusCounts} />
        </ChartCard>

        <ChartCard title="Прочитано по годам">
          <SimpleBarChart data={readByYear} xKey="year" dataKey="count" refY={20} refLabel="цель" valueLabel="Книг" />
        </ChartCard>

        <ChartCard title="Среднее время от добавления до выбора">
          <div className="big-stat">
            <span className="big-stat-number">{avgDays}</span>
            <span className="big-stat-label">дней</span>
          </div>
        </ChartCard>

        <ChartCard title="Медианное время от добавления до выбора">
          <div className="big-stat">
            <span className="big-stat-number">{medianDays}</span>
            <span className="big-stat-label">дней</span>
          </div>
        </ChartCard>

      </div>

      <SectionTitle>Голосования</SectionTitle>
      <div className="charts-grid">

        <ChartCard title="Участие в голосованиях (по людям)" wide>
          <SimpleLineChart
            data={participation} xKey="date" yKey="totalVoters"
            xInterval={9} yWidth={28} name="Человек"
            tooltipLabelFormatter={l => `Голосование ${String(l)}`}
            tooltipFormatter={(v: number) => [v, 'Человек']}
          />
        </ChartCard>

        <ChartCard title="Самые популярные книги (все голосования)" wide>
          <HBarChart
            data={topVoted.map(x => ({ name: x.book.title, votes: x.totalVotes }))}
            dataKey="votes" valueLabel="Голосов"
          />
        </ChartCard>

        <ChartCard title="Были выбраны быстрее всех">
          {fastest.map(({ book, days }) => (
            <div key={book.id} className="speed-row">
              <span className="speed-title">{book.title}</span>
              <span className="speed-days">{days} дн.</span>
            </div>
          ))}
        </ChartCard>

        <ChartCard title="Дольше всех ждали выбора">
          {slowest.map(({ book, days }) => (
            <div key={book.id} className="speed-row">
              <span className="speed-title">{book.title}</span>
              <span className="speed-days">{days} дн.</span>
            </div>
          ))}
        </ChartCard>

        <ChartCard title="Вторые места" wide>
          <div className="filter-row" style={{ marginBottom: 'var(--sp-3)' }}>
            <button
              className={`filter-btn${runnerUpFilter === 'all' ? ' filter-btn--active' : ''}`}
              onClick={() => setRunnerUpFilter('all')}
            >Все книги</button>
            <button
              className={`filter-btn${runnerUpFilter === 'to_read' ? ' filter-btn--active' : ''}`}
              onClick={() => setRunnerUpFilter('to_read')}
            >Только в очереди</button>
          </div>
          <HBarChart
            data={runnerUps.map(x => ({
              name: `${x.book.title}${x.book.author_id != null ? `, ${authorById[x.book.author_id] ?? ''}` : ''}`,
              votes: x.count,
            }))}
            dataKey="votes" valueLabel="Раз"
          />
        </ChartCard>

      </div>

      <SectionTitle>Участники</SectionTitle>
      <div className="pairs-grid">

        <ChartCard title="Активность участников (предложено vs выбрано)" wide>
          <GroupedBarChart
            data={memberActivity.slice(0, 10).map(d => ({ ...d, other: d.nominated - d.elected }))}
            xKey="name"
            bars={[
              { key: 'elected', name: 'Выбрано', color: diagramColors[0] },
              { key: 'other', name: 'Не выбрано', color: diagramColors[4] },
            ]}
            height={300} stacked
          />
        </ChartCard>

      </div>

    </div>
  )
}
