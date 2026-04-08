import './StatsPage.scss'
import {
  topBooksByVotes, memberActivityData,
  booksAddedByMonth, avgDaysToElect, medianDaysToElect,
  pollParticipationTimeline,
} from '@/utils'
import { useBooks, usePollVotes, useMembers, usePolls } from '@/hooks'
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
  const { data: books     = [] } = useBooks()
  const { data: pollVotes = [] } = usePollVotes()
  const { data: members   = [] } = useMembers()
  const { data: polls     = [] } = usePolls()


  // ── Section: Книги ───────────────────────────────────────────────────────
  const addedByMonth  = booksAddedByMonth(books)
  const avgDays       = avgDaysToElect(books)
  const medianDays    = medianDaysToElect(books)
  const readByYear    = ['2022', '2023', '2024'].map(yr => ({
    year: yr,
    count: books.filter(b => b.status === 'read' && b.elected_at?.startsWith(yr)).length,
  }))
  const statusCounts  = [
    { name: 'Прочитаны',    value: books.filter(b => b.status === 'read').length,    color: diagramColors[0] },
    { name: 'Будем читать', value: books.filter(b => b.status === 'to_read').length, color: diagramColors[4] },
    { name: 'Выбыли',       value: books.filter(b => b.status === 'removed').length, color: diagramColors[1] },
  ]

  // ── Section: Голосования ─────────────────────────────────────────────────
  const topVoted       = topBooksByVotes(books, pollVotes, 10)
  const participation  = pollParticipationTimeline(polls)

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

      </div>

      <SectionTitle>Участники</SectionTitle>
      <div className="pairs-grid">

        <ChartCard title="Активность участников (предложено vs выбрано)" wide>
          <GroupedBarChart
            data={memberActivity.slice(0, 10).map(d => ({ ...d, other: d.nominated - d.elected }))}
            xKey="name"
            bars={[
              { key: 'elected', name: 'Выбрано',    color: diagramColors[0] },
              { key: 'other',   name: 'Не выбрано', color: diagramColors[4] },
            ]}
            height={300} stacked
          />
        </ChartCard>

      </div>

    </div>
  )
}
