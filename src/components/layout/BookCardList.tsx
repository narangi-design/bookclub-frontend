import './BookCardList.scss'
import type { Book } from '@/types'
import BookCard from './BookCard'

interface Props {
  books: Book[]
  authorById?: Record<number, string>
  showCountry?: boolean
  userById?: Record<number, string>
  showAuthor?: boolean
  showUser?: boolean
  getBadge?: (book: Book) => React.ReactNode
}

export default function BookCardList({
  books,
  authorById,
  showCountry,
  userById,
  showAuthor,
  showUser,
  getBadge,
}: Props) {
  return (
    <div className="book-card-list">
      {books.map(book => {
        const parts = [
          book.author_id != null ? authorById?.[book.author_id] : undefined,
          showCountry ? book.country : undefined,
        ].filter(Boolean)

        return (
          <BookCard
            key={book.id}
            book={book}
            authorName={parts.length > 0 ? parts.join(' · ') : undefined}
            showAuthor={showAuthor}
            showUser={showUser}
            userName={book.added_by_user_id != null ? userById?.[book.added_by_user_id] : undefined}
            titleBadge={getBadge?.(book)}
          />
        )
      })}
    </div>
  )
}
