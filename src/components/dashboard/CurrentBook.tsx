import './CurrentBook.scss'
import type { Book, Member, MemberVisibility } from '@/types'
import { formatDate, memberName } from '@/utils'
import CoverImage from '@/components/layout/CoverImage'
import { Link } from 'react-router-dom'

interface Props {
  book: Book
  authorName?: string
  addedByMember?: Member
  memberVisibility?: MemberVisibility
}

export default function CurrentBook({ book, authorName, addedByMember, memberVisibility }: Props) {
  return (
    <div className="card">
      <div className="card-header">
        <CoverImage coverSize="default" coverUrl={book.cover_url} title={book.title} />
        <div className="info">
          <h2 className="title">{book.title}</h2>
          <div className="meta">
            {authorName && <span>{authorName}</span>}
            {authorName && book.country && <span className="dot">·</span>}
            {book.country && <span>{book.country}</span>}
          </div>
          {book.added_at && (memberVisibility === 'visible' ? addedByMember : book.added_by_member_id !== null) && (
            <div className="added-by">
              В списке с {formatDate(book.added_at)}
              {' · '}
              Ведёт книгу{' '}
              {memberVisibility === 'visible' && addedByMember
                ? <Link to={`/members/${addedByMember.id}`} className="member-link">{memberName(addedByMember)}</Link>
                : <span className="member-blur">Участник</span>
              }
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
