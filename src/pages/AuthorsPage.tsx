import './AuthorsPage.scss'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useBooks, useAuthors, useAwardVotes } from '@/hooks'
import FilterBar from '@/components/layout/FilterBar'
import SearchBar from '@/components/layout/SearchBar'

type Filter = 'all' | 'read' | 'unread'

export default function AuthorsPage() {
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<Filter>('all')

  const { data: books = [] } = useBooks()
  const { data: authors = [] } = useAuthors()
  const { data: awardVotes = [] } = useAwardVotes()

  const authorStats = authors.map(author => {
    const authorBooks = books.filter(b => b.author_id === author.id)
    const readCount = authorBooks.filter(b => b.status === 'read').length
    const awardWins = awardVotes.filter(v => v.is_winner && authorBooks.some(b => b.id === v.book_id))
    return { author, total: authorBooks.length, readCount, awardYears: awardWins.map(v => v.year) }
  })

  const withBooks = authorStats.filter(s => s.total > 0)

  const byFilter = withBooks.filter(s => {
    if (filter === 'read') return s.readCount > 0
    if (filter === 'unread') return s.readCount === 0
    return true
  })

  const filtered = search.trim()
    ? byFilter.filter(s => s.author.value.toLowerCase().includes(search.trim().toLowerCase()))
    : byFilter

  const sorted = [...filtered].sort((a, b) => b.total - a.total || a.author.value.localeCompare(b.author.value, 'ru'))

  const counts = {
    all: withBooks.length,
    read: withBooks.filter(s => s.readCount > 0).length,
    unread: withBooks.filter(s => s.readCount === 0).length,
  }

  return (
    <div className="page">
      <h1 className="page-title">Авторы</h1>

      <SearchBar
        value={search}
        onChange={setSearch}
        placeholder="Поиск по имени…"
        count={sorted.length}
      />

      <FilterBar
        value={filter}
        onChange={f => setFilter(f as Filter)}
        options={[
          { key: 'all', label: 'Все', count: counts.all },
          { key: 'read', label: 'Читали', count: counts.read },
          { key: 'unread', label: 'Пока не читали', count: counts.unread },
        ]}
      />

      <div className="aup-list">
        {sorted.map(({ author, total, readCount, awardYears }) => (
          <Link key={author.id} to={`/authors/${author.id}`} className="aup-item">
            <div className="aup-name">{author.value}</div>
            <div className="aup-meta">
              {awardYears.length > 0 && (
                <span className="aup-award">★ {awardYears.join(', ')}</span>
              )}
              <span className="aup-books">{total} {bookWord(total)}</span>
              {readCount > 0 && (
                <span className="aup-read">{readCount} прочитано</span>
              )}
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}

function bookWord(n: number): string {
  const mod10 = n % 10
  const mod100 = n % 100
  if (mod100 >= 11 && mod100 <= 14) return 'книг'
  if (mod10 === 1) return 'книга'
  if (mod10 >= 2 && mod10 <= 4) return 'книги'
  return 'книг'
}
