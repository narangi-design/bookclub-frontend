import type { User, Book, Poll, PollVote, AwardVote, Author } from '@/types'
import { mockUsers } from '@/mocks/mockUsers'
import { mockBooks } from '@/mocks/mockBooks'
import { mockAuthors } from '@/mocks/mockAuthors'
import { mockPolls } from '@/mocks/mockPolls'
import { mockPollVotes } from '@/mocks/mockPollVotes'
import { mockAwardVotes } from '@/mocks/mockAwardVotes'

const delay = (ms = 120) => new Promise(r => setTimeout(r, ms))

export async function fetchUsers(): Promise<User[]> {
  await delay()
  return mockUsers
}

export async function fetchBooks(): Promise<Book[]> {
  await delay()
  return mockBooks as Book[]
}

export async function fetchPolls(): Promise<Poll[]> {
  await delay()
  return mockPolls as Poll[]
}

export async function fetchPollVotes(): Promise<PollVote[]> {
  await delay()
  return mockPollVotes
}

export async function fetchAwardVotes(): Promise<AwardVote[]> {
  await delay()
  return mockAwardVotes
}

export async function fetchAuthors(): Promise<Author[]> {
  await delay()
  return mockAuthors
}
