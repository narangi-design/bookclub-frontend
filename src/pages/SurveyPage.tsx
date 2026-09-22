import './SurveyPage.scss'
import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import type { Book, SurveyResponse, Tiebreak } from '@/types'
import { useAuth } from '@/context/AuthContext'
import {
  usePageTitle, useAuthors, useAwardEvents,
  useSurveyMeta, useSurveyCandidates, useSurveyResponse, useSubmitSurveyResponse,
  useTiebreaks, useTiebreakVote, useSubmitTiebreakVote,
} from '@/hooks'
import BookMultiSelect from '@/components/survey/BookMultiSelect'
import BookSingleSelect from '@/components/survey/BookSingleSelect'
import RangeSlider from '@/components/survey/RangeSlider'

interface TiebreakBlockProps {
  tiebreak: Tiebreak
  candidates: Book[]
  authorById: Record<number, string>
}

// Only mounts the actual voting UI once the current vote has loaded, so its
// local `selected` state can be initialized straight from that value via
// useState's lazy initializer — no effect needed to sync it in afterwards.
function TiebreakBlock({ tiebreak, candidates, authorById }: TiebreakBlockProps) {
  const { data: vote } = useTiebreakVote(tiebreak.category)
  if (vote === undefined) return null
  return <TiebreakVoteForm tiebreak={tiebreak} candidates={candidates} authorById={authorById} initialBookId={vote.book_id} />
}

function TiebreakVoteForm({ tiebreak, candidates, authorById, initialBookId }: TiebreakBlockProps & { initialBookId: number | null }) {
  const submit = useSubmitTiebreakVote(tiebreak.category)
  const [selected, setSelected] = useState<number | null>(initialBookId)

  const books = candidates.filter(b => tiebreak.candidate_book_ids.includes(b.id))
  const label = tiebreak.category === 'favorite' ? 'Книга года' : 'Антикнига года'
  const deadline = new Date(tiebreak.deadline)

  return (
    <div className="section tiebreak-block">
      <h2 className="section-title">Ничья! Второй тур — «{label}»</h2>
      <p className="tiebreak-deadline">Голосуем до {deadline.toLocaleDateString('ru-RU')}</p>
      <BookSingleSelect
        books={books}
        selectedId={selected}
        onChange={id => { setSelected(id); submit.mutate(id) }}
        authorById={authorById}
      />
      {submit.isSuccess && <p className="tiebreak-saved">Голос сохранён</p>}
    </div>
  )
}

interface SurveyFormProps {
  candidates: Book[]
  authorById: Record<number, string>
  candidateCount: number
  deadline: string
  initial: SurveyResponse
}

function SurveyForm({ candidates, authorById, candidateCount, deadline, initial }: SurveyFormProps) {
  const submitResponse = useSubmitSurveyResponse()
  const [favoriteIds, setFavoriteIds] = useState<number[]>(initial.favorite_book_ids)
  const [leastFavoriteIds, setLeastFavoriteIds] = useState<number[]>(initial.least_favorite_book_ids)
  const [booksReadCount, setBooksReadCount] = useState<number | null>(initial.books_read_count)
  const [openText, setOpenText] = useState(initial.open_text ?? '')

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    submitResponse.mutate({
      favorite_book_ids: favoriteIds,
      least_favorite_book_ids: leastFavoriteIds,
      books_read_count: booksReadCount,
      open_text: openText.trim() || null,
    })
  }

  return (
    <>
      <div className="section">
        <p className="survey-hero-text">Отвечай и меняй ответ сколько угодно раз до {new Date(deadline).toLocaleDateString('ru-RU')}.</p>
      </div>

      <form onSubmit={handleSubmit} className="survey-form">
        <section className="section">
          <h2 className="section-title">Любимые книги года</h2>
          <BookMultiSelect books={candidates} selectedIds={favoriteIds} onChange={setFavoriteIds} authorById={authorById} />
        </section>

        <section className="section">
          <h2 className="section-title">Нелюбимые книги года</h2>
          <BookMultiSelect books={candidates} selectedIds={leastFavoriteIds} onChange={setLeastFavoriteIds} authorById={authorById} />
        </section>

        <section className="section">
          <RangeSlider
            label="Сколько книг вы прочитали в этом году?"
            max={candidateCount}
            value={booksReadCount}
            onChange={setBooksReadCount}
          />
        </section>

        <section className="section">
          <h2 className="section-title">Открытое обращение</h2>
          <textarea
            className="survey-textarea"
            value={openText}
            onChange={e => setOpenText(e.target.value)}
            placeholder="Необязательно — что угодно клубу и модераторам"
            rows={4}
          />
        </section>

        <button type="submit" className="survey-submit" disabled={submitResponse.isPending}>
          {submitResponse.isPending ? 'Сохраняем…' : 'Сохранить ответ'}
        </button>
        {submitResponse.isSuccess && <p className="survey-saved">Ответ сохранён</p>}
        {submitResponse.isError && <p className="survey-error">Не удалось сохранить — попробуй ещё раз</p>}
      </form>
    </>
  )
}

