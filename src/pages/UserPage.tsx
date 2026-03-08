import './UserPage.scss'
import { useParams, Link } from 'react-router-dom'
import { useBooks, useUsers, useAuthors } from '@/hooks'
import BookCard from '@/components/layout/BookCard'

export default function UserPage() {
  const { id } = useParams<{ id: string }>()
  const userId = Number(id)

  const { data: users   = [] } = useUsers()
  const { data: books   = [] } = useBooks()
  const { data: authors = [] } = useAuthors()

  const user = users.find(u => u.id === userId)
  if (!user) return <div className="page"><p className="up-not-found">Участник не найден</p></div>

  const authorById = Object.fromEntries(authors.map(a => [a.id, a.value]))

  const allAdded = books.filter(b => b.added_by_user_id === userId)

  const readBooks = allAdded
    .filter(b => b.status === 'read')
    .sort((a, b) => (b.elected_at ?? b.added_at ?? '').localeCompare(a.elected_at ?? a.added_at ?? ''))

  const proposedBooks = allAdded
    .filter(b => b.status !== 'read')
    .sort((a, b) => {
      if (a.status === 'removed' && b.status !== 'removed') return 1
      if (a.status !== 'removed' && b.status === 'removed') return -1
      return (b.added_at ?? '').localeCompare(a.added_at ?? '')
    })

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
              <span className="up-stat-value">{allAdded.length}</span>
              <span className="up-stat-label">предложено книг</span>
            </div>
            {readBooks.length > 0 && (
              <div className="up-stat">
                <span className="up-stat-value">{readBooks.length}</span>
                <span className="up-stat-label">прочитано</span>
              </div>
            )}
            {proposedBooks.filter(b => b.status === 'to_read').length > 0 && (
              <div className="up-stat">
                <span className="up-stat-value">{proposedBooks.filter(b => b.status === 'to_read').length}</span>
                <span className="up-stat-label">в списке</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {readBooks.length > 0 && (
        <section className="section">
          <h2 className="section-title">Прочитанные книги</h2>
          <div className="up-books">
            {readBooks.map(book => (
              <BookCard
                key={book.id}
                book={book}
                authorName={book.author_id != null ? authorById[book.author_id] : undefined}
              />
            ))}
          </div>
        </section>
      )}

      {proposedBooks.length > 0 && (
        <section className="section">
          <h2 className="section-title">Предложенные книги</h2>
          <div className="up-books">
            {proposedBooks.map(book => (
              <BookCard
                key={book.id}
                book={book}
                authorName={book.author_id != null ? authorById[book.author_id] : undefined}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}