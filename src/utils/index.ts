import type { Book, Poll, PollVote, Member } from '@/types'

export function memberName(m: Pick<Member, 'telegram_username' | 'telegram_fullname'>): string {
  return m.telegram_username ?? m.telegram_fullname
}

/** Group an array by a string key */
export function groupBy<T>(items: T[], key: (item: T) => string): Record<string, T[]> {
  return items.reduce<Record<string, T[]>>((acc, item) => {
    const k = key(item)
    ;(acc[k] ??= []).push(item)
    return acc
  }, {})
}


export function formatDate(iso: string) {
  return new Intl.DateTimeFormat('ru-RU', {
    day: 'numeric', month: 'short', year: 'numeric',
  }).format(new Date(iso))
}

/** Extract year from an ISO date string */
export function year(date: string): string {
  return date.slice(0, 4)
}

/** Books grouped by the year they were added */
export function booksByYear(books: Book[]): Record<string, Book[]> {
  return groupBy(books.filter(b => b.added_at), b => year(b.added_at!))
}

/** Books elected per year */
export function electedByYear(books: Book[]): Record<string, Book[]> {
  return groupBy(books.filter(b => b.elected_at), b => year(b.elected_at!))
}

/** Total votes cast in a poll */
export function totalVotesForPoll(pollId: number, votes: PollVote[]): number {
  return votes.filter(v => v.poll_id === pollId).reduce((s, v) => s + v.votes_count, 0)
}

/** How many polls a book appeared in (raw poll count, may include both stages) */
export function pollAppearances(bookId: number, votes: PollVote[]): number {
  return new Set(votes.filter(v => v.book_id === bookId).map(v => v.poll_id)).size
}

/**
 * How many distinct voting events a book participated in.
 * A 2-round poll counts as one event (stage-2 maps back to its parent stage-1 id).
 */
export function pollRootAppearances(bookId: number, votes: PollVote[], polls: Poll[]): number {
  const pollById = Object.fromEntries(polls.map(p => [p.id, p]))
  const rootIds = new Set<number>()
  for (const v of votes) {
    if (v.book_id !== bookId) continue
    const poll = pollById[v.poll_id]
    if (!poll) continue
    rootIds.add(poll.parent_poll_id ?? poll.id)
  }
  return rootIds.size
}

/** Average votes a book received across all polls it appeared in */
export function avgVotesPerPoll(bookId: number, votes: PollVote[]): number {
  const relevant = votes.filter(v => v.book_id === bookId)
  if (!relevant.length) return 0
  return relevant.reduce((s, v) => s + v.votes_count, 0) / relevant.length
}

/** Top N books by total votes across all polls */
export function topBooksByVotes(
  books: Book[],
  votes: PollVote[],
  n = 10,
): Array<{ book: Book; totalVotes: number }> {
  return books
    .map(book => ({
      book,
      totalVotes: votes.filter(v => v.book_id === book.id).reduce((s, v) => s + v.votes_count, 0),
    }))
    .sort((a, b) => b.totalVotes - a.totalVotes)
    .slice(0, n)
}

/** Polls sorted chronologically */
export function sortedPolls(polls: Poll[]): Poll[] {
  return [...polls].sort((a, b) => a.date.localeCompare(b.date))
}

/** Country distribution among all books */
export function countryDistribution(books: Book[]): Array<{ country: string; count: number }> {
  const counts: Record<string, number> = {}
  for (const b of books) {
    if (b.country) counts[b.country] = (counts[b.country] ?? 0) + 1
  }
  return Object.entries(counts)
    .map(([country, count]) => ({ country, count }))
    .sort((a, b) => b.count - a.count)
}

/** Per-member book counts */
export function booksByMember(
  books: Book[],
  members: Array<{ id: number; telegram_username?: string | null; telegram_fullname: string }>,
): Array<{ name: string; count: number }> {
  const counts: Record<number, number> = {}
  for (const b of books) {
    if (b.added_by_member_id != null)
      counts[b.added_by_member_id] = (counts[b.added_by_member_id] ?? 0) + 1
  }
  return members
    .map(m => ({ name: memberName(m), count: counts[m.id] ?? 0 }))
    .filter(m => m.count > 0)
    .sort((a, b) => b.count - a.count)
}

