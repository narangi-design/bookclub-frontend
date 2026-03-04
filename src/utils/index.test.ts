import { describe, it, expect } from 'vitest'
import {
  groupBy,
  year,
  totalVotesForPoll,
  pollAppearances,
  avgVotesPerPoll,
  avgDaysToElect,
  countryDistribution,
  booksAddedByMonth,
  booksAddedByYearStatus,
  pollGapTimeline,
  pollCompetitivenessData,
  stageDepthDistribution,
  mostNominatedUnelected,
  topBooksByVotes,
  booksByUser,
  pollPredictabilityData,
} from './index'
import type { Book, Poll, PollVote, PollRunoff } from '@/types'

// ─── Fixtures ────────────────────────────────────────────────────────────────

function makeBook(overrides: Partial<Book> & { id: number; title: string }): Book {
  return {
    author_id: null,
    country: null,
    added_by_user_id: null,
    added_at: null,
    status: 'to_read',
    elected_poll_id: null,
    elected_at: null,
    ...overrides,
  }
}

function makePoll(overrides: Partial<Poll> & { id: number; date: string }): Poll {
  return {
    parent_poll_id: null,
    stage: 1,
    winner_book_id: null,
    total_voters: null,
    ...overrides,
  }
}

function makeVote(id: number, poll_id: number, book_id: number, votes_count: number): PollVote {
  return { id, poll_id, book_id, votes_count }
}

// ─── groupBy ─────────────────────────────────────────────────────────────────

describe('groupBy', () => {
  it('groups items by the key function', () => {
    const result = groupBy(['apple', 'apricot', 'banana'], s => s[0])
    expect(result['a']).toEqual(['apple', 'apricot'])
    expect(result['b']).toEqual(['banana'])
  })

  it('returns empty object for empty array', () => {
    expect(groupBy([], (s: string) => s)).toEqual({})
  })
})

// ─── year ────────────────────────────────────────────────────────────────────

describe('year', () => {
  it('extracts the 4-digit year from an ISO date', () => {
    expect(year('2023-07-15')).toBe('2023')
  })
})

// ─── totalVotesForPoll ───────────────────────────────────────────────────────

describe('totalVotesForPoll', () => {
  const votes = [
    makeVote(1, 10, 1, 5),
    makeVote(2, 10, 2, 3),
    makeVote(3, 20, 1, 8),
  ]

  it('sums votes for the given poll', () => {
    expect(totalVotesForPoll(10, votes)).toBe(8)
  })

  it('returns 0 for unknown poll', () => {
    expect(totalVotesForPoll(99, votes)).toBe(0)
  })
})

// ─── pollAppearances ─────────────────────────────────────────────────────────

describe('pollAppearances', () => {
  const votes = [
    makeVote(1, 10, 1, 5),
    makeVote(2, 11, 1, 3),
    makeVote(3, 10, 2, 8),
  ]

  it('counts distinct polls a book appeared in', () => {
    expect(pollAppearances(1, votes)).toBe(2)
    expect(pollAppearances(2, votes)).toBe(1)
  })

  it('returns 0 for a book with no votes', () => {
    expect(pollAppearances(99, votes)).toBe(0)
  })
})

// ─── avgVotesPerPoll ─────────────────────────────────────────────────────────

describe('avgVotesPerPoll', () => {
  const votes = [
    makeVote(1, 10, 1, 4),
    makeVote(2, 11, 1, 6),
  ]

  it('returns average votes across all poll appearances', () => {
    expect(avgVotesPerPoll(1, votes)).toBe(5)
  })

  it('returns 0 when book has no votes', () => {
    expect(avgVotesPerPoll(99, votes)).toBe(0)
  })
})

// ─── avgDaysToElect ──────────────────────────────────────────────────────────

describe('avgDaysToElect', () => {
  it('computes rounded average days from added_at to elected_at', () => {
    const books = [
      makeBook({ id: 1, title: 'A', status: 'read', added_at: '2023-01-01', elected_at: '2023-01-11' }), // 10 days
      makeBook({ id: 2, title: 'B', status: 'read', added_at: '2023-01-01', elected_at: '2023-01-21' }), // 20 days
    ]
    expect(avgDaysToElect(books)).toBe(15)
  })

  it('ignores non-read books', () => {
    const books = [
      makeBook({ id: 1, title: 'A', status: 'to_read', added_at: '2023-01-01', elected_at: '2023-02-01' }),
    ]
    expect(avgDaysToElect(books)).toBe(0)
  })

  it('returns 0 for empty list', () => {
    expect(avgDaysToElect([])).toBe(0)
  })
})

