import type { Member, Book, Poll, PollVote, AwardVote, Author } from '@/types'

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

export function fetchAuthors(): Promise<Author[]> {
  return get('/api/authors')
}
