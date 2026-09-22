import './SurveyResultsPage.scss'
import { usePageTitle, useSurveyMeta, useAuthors, useMembers, useBooks, useAwardVotes, useAwardEvents, useTiebreaks, useSurveyOpenTexts } from '@/hooks'
import { memberName } from '@/utils'
import AwardCard from '@/components/dashboard/AwardCard'
import AntiAwardSection from '@/components/survey/AntiAwardSection'
import OpenTextCloud from '@/components/survey/OpenTextCloud'
import StatNumberCard from '@/components/layout/StatNumberCard'

export default function SurveyResultsPage() {
  usePageTitle('Итоги премии')
  const { data: meta } = useSurveyMeta()
  const { data: books = [] } = useBooks()
  const { data: authors = [] } = useAuthors()
  const { data: members = [] } = useMembers()
  const { data: awardVotes = [] } = useAwardVotes()
  const { data: awardEvents = [] } = useAwardEvents()
  const { data: tiebreaks = [] } = useTiebreaks()
  const { data: openTexts = [] } = useSurveyOpenTexts()

  if (!meta) return null

  const year = meta.year
  const authorById = Object.fromEntries(authors.map(a => [a.id, a.name]))
  const memberById = Object.fromEntries(members.map(m => [m.id, memberName(m)]))
  const yearEvent = awardEvents.find(e => e.year === year)
  const yearVotes = awardVotes.filter(v => v.year === year)
  const unresolvedTiebreaks = tiebreaks.filter(t => !t.resolved)

  // No award_events row yet means close_survey.py hasn't run — the results
  // page should look like it doesn't exist yet, not like a broken empty page.
  if (!yearEvent) {
    return (
      <div className="page survey-results-page">
        <div className="survey-results-placeholder">
          <span className="survey-hero-eyebrow">Ежегодная премия</span>
          <h1 className="page-title">Книга года {year}</h1>
          <p>Итоги ещё не подведены, загляни попозже ✨</p>
        </div>
      </div>
    )
  }

  const favoriteTiebreak = unresolvedTiebreaks.find(t => t.category === 'favorite')
  const leastFavoriteTiebreak = unresolvedTiebreaks.find(t => t.category === 'least_favorite')

  return (
    <div className="page survey-results-page">
      <div className="survey-hero">
        <span className="survey-hero-eyebrow">Ежегодная премия</span>
        <h1 className="page-title">Книга года {year}</h1>
      </div>

      <div className="stats-row">
        <StatNumberCard value={meta.candidate_count} label="Книг прочитано за год" />
        <StatNumberCard value={yearEvent.total_voters ?? 0} label="Проголосовало" />
      </div>

      {favoriteTiebreak ? (
        <p className="survey-results-tiebreak-banner">
          Идёт второй тур за «Книгу года», результаты уточняются до {new Date(favoriteTiebreak.deadline).toLocaleDateString('ru-RU')}
        </p>
      ) : (
        <AwardCard year={year} votes={yearVotes} books={books} authorById={authorById} memberById={memberById} totalVoters={yearEvent.total_voters} />
      )}

      {leastFavoriteTiebreak ? (
        <p className="survey-results-tiebreak-banner">
          Идёт второй тур за «Антикнигу года», результаты уточняются до {new Date(leastFavoriteTiebreak.deadline).toLocaleDateString('ru-RU')}
        </p>
      ) : (
        <AntiAwardSection votes={yearVotes} books={books} authorById={authorById} totalVoters={yearEvent.total_voters} />
      )}

      <section className="section">
        <h2 className="section-title">Открытые обращения</h2>
        <OpenTextCloud texts={openTexts} />
      </section>
    </div>
  )
}
