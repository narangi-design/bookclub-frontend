import type { User, Book, Poll, PollVote, AwardVote, Author } from '@/types'

const BASE_URL = 'http://localhost:8000'

async function get<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`)
  return res.json()
}

export function fetchUsers(): Promise<User[]> {
  return get('/api/users')
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
