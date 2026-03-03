import type { User, Book, Poll, PollVote, AwardVote, PollRunoff } from '@/types'
import { mockUsers } from '@/mocks/mockUsers'
import { mockBooks } from '@/mocks/mockBooks'
import { mockPolls } from '@/mocks/mockPolls'
import { mockPollVotes } from '@/mocks/mockPollVotes'
import { mockAwardVotes } from '@/mocks/mockAwardVotes'
import { mockPollRunoffs } from '@/mocks/mockPollRunoffs'

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

export async function fetchPollRunoffs(): Promise<PollRunoff[]> {
  await delay()
  return mockPollRunoffs
}
