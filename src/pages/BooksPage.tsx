import { useState } from 'react'
import type { User } from '@/types'
import { useBooks, useUsers, useAuthors } from '@/hooks'
import './BooksPage.scss'

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
  const { data: books   = [] } = useBooks()
  const { data: users   = [] } = useUsers()
  const { data: authors = [] } = useAuthors()
  const [filter, setFilter] = useState<Filter>('all')

  const userById   = Object.fromEntries(users.map((u: User) => [u.id, u])) as Record<number, User>
  const authorById = Object.fromEntries(authors.map(a => [a.id, a.value])) as Record<number, string>

  const counts = {
    all: books.length,
    read: books.filter(b => b.status === 'read').length,
    to_read: books.filter(b => b.status === 'to_read').length,
    removed: books.filter(b => b.status === 'removed').length,
  }

  const visible = [...(filter === 'all' ? books : books.filter(b => b.status === filter))]
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

      <div className="filter-row">
        {(['all', 'read', 'to_read', 'removed'] as Filter[]).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`filter-btn${filter === f ? ' filter-btn--active' : ''}`}
          >
            {filterLabels[f]}
            <span className="filter-count">{counts[f]}</span>
          </button>
        ))}
      </div>

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
            {visible.map(book => (
              <tr key={book.id} className="tr">
                <td className="td">
                  <span className="book-title">{book.title}</span>
                  {book.status === 'removed' && (
                    <span className="badge">removed</span>
                  )}
                </td>
                <td className="td muted">{book.author_id != null ? authorById[book.author_id] : '—'}</td>
                <td className="td muted">
                  {book.added_by_user_id != null
                    ? (userById[book.added_by_user_id]?.username ?? '—')
                    : '—'}
                </td>
                <td className="td muted td--right">
                  {book.added_at ? formatDate(book.added_at) : '—'}
                </td>
                <td className="td muted td--right">
                  {book.elected_at ? formatDate(book.elected_at) : '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