/** Per-member nominated vs elected counts, only members with ≥1 elected book */
export function memberActivityData(
  books: Book[],
  members: Array<{ id: number; telegram_username?: string | null; telegram_fullname: string }>,
): Array<{ name: string; nominated: number; elected: number }> {
  const nominated: Record<number, number> = {}
  const elected: Record<number, number> = {}
  for (const b of books) {
    if (b.added_by_member_id == null) continue
    nominated[b.added_by_member_id] = (nominated[b.added_by_member_id] ?? 0) + 1
    if (b.status === 'read')
      elected[b.added_by_member_id] = (elected[b.added_by_member_id] ?? 0) + 1
  }
  return members
    .map(m => ({ name: memberName(m), nominated: nominated[m.id] ?? 0, elected: elected[m.id] ?? 0 }))
    .filter(m => m.elected > 0)
    .sort((a, b) => b.nominated - a.nominated)
}

/** Books added grouped by YYYY-MM for timeline */
export function booksAddedByMonth(books: Book[]): Array<{ month: string; count: number }> {
  const counts: Record<string, number> = {}
  for (const b of books) {
    if (b.added_at) {
      const m = b.added_at.slice(0, 7)
      counts[m] = (counts[m] ?? 0) + 1
    }
  }
  return Object.entries(counts)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, count]) => ({ month, count }))
}

/** Books grouped by year added, broken down by final status — for stacked area */
export function booksAddedByYearStatus(
  books: Book[],
): Array<{ year: string; read: number; to_read: number; removed: number }> {
  const map: Record<string, { read: number; to_read: number; removed: number }> = {}
  for (const b of books) {
    if (!b.added_at) continue
    const yr = b.added_at.slice(0, 4)
    if (!map[yr]) map[yr] = { read: 0, to_read: 0, removed: 0 }
    map[yr][b.status]++
  }
  return Object.entries(map)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([year, v]) => ({ year, ...v }))
}

/** Average days between added_at and elected_at for read books */
export function avgDaysToElect(books: Book[]): number {
  const diffs = books
    .filter(b => b.status === 'read' && b.added_at && b.elected_at)
    .map(b => (new Date(b.elected_at!).getTime() - new Date(b.added_at!).getTime()) / 86_400_000)
  if (!diffs.length) return 0
  return Math.round(diffs.reduce((s, d) => s + d, 0) / diffs.length)
}

/** Median days between added_at and elected_at for read books */
export function medianDaysToElect(books: Book[]): number {
  const diffs = books
    .filter(b => b.status === 'read' && b.added_at && b.elected_at)
    .map(b => (new Date(b.elected_at!).getTime() - new Date(b.added_at!).getTime()) / 86_400_000)
    .sort((a, b) => a - b)
  if (!diffs.length) return 0
  const mid = Math.floor(diffs.length / 2)
  return Math.round(diffs.length % 2 === 0 ? (diffs[mid - 1] + diffs[mid]) / 2 : diffs[mid])
}

/** Unique voters per poll sorted chronologically, using poll.total_voters */
export function pollParticipationTimeline(
  polls: Poll[],
): Array<{ date: string; totalVoters: number; pollId: number }> {
  return sortedPolls(polls).map(p => ({
    pollId: p.id,
    date: p.date,
    totalVoters: p.total_voters ?? 0,
  }))
}

/** Top N most-nominated books that never won */
export function mostNominatedUnelected(
  books: Book[],
  votes: PollVote[],
  n = 15,
): Array<{ book: Book; nominations: number }> {
  const unelected = books.filter(b => b.elected_poll_id === null)
  return unelected
    .map(book => ({ book, nominations: pollAppearances(book.id, votes) }))
    .filter(x => x.nominations > 0)
    .sort((a, b) => b.nominations - a.nominations)
    .slice(0, n)
}

