import './AuthorPage.scss'
import { useParams, Link } from 'react-router-dom'
import type { Book } from '@/types'
import { useBooks, useAuthors, useMembers, usePollVotes, useAwardVotes, useMemberVisibility, usePageTitle } from '@/hooks'
import BookCardList from '@/components/layout/BookCardList'
import { memberName } from '@/utils'

export default function AuthorPage() {
  const memberVisibility = useMemberVisibility()
  const { id } = useParams<{ id: string }>()
  const authorId = Number(id)

  const { data: books = [] } = useBooks()
  const { data: authors = [] } = useAuthors()
  const { data: members = [] } = useMembers()
  const { data: pollVotes = [] } = usePollVotes()
  const { data: awardVotes = [] } = useAwardVotes()

  const memberById = Object.fromEntries(members.map(m => [m.id, memberName(m)]))

  const author = authors.find(a => a.id === authorId)
  usePageTitle(`${author?.name} | Что мы читаем`)
  if (!author) return <div className="page"><p className="ap-not-found">Автор не найден</p></div>

  const authorBooks = books.filter(b => b.author_id === authorId)
  const readBooks = authorBooks.filter(b => b.status === 'read')
  const awardWins = awardVotes.filter(v => v.is_winner && authorBooks.some(b => b.id === v.book_id))

  const totalVotes = authorBooks.reduce((sum, book) => {
    return sum + pollVotes.filter(v => v.book_id === book.id).reduce((s, v) => s + v.votes_count, 0)
  }, 0)

  const proposedBooks = authorBooks
    .filter(b => b.status === 'to_read')
    .sort((a, b) => (b.added_at ?? '').localeCompare(a.added_at ?? ''))

  const removedBooks = authorBooks
    .filter(b => b.status === 'removed')
    .sort((a, b) => (b.added_at ?? '').localeCompare(a.added_at ?? ''))

  const sortedReadBooks = [...readBooks]
    .sort((a, b) => (b.elected_at ?? b.added_at ?? '').localeCompare(a.elected_at ?? a.added_at ?? ''))

  const getBadge = (book: Book) => {
    const award = awardVotes.find(v => v.book_id === book.id && v.is_winner)
    return award ? <span className="ap-book-award">★ {award.year}</span> : undefined
  }

  return (
    <div className="page">
      <div className="ap-back">
        <Link to="/authors" className="ap-back-link">← Все авторы</Link>
      </div>

      <div className="ap-header">
        <h1 className="ap-name">{author.name}</h1>

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

      {sortedReadBooks.length > 0 && (
        <section className="section">
          <h2 className="section-title">Прочитанные книги</h2>
          <BookCardList
            books={sortedReadBooks}
            showAuthor={false}
            memberById={memberById}
            showMember={memberVisibility}
            getBadge={getBadge}
          />
        </section>
      )}

      {proposedBooks.length > 0 && (
        <section className="section">
          <h2 className="section-title">Предложенные книги</h2>
          <BookCardList
            books={proposedBooks}
            showAuthor={false}
            memberById={memberById}
            showMember={memberVisibility}
            getBadge={getBadge}
          />
        </section>
      )}

      {removedBooks.length > 0 && (
        <section className="section">
          <h2 className="section-title">Выбывшие книги</h2>
          <BookCardList
            books={removedBooks}
            showAuthor={false}
            memberById={memberById}
            showMember={memberVisibility}
            getBadge={getBadge}
          />
        </section>
      )}
    </div>
  )
}