function SurveyReadOnly({ candidates, authorById, response }: { candidates: Book[]; authorById: Record<number, string>; response: SurveyResponse }) {
  const hasAnyResponse = response.favorite_book_ids.length > 0
    || response.least_favorite_book_ids.length > 0
    || response.books_read_count != null
    || !!response.open_text

  if (!hasAnyResponse) {
    return <p>Похоже, ты не успел(а) ответить до дедлайна.</p>
  }

  return (
    <>
      <h3 className="survey-readonly-subtitle">Любимые книги</h3>
      <BookMultiSelect
        books={candidates.filter(b => response.favorite_book_ids.includes(b.id))}
        selectedIds={response.favorite_book_ids}
        onChange={() => {}}
        authorById={authorById}
        disabled
      />
      <h3 className="survey-readonly-subtitle">Нелюбимые книги</h3>
      <BookMultiSelect
        books={candidates.filter(b => response.least_favorite_book_ids.includes(b.id))}
        selectedIds={response.least_favorite_book_ids}
        onChange={() => {}}
        authorById={authorById}
        disabled
      />
      {response.books_read_count != null && <p>Прочитано книг: {response.books_read_count}</p>}
      {response.open_text && <p className="survey-readonly-text">«{response.open_text}»</p>}
    </>
  )
}

export default function SurveyPage() {
  usePageTitle('Книга года')
  const { user } = useAuth()
  const { data: meta } = useSurveyMeta()
  const { data: candidates = [] } = useSurveyCandidates()
  const { data: authors = [] } = useAuthors()
  const { data: response } = useSurveyResponse()
  const { data: tiebreaks = [] } = useTiebreaks()
  const { data: awardEvents = [] } = useAwardEvents()

  const authorById = Object.fromEntries(authors.map(a => [a.id, a.name]))

  if (user && user.auth_method !== 'telegram') {
    return (
      <div className="page survey-page">
        <h1 className="page-title">Книга года</h1>
        <p>Опрос доступен только тем, кто входит через Telegram — перезайди через Telegram, чтобы поучаствовать.</p>
      </div>
    )
  }

  if (!meta) return null

  const unresolvedTiebreaks = tiebreaks.filter(t => !t.resolved)
  const resultsReady = awardEvents.some(e => e.year === meta.year) && unresolvedTiebreaks.length === 0

  return (
    <div className="page survey-page">
      <div className="survey-hero">
        <span className="survey-hero-eyebrow">Ежегодная премия</span>
        <h1 className="page-title">Книга года {meta.year}</h1>
        {meta.is_closed && <p className="survey-hero-text">Приём ответов закрыт.</p>}
      </div>

      {unresolvedTiebreaks.map(tb => (
        <TiebreakBlock key={tb.category} tiebreak={tb} candidates={candidates} authorById={authorById} />
      ))}

      {!meta.is_closed && response !== undefined && (
        <SurveyForm candidates={candidates} authorById={authorById} candidateCount={meta.candidate_count} deadline={meta.deadline} initial={response} />
      )}

      {meta.is_closed && unresolvedTiebreaks.length === 0 && (
        <section className="section survey-readonly">
          <h2 className="section-title">Твой ответ</h2>
          {response !== undefined && <SurveyReadOnly candidates={candidates} authorById={authorById} response={response} />}
        </section>
      )}

      {resultsReady && (
        <p className="survey-results-link">
          <Link to="/survey/results">Смотреть итоги →</Link>
        </p>
      )}
    </div>
  )
}
