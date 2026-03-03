import { useState } from 'react'
import type { User } from '@/types'
import { useBooks, useUsers, useAuthors } from '@/hooks'
import styles from './BooksPage.module.css'

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
    <div className={styles.page}>
      <h1 className={styles.pageTitle}>Books</h1>

      <div className={styles.filterRow}>
        {(['all', 'read', 'to_read', 'removed'] as Filter[]).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`${styles.filterBtn} ${filter === f ? styles.filterBtnActive : ''}`}
          >
            {filterLabels[f]}
            <span className={styles.filterCount}>{counts[f]}</span>
          </button>
        ))}
      </div>

      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th className={styles.th}>Название</th>
              <th className={styles.th}>Автор</th>
              <th className={styles.th}>Инициатор</th>
              <th className={`${styles.th} ${styles.thRight}`}>Добавлена в список</th>
              <th className={`${styles.th} ${styles.thRight}`}>Когда выбрана</th>
            </tr>
          </thead>
          <tbody>
            {visible.map(book => (
              <tr key={book.id} className={styles.tr}>
                <td className={styles.td}>
                  <span className={styles.bookTitle}>{book.title}</span>
                  {book.status === 'removed' && (
                    <span className={styles.badge}>removed</span>
                  )}
                </td>
                <td className={`${styles.td} ${styles.muted}`}>{book.author_id != null ? authorById[book.author_id] : '—'}</td>
                <td className={`${styles.td} ${styles.muted}`}>
                  {book.added_by_user_id != null
                    ? (userById[book.added_by_user_id]?.username ?? '—')
                    : '—'}
                </td>
                <td className={`${styles.td} ${styles.muted} ${styles.tdRight}`}>
                  {book.added_at ? formatDate(book.added_at) : '—'}
                </td>
                <td className={`${styles.td} ${styles.muted} ${styles.tdRight}`}>
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
