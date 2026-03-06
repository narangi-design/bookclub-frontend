import './AuthorPage.scss'
import { useParams, Link } from 'react-router-dom'
import { useBooks, useAuthors, usePollVotes, useAwardVotes } from '@/hooks'
import { formatDate } from '@/utils'
import CoverImage from '@/components/layout/CoverImage'

const STATUS_LABEL: Record<string, string> = {
  read: 'Прочитана',
  to_read: 'В списке',
  removed: 'Выбыла',
}

export default function AuthorPage() {
  const { id } = useParams<{ id: string }>()
  const authorId = Number(id)

  const { data: books = [] } = useBooks()
  const { data: authors = [] } = useAuthors()
  const { data: pollVotes = [] } = usePollVotes()
  const { data: awardVotes = [] } = useAwardVotes()

  const author = authors.find(a => a.id === authorId)
  if (!author) return <div className="page"><p className="ap-not-found">Автор не найден</p></div>

  const authorBooks = books.filter(b => b.author_id === authorId)
  const readBooks = authorBooks.filter(b => b.status === 'read')
  const awardWins = awardVotes.filter(v => v.is_winner && authorBooks.some(b => b.id === v.book_id))

  const totalVotes = authorBooks.reduce((sum, book) => {
    return sum + pollVotes.filter(v => v.book_id === book.id).reduce((s, v) => s + v.votes_count, 0)
  }, 0)

  const sorted = [...authorBooks].sort((a, b) => {
    const order = { read: 0, to_read: 1, removed: 2 } as Record<string, number>
    const so = order[a.status] - order[b.status]
    if (so !== 0) return so
    const dateA = a.elected_at ?? a.added_at ?? ''
    const dateB = b.elected_at ?? b.added_at ?? ''
    return dateB.localeCompare(dateA)
  })

  return (
    <div className="page">
      <div className="ap-back">
        <Link to="/authors" className="ap-back-link">← Все авторы</Link>
      </div>

      <div className="ap-header">
        <h1 className="ap-name">{author.value}</h1>

        <div className="ap-stats">
          <div className="ap-stat">
            <span className="ap-stat-value">{authorBooks.length}</span>
            <span className="ap-stat-label">книг в клубе</span>
          </div>
          <div className="ap-stat">
            <span className="ap-stat-value">{readBooks.length}</span>
            <span className="ap-stat-label">прочитано</span>
          </div>
          {totalVotes > 0 && (
            <div className="ap-stat">
              <span className="ap-stat-value">{totalVotes}</span>
              <span className="ap-stat-label">голосов за всё время</span>
            </div>
          )}
          {awardWins.length > 0 && (
            <div className="ap-stat ap-stat--award">
              <span className="ap-stat-value">{awardWins.length}</span>
              <span className="ap-stat-label">
                {awardWins.length === 1 ? 'книга года' : 'книги года'}
              </span>
            </div>
          )}
        </div>
      </div>

      <div className="ap-books">
        {sorted.map(book => {
          const award = awardVotes.find(v => v.book_id === book.id && v.is_winner)
          const votes = pollVotes.filter(v => v.book_id === book.id).reduce((s, v) => s + v.votes_count, 0)
          return (
            <Link key={book.id} to={`/books/${book.id}`} className={`ap-book ap-book--${book.status}`}>
              <div className="ap-book-cover">
                <CoverImage coverSize="small" bookId={book.id} title={book.title} />
              </div>
              <div className="ap-book-info">
                <div className="ap-book-title-row">
                  <span className="ap-book-title">{book.title}</span>
                  {award && <span className="ap-book-award">★ {award.year}</span>}
                </div>
                <div className="ap-book-meta">
                  <span className={`ap-book-status ap-book-status--${book.status}`}>
                    {STATUS_LABEL[book.status]}
                  </span>
                  {book.elected_at && (
                    <span className="ap-book-date">{formatDate(book.elected_at)}</span>
                  )}
                  {!book.elected_at && book.added_at && (
                    <span className="ap-book-date">добавлена {formatDate(book.added_at)}</span>
                  )}
                  {votes > 0 && (
                    <span className="ap-book-votes">{votes} голосов</span>
                  )}
                </div>
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
