import './BookPage.scss'
import { useParams, Link } from 'react-router-dom'
import { useBooks, useMembers, useAuthors, usePolls, usePollVotes, useAwardVotes } from '@/hooks'
import { formatDate, pollRootAppearances, memberName } from '@/utils'
import CoverImage from '@/components/layout/CoverImage'

const STATUS_LABEL: Record<string, string> = {
  read: 'Прочитана',
  to_read: 'В списке',
  removed: 'Выбыла',
}

export default function BookPage() {
  const { id } = useParams<{ id: string }>()
  const bookId = Number(id)

  const { data: books = [] } = useBooks()
  const { data: members = [] } = useMembers()
  const { data: authors = [] } = useAuthors()
  const { data: polls = [] } = usePolls()
  const { data: pollVotes = [] } = usePollVotes()
  const { data: awardVotes = [] } = useAwardVotes()

  const book = books.find(b => b.id === bookId)
  if (!book) return <div className="page"><p className="bp-not-found">Книга не найдена</p></div>

  const authorById = Object.fromEntries(authors.map(a => [a.id, a]))
  const memberById = Object.fromEntries(members.map(u => [u.id, u]))

  const author = book.author_id != null ? authorById[book.author_id] : null
  const addedBy = book.added_by_member_id != null ? memberById[book.added_by_member_id] : null

  const appearances = pollRootAppearances(bookId, pollVotes, polls)

  const award = awardVotes.find(v => v.book_id === bookId && v.is_winner)

  return (
    <div className="page">
      <div className="bp-back">
        <Link to="/books" className="bp-back-link">← Все книги</Link>
      </div>

      <div className="bp-hero">
        <div className="bp-cover">
          <CoverImage coverSize="large" bookId={book.id} title={book.title} />
        </div>

        <div className="bp-info">
          <div className="bp-status-row">
            <span className={`bp-status bp-status--${book.status}`}>{STATUS_LABEL[book.status]}</span>
            {award && (
              <span className="bp-award">Книга года {award.year}</span>
            )}
          </div>

          <h1 className="bp-title">{book.title}</h1>

          {author && (
            <Link to={`/authors/${author.id}`} className="bp-author">
              {author.name}
            </Link>
          )}

          {book.country && <p className="bp-country">{book.country}</p>}

          <dl className="bp-meta">
            {addedBy && (
              <>
                <dt>Предложил</dt>
                <dd>
                  <Link to={`/members/${addedBy.id}`} className="member-link">
                    {memberName(addedBy)}
                  </Link>
                </dd>
              </>
            )}
            {book.added_at && (
              <>
                <dt>В списке с</dt>
                <dd>{formatDate(book.added_at)}</dd>
              </>
            )}
            {book.elected_at && (
              <>
                <dt>Выбрана</dt>
                <dd>{formatDate(book.elected_at)}</dd>
              </>
            )}
            {appearances > 0 && (
              <>
                <dt>Голосований</dt>
                <dd>{appearances}</dd>
              </>
            )}
          </dl>

          {book.discussion_url && (
            <a href={book.discussion_url} className="bp-discussion-link" target="_blank" rel="noopener noreferrer">
              Запись обсуждения →
            </a>
          )}
        </div>
      </div>

      {book.annotation && (
        <div className="bp-annotation">
          <h2 className="bp-annotation-title">Аннотация</h2>
          <p className="bp-annotation-text">{book.annotation}</p>
        </div>
      )}
    </div>
  )
}