/** Scatter data: per book, nominations vs total votes, won flag */
export function winRateScatterData(
  books: Book[],
  votes: PollVote[],
): Array<{ title: string; nominations: number; totalVotes: number; won: boolean }> {
  return books
    .map(book => ({
      title: book.title,
      nominations: pollAppearances(book.id, votes),
      totalVotes: votes.filter(v => v.book_id === book.id).reduce((s, v) => s + v.votes_count, 0),
      won: book.elected_poll_id !== null,
    }))
    .filter(x => x.nominations > 0)
    .sort((a, b) => b.nominations - a.nominations)
}

/** Votes for a specific poll as pie slices */
export function votesForPoll(
  pollId: number,
  votes: PollVote[],
  bookById: Record<number, Book>,
): Array<{ name: string; value: number }> {
  return votes
    .filter(v => v.poll_id === pollId)
    .sort((a, b) => b.votes_count - a.votes_count)
    .map(v => ({ name: bookById[v.book_id]?.title ?? `#${v.book_id}`, value: v.votes_count }))
}

/** Competitiveness of each poll: ratio of 2nd-place to 1st-place votes (0–100) */
export function pollCompetitivenessData(
  polls: Poll[],
  votes: PollVote[],
): Array<{ date: string; ratio: number; pollId: number }> {
  return sortedPolls(polls).map(p => {
    const sorted = votes
      .filter(v => v.poll_id === p.id)
      .sort((a, b) => b.votes_count - a.votes_count)
    const first = sorted[0]?.votes_count ?? 0
    const second = sorted[1]?.votes_count ?? 0
    return { pollId: p.id, date: p.date, ratio: first > 0 ? Math.round((second / first) * 100) : 0 }
  })
}

/** How many polls reached each stage depth */
export function stageDepthDistribution(
  polls: Poll[],
): Array<{ label: string; value: number }> {
  const stage2 = polls.filter(p => p.stage === 2).length
  const stage1 = polls.filter(p => p.stage === 1).length - stage2
  return [
    { label: '1 этап', value: stage1 },
    { label: '2 этапа', value: stage2 },
  ]
}

/** Sankey data: book nomination journey (nominated → outcome) */
export function sankeyNominationData(
  books: Book[],
  votes: PollVote[],
  polls: Poll[],
): { nodes: Array<{ name: string }>; links: Array<{ source: number; target: number; value: number }> } {
  const runoffPollIds = new Set(polls.filter(p => p.stage === 2).map(p => p.id))
  const runoffBookIds = new Set(votes.filter(v => runoffPollIds.has(v.poll_id)).map(v => v.book_id))

  let nominated = 0, wonStage1 = 0, reachedRunoff = 0, wonRunoff = 0, neverWon = 0

  for (const book of books) {
    const appeared = pollAppearances(book.id, votes) > 0
    if (!appeared) continue
    nominated++
    if (book.elected_poll_id !== null) {
      if (runoffPollIds.has(book.elected_poll_id)) wonRunoff++
      else wonStage1++
    } else if (runoffBookIds.has(book.id)) {
      reachedRunoff++
    } else {
      neverWon++
    }
  }

  const nodes = [
    { name: 'Номинированы' },       // 0
    { name: 'Победа (1 этап)' },    // 1
    { name: 'В финал' },            // 2
    { name: 'Победа (финал)' },     // 3
    { name: 'Не победили' },        // 4
  ]
  const links = [
    { source: 0, target: 1, value: wonStage1 },
    { source: 0, target: 2, value: reachedRunoff + wonRunoff },
    { source: 0, target: 4, value: neverWon },
    { source: 2, target: 3, value: wonRunoff },
    { source: 2, target: 4, value: reachedRunoff },
  ].filter(l => l.value > 0)
  return { nodes, links }
}

