import {
  topBooksByVotes, memberActivityData,
  booksAddedByMonth, booksAddedByYearStatus, avgDaysToElect,
  pollParticipationTimeline, mostNominatedUnelected, winRateScatterData,
  pollCompetitivenessData, stageDepthDistribution,
  pollGapTimeline, radarTopBooksData,
} from '@/utils'
import { useBooks, usePollVotes, useUsers, usePolls, usePollRunoffs } from '@/hooks'
import {
  diagramColors,
  HBarChart, SimpleLineChart, DonutChart, StackedAreaChart, SimpleBarChart,
  WinRateScatter, CompetitivenessChart, StageDepthFunnel,
  GroupedBarChart, SimpleAreaChart, RadarMultiChart,
} from '@/components/charts'
import './StatsPage.scss'

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
  const { data: users     = [] } = useUsers()
  const { data: polls     = [] } = usePolls()
  const { data: runoffs   = [] } = usePollRunoffs()

  // ── Section: Книги ───────────────────────────────────────────────────────
  const addedByMonth  = booksAddedByMonth(books)
  const byYearStatus  = booksAddedByYearStatus(books)
  const avgDays       = avgDaysToElect(books)
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
  const unelected      = mostNominatedUnelected(books, pollVotes, 12)
  const scatterData    = winRateScatterData(books, pollVotes)
  const competitiveness = pollCompetitivenessData(polls, pollVotes)
  const stageDepth     = stageDepthDistribution(polls, runoffs)
  // ── Section: Участники ───────────────────────────────────────────────────
  const memberActivity = memberActivityData(books, users)

  // ── Section: Разное ──────────────────────────────────────────────────────
  const gaps      = pollGapTimeline(polls)
  const radarData = radarTopBooksData(books, pollVotes, 6)
  const radarKeys = radarData.length > 0 ? Object.keys(radarData[0]).filter(k => k !== 'subject') : []

  return (
    <div className="page">
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
          <p className="big-stat-sub">среднее для прочитанных книг</p>
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

        <ChartCard title="Самые обойдённые (номинаций без победы)">
          <HBarChart
            data={unelected.map(x => ({ name: x.book.title, n: x.nominations }))}
            dataKey="n" color={diagramColors[4]} valueLabel="Номинаций"
          />
        </ChartCard>

        <ChartCard title="Голоса vs Номинации (победители выделены)">
          <WinRateScatter data={scatterData} />
        </ChartCard>

        <ChartCard title="Конкурентность голосований (2-е место / 1-е место)">
          <CompetitivenessChart data={competitiveness} />
        </ChartCard>

        <ChartCard title="Глубина голосований">
          <StageDepthFunnel data={stageDepth} />
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

      <SectionTitle>Разное</SectionTitle>
      <div className="charts-grid">

        <ChartCard title="Интервалы между голосованиями (дни)" wide>
          <SimpleAreaChart data={gaps} xKey="date" yKey="gap" xInterval={9} valueLabel="Дней" />
        </ChartCard>

        <ChartCard title="Профиль топ-6 книг (Radar)">
          <RadarMultiChart data={radarData} keys={radarKeys} />
        </ChartCard>

      </div>
    </div>
  )
}
