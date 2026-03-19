import './BookCard.scss'
import { Link } from 'react-router-dom'
import type { Book } from '@/types'
import { formatDate } from '@/utils'
import CoverImage from './CoverImage'

const STATUS_LABEL: Record<string, string> = {
  read: 'Прочитана',
  to_read: 'В списке',
  removed: 'Выбыла',
}

interface Props {
  book: Book
  showAuthor?: boolean
  authorName?: string
  showUser?: boolean
  userName?: string
  showBadge?: boolean
  titleBadge?: React.ReactNode
  showStatus?: boolean
}

export default function BookCard({ book, showAuthor = true, authorName, showUser, userName, showBadge = true, titleBadge, showStatus = true }: Props) {
  const date = book.elected_at
  const addedDate = book.added_at

  return (
    <Link to={`/books/${book.id}`} className={`book-card book-card--${book.status}`}>
      <CoverImage coverSize="small" bookId={book.id} title={book.title} />
      <div className="book-card-info">
        <div className="book-card-title-row">
          <span className="book-card-title">{book.title}</span>
          {showBadge && titleBadge}
        </div>
        {showAuthor && authorName && <div className="book-card-author">{authorName}</div>}
        <div className="book-card-meta">
          {showStatus &&
            <span className={`book-card-status book-card-status--${book.status}`}>
              {STATUS_LABEL[book.status]}
            </span>}
          {date
            ? <span className="book-card-date">{formatDate(date)}</span>
            : addedDate && <span className="book-card-date">добавлена {formatDate(addedDate)}</span>
          }
          {showUser && userName && <span className="book-card-user">от {userName}</span>}
        </div>
      </div>
    </Link>
  )
}