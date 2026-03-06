import './UserPage.scss'
import { useParams, Link } from 'react-router-dom'
import { useBooks, useUsers, useAuthors } from '@/hooks'
import { formatDate } from '@/utils'
import CoverImage from '@/components/layout/CoverImage'

export default function UserPage() {
  const { id } = useParams<{ id: string }>()
  const userId = Number(id)

  const { data: users   = [] } = useUsers()
  const { data: books   = [] } = useBooks()
  const { data: authors = [] } = useAuthors()

  const user = users.find(u => u.id === userId)
  if (!user) return <div className="page"><p className="up-not-found">Участник не найден</p></div>

  const authorById = Object.fromEntries(authors.map(a => [a.id, a.value]))

  const addedBooks = books
    .filter(b => b.added_by_user_id === userId)
    .sort((a, b) => (b.added_at ?? '').localeCompare(a.added_at ?? ''))

  const sessions = addedBooks
    .filter(b => b.status === 'read')
    .sort((a, b) => (b.elected_at ?? b.added_at ?? '').localeCompare(a.elected_at ?? a.added_at ?? ''))

  const toReadCount = addedBooks.filter(b => b.status === 'to_read').length

  return (
    <div className="page">
      <div className="up-back">
        <Link to="/users" className="up-back-link">← Все участники</Link>
      </div>

      <div className="up-header">
        <div className="up-avatar">{user.username.slice(0, 2).toUpperCase()}</div>
        <div className="up-header-info">
          <h1 className="up-name">{user.username}</h1>
          <div className="up-stats">
            <div className="up-stat">
              <span className="up-stat-value">{addedBooks.length}</span>
              <span className="up-stat-label">предложено книг</span>
            </div>
            {sessions.length > 0 && (
              <div className="up-stat">
                <span className="up-stat-value">{sessions.length}</span>
                <span className="up-stat-label">прочитано</span>
              </div>
            )}
            {toReadCount > 0 && (
              <div className="up-stat">
                <span className="up-stat-value">{toReadCount}</span>
                <span className="up-stat-label">в списке</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {sessions.length > 0 && (
        <section className="section">
          <h2 className="section-title">Провёл заседания</h2>
          <div className="up-sessions">
            {sessions.map(book => (
              <div key={book.id} className="up-session">
                <span className="up-session-date">
                  {formatDate(book.elected_at ?? book.added_at ?? '')}
                </span>
                <Link to={`/books/${book.id}`} className="up-session-book">
                  {book.title}
                </Link>
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="section">
        <h2 className="section-title">Предложенные книги</h2>
        <div className="up-books">
          {addedBooks.map(book => (
            <Link key={book.id} to={`/books/${book.id}`} className={`up-book up-book--${book.status}`}>
              <div className="up-book-cover">
                <CoverImage coverSize="small" bookId={book.id} title={book.title} />
              </div>
              <div className="up-book-info">
                <div className="up-book-title">{book.title}</div>
                {book.author_id != null && (
                  <div className="up-book-author">{authorById[book.author_id]}</div>
                )}
                <div className="up-book-meta">
                  <span className={`up-book-status up-book-status--${book.status}`}>
                    {{ read: 'Прочитана', to_read: 'В списке', removed: 'Выбыла' }[book.status]}
                  </span>
                  {book.elected_at && (
                    <span className="up-book-date">{formatDate(book.elected_at)}</span>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  )
}
