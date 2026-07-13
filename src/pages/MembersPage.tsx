import './MembersPage.scss'
import { Link } from 'react-router-dom'
import { useBooks, useMembers, usePageTitle } from '@/hooks'
import { memberName } from '@/utils'

export default function MembersPage() {
  usePageTitle('Участники элитного книжного клуба')
  const { data: members = [] } = useMembers()
  const { data: books = [] } = useBooks()

  const booksByMember = Object.groupBy(books, b => b.added_by_member_id ?? -1)

  const rows = members.map(member => {
    const added = booksByMember[member.id] ?? []
    const read  = added.filter(b => b.status === 'read').length
    const displayName = memberName(member)
    return { member, displayName, added: added.length, read }
  }).sort((a, b) => b.added - a.added || a.displayName.localeCompare(b.displayName))

  return (
    <div className="page">
      <h1 className="page-title">Участники</h1>

      <div className="usp-list">
        {rows.map(({ member, displayName, added, read }) => (
          <Link key={member.id} to={`/members/${member.id}`} className="usp-item">
            <div className="usp-avatar">{displayName.slice(0, 2).toUpperCase()}</div>
            <div className="usp-info">
              <div className="usp-name">{displayName}</div>
              <div className="usp-meta">
                <span>{added} {bookWord(added)}</span>
                {read > 0 && <span>{read} прочитано</span>}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}

function bookWord(n: number) {
  const m = n % 10, c = n % 100
  if (c >= 11 && c <= 14) return 'книг'
  if (m === 1) return 'книга'
  if (m >= 2 && m <= 4) return 'книги'
  return 'книг'
}