// ─── countryDistribution ─────────────────────────────────────────────────────

describe('countryDistribution', () => {
  const books = [
    makeBook({ id: 1, title: 'A', country: 'США' }),
    makeBook({ id: 2, title: 'B', country: 'США' }),
    makeBook({ id: 3, title: 'C', country: 'Россия' }),
    makeBook({ id: 4, title: 'D', country: null }),
  ]

  it('returns sorted country counts, excluding null', () => {
    const result = countryDistribution(books)
    expect(result[0]).toEqual({ country: 'США', count: 2 })
    expect(result[1]).toEqual({ country: 'Россия', count: 1 })
    expect(result).toHaveLength(2)
  })
})

// ─── booksAddedByMonth ───────────────────────────────────────────────────────

describe('booksAddedByMonth', () => {
  const books = [
    makeBook({ id: 1, title: 'A', added_at: '2023-03-10' }),
    makeBook({ id: 2, title: 'B', added_at: '2023-03-25' }),
    makeBook({ id: 3, title: 'C', added_at: '2023-05-01' }),
    makeBook({ id: 4, title: 'D', added_at: null }),
  ]

  it('groups by YYYY-MM and sorts chronologically', () => {
    const result = booksAddedByMonth(books)
    expect(result).toEqual([
      { month: '2023-03', count: 2 },
      { month: '2023-05', count: 1 },
    ])
  })
})

// ─── booksAddedByYearStatus ──────────────────────────────────────────────────

describe('booksAddedByYearStatus', () => {
  const books = [
    makeBook({ id: 1, title: 'A', added_at: '2022-01-01', status: 'read' }),
    makeBook({ id: 2, title: 'B', added_at: '2022-06-01', status: 'to_read' }),
    makeBook({ id: 3, title: 'C', added_at: '2023-01-01', status: 'removed' }),
  ]

  it('groups by year and counts each status', () => {
    const result = booksAddedByYearStatus(books)
    expect(result).toEqual([
      { year: '2022', read: 1, to_read: 1, removed: 0 },
      { year: '2023', read: 0, to_read: 0, removed: 1 },
    ])
  })
})

// ─── pollGapTimeline ─────────────────────────────────────────────────────────

describe('pollGapTimeline', () => {
  const polls = [
    makePoll({ id: 1, date: '2023-01-01' }),
    makePoll({ id: 2, date: '2023-01-15' }),  // 14 days
    makePoll({ id: 3, date: '2023-02-04' }),  // 20 days
  ]

  it('returns gaps in days between consecutive polls', () => {
    const result = pollGapTimeline(polls)
    expect(result).toEqual([
      { date: '2023-01-15', gap: 14 },
      { date: '2023-02-04', gap: 20 },
    ])
  })

  it('returns empty for fewer than 2 polls', () => {
    expect(pollGapTimeline([makePoll({ id: 1, date: '2023-01-01' })])).toEqual([])
  })
})

// ─── pollCompetitivenessData ─────────────────────────────────────────────────

describe('pollCompetitivenessData', () => {
  const polls = [makePoll({ id: 1, date: '2023-01-01' })]
  const votes = [
    makeVote(1, 1, 10, 10),
    makeVote(2, 1, 11, 5),
    makeVote(3, 1, 12, 2),
  ]

  it('computes ratio of 2nd to 1st place votes as percentage', () => {
    const result = pollCompetitivenessData(polls, votes)
    expect(result[0].ratio).toBe(50) // 5/10 * 100
  })

  it('returns 0 ratio if only one book in poll', () => {
    const singleVote = [makeVote(1, 1, 10, 8)]
    const result = pollCompetitivenessData(polls, singleVote)
    expect(result[0].ratio).toBe(0)
  })
})

// ─── stageDepthDistribution ──────────────────────────────────────────────────