/** Winner votes vs max votes per poll — predictability */
export function pollPredictabilityData(
  polls: Poll[],
  votes: PollVote[],
  bookById: Record<number, Book>,
): Array<{ date: string; winnerVotes: number; maxVotes: number; winner: string }> {
  return sortedPolls(polls)
    .filter(p => p.winner_book_id !== null)
    .map(p => {
      const pollV = votes.filter(v => v.poll_id === p.id).sort((a, b) => b.votes_count - a.votes_count)
      const maxVotes = pollV[0]?.votes_count ?? 0
      const winnerVotes = pollV.find(v => v.book_id === p.winner_book_id)?.votes_count ?? 0
      return {
        date: p.date,
        winnerVotes,
        maxVotes,
        winner: bookById[p.winner_book_id!]?.title ?? '',
      }
    })
}

/** Days between consecutive polls for gap analysis */
export function pollGapTimeline(polls: Poll[]): Array<{ date: string; gap: number }> {
  const sorted = sortedPolls(polls)
  return sorted.slice(1).map((p, i) => ({
    date: p.date,
    gap: Math.round(
      (new Date(p.date).getTime() - new Date(sorted[i].date).getTime()) / 86_400_000,
    ),
  }))
}

/** Treemap data: books grouped by country, leaf size = total votes */
export function treemapBookData(
  books: Book[],
  votes: PollVote[],
): Array<{ name: string; children: Array<{ name: string; size: number; fullTitle: string }> }> {
  const byCountry: Record<string, Array<{ name: string; size: number; fullTitle: string }>> = {}
  for (const book of books) {
    const country = book.country ?? 'Другое'
    const totalVotes = votes.filter(v => v.book_id === book.id).reduce((s, v) => s + v.votes_count, 0)
    if (totalVotes === 0) continue
    ;(byCountry[country] ??= []).push({
      name: book.title.slice(0, 20),
      fullTitle: book.title,
      size: totalVotes,
    })
  }
  return Object.entries(byCountry)
    .map(([name, children]) => ({ name, children }))
    .sort((a, b) => b.children.reduce((s, c) => s + c.size, 0) - a.children.reduce((s, c) => s + c.size, 0))
}

/** Sunburst data: members → their books (leaf value = 1) */
export function sunburstMemberData(
  books: Book[],
  members: Member[],
): { name: string; children: Array<{ name: string; children: Array<{ name: string; value: number }> }> } {
  return {
    name: 'Все книги',
    children: members
      .map(m => {
        const memberBooks = books.filter(b => b.added_by_member_id === m.id)
        if (!memberBooks.length) return null
        return {
          name: memberName(m),
          children: memberBooks.map(b => ({ name: b.title.slice(0, 18), value: 1 })),
        }
      })
      .filter((x): x is NonNullable<typeof x> => x !== null)
      .sort((a, b) => b.children.length - a.children.length),
  }
}

/** Radar data: top N books across 4 normalised dimensions */
export function radarTopBooksData(
  books: Book[],
  votes: PollVote[],
  n = 6,
): Array<{ subject: string; [bookTitle: string]: number | string }> {
  const top = topBooksByVotes(books, votes, n)
  const maxVotes    = top[0]?.totalVotes ?? 1
  const maxNom      = Math.max(...top.map(x => pollAppearances(x.book.id, votes)))
  const maxAvg      = Math.max(...top.map(x => avgVotesPerPoll(x.book.id, votes)))

  const subjects = ['Всего голосов', 'Номинаций', 'Сред. голосов', 'Победитель']
  return subjects.map(subject => {
    const row: { subject: string; [k: string]: number | string } = { subject }
    for (const { book, totalVotes } of top) {
      const shortTitle = book.title.slice(0, 16)
      if (subject === 'Всего голосов')  row[shortTitle] = Math.round((totalVotes / maxVotes) * 100)
      if (subject === 'Номинаций')      row[shortTitle] = Math.round((pollAppearances(book.id, votes) / maxNom) * 100)
      if (subject === 'Сред. голосов')  row[shortTitle] = Math.round((avgVotesPerPoll(book.id, votes) / maxAvg) * 100)
      if (subject === 'Победитель')     row[shortTitle] = book.elected_poll_id !== null ? 100 : 0
    }
    return row
  })
}
