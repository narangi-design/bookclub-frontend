import { useState } from 'react'
import { usePolls, usePollVotes, useBooks, useAuthors, usePageTitle } from '@/hooks'
import type { Poll } from '@/types'
import PollCard from '@/components/polls/PollCard'
import FilterBar from '@/components/layout/FilterBar'

type Filter = 'all' | 'one' | 'two'

interface Session {
  stage1: Poll
  stage2: Poll | null
  winner_book_id: number | null
}

export default function PollsPage() {
  usePageTitle('Голосования за книги')
  const { data: polls   = [] } = usePolls()
  const { data: votes   = [] } = usePollVotes()
  const { data: books   = [] } = useBooks()
  const { data: authors = [] } = useAuthors()
  const [filter, setFilter] = useState<Filter>('all')

  const bookById   = Object.fromEntries(books.map(b => [b.id, b]))
  const authorById = Object.fromEntries(authors.map(a => [a.id, a.name]))

  const stage2ByParent: Record<number, Poll> = {}
  for (const p of polls.filter(p => p.stage === 2)) {
    if (p.parent_poll_id != null) stage2ByParent[p.parent_poll_id] = p
  }
  const sessions: Session[] = polls
    .filter(p => p.stage === 1)
    .sort((a, b) => b.date.localeCompare(a.date))
    .map(s1 => {
      const s2 = stage2ByParent[s1.id] ?? null
      return { stage1: s1, stage2: s2, winner_book_id: s2 ? s2.winner_book_id : s1.winner_book_id }
    })

  const counts = {
    all: sessions.length,
    one: sessions.filter(s => s.stage2 === null).length,
    two: sessions.filter(s => s.stage2 !== null).length,
  }

  const filtered =
    filter === 'one' ? sessions.filter(s => s.stage2 === null) :
    filter === 'two' ? sessions.filter(s => s.stage2 !== null) :
    sessions

  return (
    <div className="page">
      <h1 className="page-title">Голосования</h1>

      <FilterBar
        value={filter}
        onChange={f => setFilter(f as Filter)}
        options={[
          { key: 'all', label: 'Все',       count: counts.all },
          { key: 'one', label: 'Один тур', count: counts.one },
          { key: 'two', label: 'Два тура', count: counts.two },
        ]}
      />

      <div className="poll-list">
        {filtered.map(s => (
          <PollCard
            key={s.stage1.id}
            stage1={s.stage1}
            stage2={s.stage2}
            winner_book_id={s.winner_book_id}
            bookById={bookById}
            authorById={authorById}
            votes={votes}
          />
        ))}
      </div>
    </div>
  )
}
