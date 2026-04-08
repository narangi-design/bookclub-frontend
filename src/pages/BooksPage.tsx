import './BooksPage.scss'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import type { Member } from '@/types'
import { useBooks, useMembers, useAuthors, useMemberVisibility } from '@/hooks'
import { memberName } from '@/utils'
import FilterBar from '@/components/layout/FilterBar'
import SearchBar from '@/components/layout/SearchBar'
function formatDate(iso: string) {
  const d = new Date(iso)
  const dd = String(d.getDate()).padStart(2, '0')
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const yy = String(d.getFullYear()).slice(-2)
  return `${dd}.${mm}.${yy}`
}

type Filter = 'all' | 'read' | 'to_read' | 'removed'

const STATUS_ORDER: Record<string, number> = { read: 0, to_read: 1, removed: 2 }

export default function BooksPage() {
  const memberVisibility = useMemberVisibility()
  const { data: books   = [] } = useBooks()
  const { data: members = [] } = useMembers()
  const { data: authors = [] } = useAuthors()
  const [filter, setFilter] = useState<Filter>('all')
  const [search, setSearch] = useState('')

  const memberById = Object.fromEntries(members.map((u: Member) => [u.id, u])) as Record<number, Member>
  const authorById = Object.fromEntries(authors.map(a => [a.id, a.name])) as Record<number, string>

  const counts = {
    all: books.length,
    read: books.filter(b => b.status === 'read').length,
    to_read: books.filter(b => b.status === 'to_read').length,
    removed: books.filter(b => b.status === 'removed').length,
  }

  const q = search.trim().toLowerCase()

  const visible = [...(filter === 'all' ? books : books.filter(b => b.status === filter))]
    .filter(b => !q
      || b.title.toLowerCase().includes(q)
      || (b.author_id != null && authorById[b.author_id]?.toLowerCase().includes(q))
    )
    .sort((a, b) => {
      if (filter === 'all') {
        const so = STATUS_ORDER[a.status] - STATUS_ORDER[b.status]
        if (so !== 0) return so
      }
      const dateA = a.status === 'read' ? (a.elected_at ?? '') : (a.added_at ?? '')
      const dateB = b.status === 'read' ? (b.elected_at ?? '') : (b.added_at ?? '')
      return dateB.localeCompare(dateA)
    })

  const filterLabels: Record<Filter, string> = {
    all: 'Все',
    read: 'Прочитанные',
    to_read: 'Непрочитанные',
    removed: 'Выбывшие',
  }

  return (
    <div className="page">
      <h1 className="page-title">Books</h1>

      <SearchBar
        value={search}
        onChange={setSearch}
        placeholder="Поиск по названию или автору…"
        count={visible.length}
      />

      <FilterBar
        value={filter}
        onChange={f => setFilter(f as Filter)}
        options={(['all', 'read', 'to_read', 'removed'] as Filter[]).map(f => ({
          key: f,
          label: filterLabels[f],
          count: counts[f],
        }))}
      />

      <div className="table-wrap">
        <table className="table">
          <thead>
            <tr>
              <th className="th">Название</th>
              <th className="th">Автор</th>
              <th className="th">Инициатор</th>
              <th className="th th--right">Добавлена в список</th>
              <th className="th th--right">Когда выбрана</th>
            </tr>
          </thead>
          <tbody>
            {visible.map(book => {
              const m = book.added_by_member_id != null ? memberById[book.added_by_member_id] : null
              return (
                <tr key={book.id} className="tr">
                  <td className="td">
                    <Link to={`/books/${book.id}`} className="book-title">{book.title}</Link>
                    {book.status === 'removed' && (
                      <span className="badge">removed</span>
                    )}
                  </td>
                  <td className="td muted">
                    {book.author_id != null
                      ? <Link to={`/authors/${book.author_id}`} className="author-link">{authorById[book.author_id]}</Link>
                      : '—'}
                  </td>
                  <td className="td muted">
                    {book.added_by_member_id === null
                      ? '—'
                      : memberVisibility === 'visible' && m
                        ? memberName(m)
                        : <span className="member-blur">Участник</span>
                    }
                  </td>
                  <td className="td muted td--right">
                    {book.added_at ? formatDate(book.added_at) : '—'}
                  </td>
                  <td className="td muted td--right">
                    {book.elected_at ? formatDate(book.elected_at) : '—'}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
