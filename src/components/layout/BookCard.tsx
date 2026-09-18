import './BookCard.scss'
import { Link } from 'react-router-dom'
import type { Book, MemberVisibility } from '@/types'
import { formatDate } from '@/utils'
import { useAuth } from '@/context/AuthContext'
import CoverImage from './CoverImage'
import DiscussionLink from './DiscussionLink'

interface Props {
  book: Book
  showAuthor?: boolean
  authorName?: string
  showMember?: MemberVisibility
  memberName?: string
  showBadge?: boolean
  titleBadge?: React.ReactNode
  showDiscussionLink?: boolean
}

export default function BookCard({ book, showAuthor = true, authorName, showMember: showMember, memberName: memberName, showBadge = true, titleBadge, showDiscussionLink = false }: Props) {
  const { isAuthed } = useAuth()
  const date = book.elected_at
  const addedDate = book.added_at

  return (
    <div className={`book-card book-card--${book.status}`}>
      <Link to={`/books/${book.id}`} className="book-card-link" aria-label={book.title} />
      <CoverImage coverSize="small" coverUrl={book.cover_url} title={book.title} />
      <div className="book-card-info">
        <div className="book-card-title-row">
          <span className="book-card-title">{book.title}</span>
          {showBadge && titleBadge}
        </div>
        {showAuthor && authorName && <div className="book-card-author">{authorName}</div>}
        <div className="book-card-meta">
          {date
            ? <span className="book-card-date">{formatDate(date)}</span>
            : addedDate && <span className="book-card-date">добавлена {formatDate(addedDate)}</span>
          }
          {showMember === 'visible' && memberName && <span className="book-card-member">от {memberName}</span>}
          {showMember === 'blur' && book.added_by_member_id !== null && <span className="book-card-member member-blur">от Участник</span>}
        </div>
      </div>
      {showDiscussionLink && book.discussion_url && isAuthed && (
        <DiscussionLink url={book.discussion_url} variant="boxed" />
      )}
    </div>
  )
}