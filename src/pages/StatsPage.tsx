import {
  topBooksByVotes, countryDistribution, booksByUser,
  booksAddedByMonth, booksAddedByYearStatus, avgDaysToElect,
  pollParticipationTimeline, mostNominatedUnelected, winRateScatterData,
  pollCompetitivenessData, stageDepthDistribution,
  sankeyNominationData, pollPredictabilityData, pollGapTimeline,
  treemapBookData, sunburstUserData, radarTopBooksData,
} from '@/utils'
import { useBooks, usePollVotes, useUsers, usePolls, usePollRunoffs } from '@/hooks'
import {
  C,
  HBarChart, SimpleLineChart, DonutChart, StackedAreaChart, SimpleBarChart,
  WinRateScatter, PollPieChart, CompetitivenessChart, StageDepthFunnel,
  NominationSankey, GroupedBarChart, SunburstUserChart, SimpleAreaChart,
  TreemapChart, RadarMultiChart,
} from '@/components/charts'
import styles from './StatsPage.module.css'

function SectionTitle({ children }: { children: string }) {
  return <h2 className={styles.sectionTitle}>{children}</h2>
}

function ChartCard({ title, children, wide }: { title: string; children: React.ReactNode; wide?: boolean }) {
  return (
    <div className={`${styles.card} ${wide ? styles.cardWide : ''}`}>
      <p className={styles.cardLabel}>{title}</p>
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

  const bookById = Object.fromEntries(books.map(b => [b.id, b]))

  // ── Section: Книги ───────────────────────────────────────────────────────
  const addedByMonth  = booksAddedByMonth(books)
  const byYearStatus  = booksAddedByYearStatus(books)
  const avgDays       = avgDaysToElect(books)
  const readByYear    = ['2022', '2023', '2024'].map(yr => ({
    year: yr,
    count: books.filter(b => b.status === 'read' && b.elected_at?.startsWith(yr)).length,
  }))
  const statusCounts  = [
    { name: 'Прочитаны',    value: books.filter(b => b.status === 'read').length,    color: C[0] },
    { name: 'Будем читать', value: books.filter(b => b.status === 'to_read').length, color: C[4] },
    { name: 'Выбыли',       value: books.filter(b => b.status === 'removed').length, color: C[1] },
  ]

  // ── Section: Голосования ─────────────────────────────────────────────────
  const topVoted       = topBooksByVotes(books, pollVotes, 10)
  const participation  = pollParticipationTimeline(polls, pollVotes)
  const unelected      = mostNominatedUnelected(books, pollVotes, 12)
  const scatterData    = winRateScatterData(books, pollVotes)
  const competitiveness = pollCompetitivenessData(polls, pollVotes)
  const stageDepth     = stageDepthDistribution(polls, runoffs)
  const sankey         = sankeyNominationData(books, pollVotes, runoffs)
  const predictability = pollPredictabilityData(polls, pollVotes, bookById)
    .slice(-20)
    .map(d => ({ date: d.date.slice(0, 7), winner: d.winnerVotes, max: d.maxVotes }))

  // ── Section: Участники ───────────────────────────────────────────────────
  const contributors = booksByUser(books, users)
  const sunburst     = sunburstUserData(books, users)

  // ── Section: Разное ──────────────────────────────────────────────────────
  const gaps      = pollGapTimeline(polls)
  const treemap   = treemapBookData(books, pollVotes)
  const radarData = radarTopBooksData(books, pollVotes, 6)
  const radarKeys = radarData.length > 0 ? Object.keys(radarData[0]).filter(k => k !== 'subject') : []
  const countries = countryDistribution(books)

  return (
    <div className={styles.page}>
      <h1 className={styles.pageTitle}>Всякая стата</h1>

      <SectionTitle>Книги</SectionTitle>
      <div className={styles.grid3}>

        <ChartCard title="Добавлено книг по месяцам" wide>
          <SimpleLineChart data={addedByMonth} xKey="month" yKey="count" xInterval={3} name="Книг" />
        </ChartCard>

        <ChartCard title="Статусы книг">
          <DonutChart data={statusCounts} />
        </ChartCard>

        <ChartCard title="Добавленные vs выбывшие по годам">
          <StackedAreaChart data={byYearStatus} xKey="year" series={[
            { key: 'read',    name: 'Прочитаны',    color: C[0] },
            { key: 'to_read', name: 'К прочтению',  color: C[4] },
            { key: 'removed', name: 'Выбыли',        color: C[1] },
          ]} />
        </ChartCard>

        <ChartCard title="Прочитано по годам">
          <SimpleBarChart data={readByYear} xKey="year" dataKey="count" refY={20} refLabel="цель" valueLabel="Книг" />
        </ChartCard>

        <ChartCard title="Среднее время от добавления до выбора">
          <div className={styles.bigStat}>
            <span className={styles.bigStatNumber}>{avgDays}</span>
            <span className={styles.bigStatLabel}>дней</span>
          </div>
          <p className={styles.bigStatSub}>среднее для прочитанных книг</p>
        </ChartCard>

      </div>

      <SectionTitle>Голосования</SectionTitle>
      <div className={styles.grid3}>

        <ChartCard title="Участие в голосованиях (по голосам)" wide>
          <SimpleLineChart
            data={participation} xKey="date" yKey="totalVotes"
            xInterval={9} yWidth={28} name="Голосов"
            tooltipLabelFormatter={l => `Голосование ${String(l)}`}
            tooltipFormatter={(v: number) => [v, 'Голосов']}
          />
        </ChartCard>

        <ChartCard title="Самые популярные книги (все голосования)" wide>
          <HBarChart
            data={topVoted.map(x => ({ name: x.book.title.slice(0, 24), votes: x.totalVotes }))}
            dataKey="votes" yWidth={160} valueLabel="Голосов"
          />
        </ChartCard>

        <ChartCard title="Самые обойдённые (номинаций без победы)">
          <HBarChart
            data={unelected.map(x => ({ name: x.book.title.slice(0, 22), n: x.nominations }))}
            dataKey="n" color={C[4]} barSize={12} valueLabel="Номинаций"
          />
        </ChartCard>

        <ChartCard title="Голоса vs Номинации (победители выделены)">
          <WinRateScatter data={scatterData} />
        </ChartCard>

        <ChartCard title="Голосование в деталях">
          <PollPieChart polls={polls} votes={pollVotes} bookById={bookById} />
        </ChartCard>

        <ChartCard title="Конкурентность голосований (2-е место / 1-е место)">
          <CompetitivenessChart data={competitiveness} />
        </ChartCard>

        <ChartCard title="Глубина голосований">
          <StageDepthFunnel data={stageDepth} />
        </ChartCard>

        <ChartCard title="Путь книги к победе (Sankey)" wide>
          <NominationSankey data={sankey} />
        </ChartCard>

        <ChartCard title="Предсказуемость результата (победитель vs лидер)" wide>
          <GroupedBarChart
            data={predictability} xKey="date"
            bars={[
              { key: 'max',    name: 'Макс. голосов',       color: `${C[4]}99` },
              { key: 'winner', name: 'Голосов победителя',  color: C[0] },
            ]}
            xInterval={3}
          />
        </ChartCard>

      </div>

      <SectionTitle>Участники</SectionTitle>
      <div className={styles.grid2}>

        <ChartCard title="Книг добавлено участником">
          <HBarChart
            data={contributors.map(x => ({ name: x.username, count: x.count }))}
            dataKey="count" height={300} yWidth={110} valueLabel="Книг"
          />
        </ChartCard>

        <ChartCard title="Книги участников (Sunburst)">
          <SunburstUserChart data={sunburst} height={300} />
        </ChartCard>

      </div>

      <SectionTitle>Разное</SectionTitle>
      <div className={styles.grid3}>

        <ChartCard title="Интервалы между голосованиями (дни)" wide>
          <SimpleAreaChart data={gaps} xKey="date" yKey="gap" xInterval={9} valueLabel="Дней" />
        </ChartCard>

        <ChartCard title="Популярность книг по размеру (Treemap)" wide>
          <TreemapChart data={treemap} />
        </ChartCard>

        <ChartCard title="Страны книг">
          <HBarChart
            data={countries.slice(0, 12).map(c => ({ name: c.country, count: c.count }))}
            dataKey="count" color={C[5]} height={280} barSize={13} yWidth={80} valueLabel="Книг"
          />
        </ChartCard>

        <ChartCard title="Профиль топ-6 книг (Radar)">
          <RadarMultiChart data={radarData} keys={radarKeys} />
        </ChartCard>

      </div>
    </div>
  )
}