describe('stageDepthDistribution', () => {
  const polls = [
    makePoll({ id: 1, date: '2023-01-01' }),
    makePoll({ id: 2, date: '2023-02-01' }),
    makePoll({ id: 3, date: '2023-03-01' }),
  ]
  const runoffs: PollRunoff[] = [
    { poll_id: 2, date: '2023-02-08', total_voters: 10, votes: [] },
  ]

  it('separates polls with and without runoffs', () => {
    const result = stageDepthDistribution(polls, runoffs)
    expect(result).toEqual([
      { label: '1 этап', value: 2 },
      { label: '2 этапа', value: 1 },
    ])
  })
})

// ─── mostNominatedUnelected ──────────────────────────────────────────────────

describe('mostNominatedUnelected', () => {
  const books = [
    makeBook({ id: 1, title: 'Won', elected_poll_id: 5 }),
    makeBook({ id: 2, title: 'Never A', elected_poll_id: null }),
    makeBook({ id: 3, title: 'Never B', elected_poll_id: null }),
  ]
  const votes = [
    makeVote(1, 10, 2, 3),
    makeVote(2, 11, 2, 4),
    makeVote(3, 10, 3, 1),
    makeVote(4, 10, 1, 7), // won book — excluded
  ]

  it('returns only unelected books sorted by nomination count', () => {
    const result = mostNominatedUnelected(books, votes)
    expect(result[0].book.title).toBe('Never A')
    expect(result[0].nominations).toBe(2)
    expect(result[1].book.title).toBe('Never B')
  })

  it('excludes elected books', () => {
    const result = mostNominatedUnelected(books, votes)
    expect(result.every(x => x.book.elected_poll_id === null)).toBe(true)
  })
})

// ─── topBooksByVotes ─────────────────────────────────────────────────────────

describe('topBooksByVotes', () => {
  const books = [
    makeBook({ id: 1, title: 'A' }),
    makeBook({ id: 2, title: 'B' }),
    makeBook({ id: 3, title: 'C' }),
  ]
  const votes = [
    makeVote(1, 10, 1, 3),
    makeVote(2, 10, 2, 7),
    makeVote(3, 11, 2, 5),
    makeVote(4, 11, 3, 1),
  ]

  it('returns books sorted by total votes descending', () => {
    const result = topBooksByVotes(books, votes)
    expect(result[0].book.title).toBe('B') // 12 total
    expect(result[1].book.title).toBe('A') // 3 total
    expect(result[2].book.title).toBe('C') // 1 total
  })

  it('respects the n limit', () => {
    expect(topBooksByVotes(books, votes, 2)).toHaveLength(2)
  })
})

// ─── booksByUser ─────────────────────────────────────────────────────────────

describe('booksByUser', () => {
  const users = [
    { id: 1, username: 'alice' },
    { id: 2, username: 'bob' },
    { id: 3, username: 'carol' }, // no books
  ]
  const books = [
    makeBook({ id: 1, title: 'A', added_by_user_id: 1 }),
    makeBook({ id: 2, title: 'B', added_by_user_id: 1 }),
    makeBook({ id: 3, title: 'C', added_by_user_id: 2 }),
  ]

  it('counts books per user, sorted descending, excludes users with 0', () => {
    const result = booksByUser(books, users)
    expect(result).toEqual([
      { username: 'alice', count: 2 },
      { username: 'bob', count: 1 },
    ])
    expect(result.find(u => u.username === 'carol')).toBeUndefined()
  })
})

// ─── pollPredictabilityData ──────────────────────────────────────────────────

describe('pollPredictabilityData', () => {
  const polls = [
    makePoll({ id: 1, date: '2023-01-01', winner_book_id: 2 }),
    makePoll({ id: 2, date: '2023-02-01', winner_book_id: null }), // skipped
  ]
  const votes = [
    makeVote(1, 1, 1, 8),
    makeVote(2, 1, 2, 5), // winner
  ]
  const book2 = makeBook({ id: 2, title: 'BookB' })
  const bookById = { 1: makeBook({ id: 1, title: 'BookA' }), 2: book2 }

  it('includes only polls with a winner, with correct vote counts', () => {
    const result = pollPredictabilityData(polls, votes, bookById)
    expect(result).toHaveLength(1)
    expect(result[0]).toMatchObject({ date: '2023-01-01', winnerVotes: 5, maxVotes: 8, winner: 'BookB' })
  })
})
