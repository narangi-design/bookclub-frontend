import type { Member, Book, Poll, PollVote, AwardVote, AwardEvent, Author, SurveyMeta, SurveyResponse, Tiebreak } from '@/types'

const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8000'
const TOKEN_KEY = 'bookclub_token'

async function get<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`)
  return res.json()
}

async function authGet<T>(path: string): Promise<T> {
  const token = localStorage.getItem(TOKEN_KEY)
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!res.ok) throw new Error(`${res.status}`)
  return res.json()
}

async function authPut<T>(path: string, body: unknown): Promise<T> {
  const token = localStorage.getItem(TOKEN_KEY)
  const res = await fetch(`${BASE_URL}${path}`, {
    method: 'PUT',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  if (!res.ok) throw new Error(`${res.status}`)
  return res.json()
}

export function fetchMembers(): Promise<Member[]> {
  return authGet('/api/members')
}

export function fetchBooks(): Promise<Book[]> {
  return get('/api/books')
}

export function fetchPolls(): Promise<Poll[]> {
  return get('/api/polls')
}

export function fetchPollVotes(): Promise<PollVote[]> {
  return get('/api/poll-votes')
}

export function fetchAwardVotes(): Promise<AwardVote[]> {
  return get('/api/award-votes')
}

export function fetchAwardEvents(): Promise<AwardEvent[]> {
  return get('/api/award-events')
}

export function fetchAuthors(): Promise<Author[]> {
  return get('/api/authors')
}

export function fetchSurveyMeta(): Promise<SurveyMeta> {
  return get('/api/survey/meta')
}

export function fetchSurveyCandidates(): Promise<Book[]> {
  return get('/api/survey/candidates')
}

export function fetchSurveyResponse(): Promise<SurveyResponse> {
  return authGet('/api/survey/response')
}

export function submitSurveyResponse(data: SurveyResponse): Promise<{ ok: true }> {
  return authPut('/api/survey/response', data)
}

export function fetchSurveyOpenTexts(): Promise<string[]> {
  return get('/api/survey/open-texts')
}

export function fetchTiebreaks(): Promise<Tiebreak[]> {
  return get('/api/survey/tiebreaks')
}

export function fetchTiebreakVote(category: Tiebreak['category']): Promise<{ book_id: number | null }> {
  return authGet(`/api/survey/tiebreaks/${category}/vote`)
}

export function submitTiebreakVote(category: Tiebreak['category'], book_id: number): Promise<{ ok: true }> {
  return authPut(`/api/survey/tiebreaks/${category}/vote`, { book_id })
}
