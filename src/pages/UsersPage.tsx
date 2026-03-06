import './UsersPage.scss'
import { Link } from 'react-router-dom'
import { useBooks, useUsers } from '@/hooks'

export default function UsersPage() {
  const { data: users = [] } = useUsers()
  const { data: books = [] } = useBooks()

  const booksByUser = Object.groupBy(books, b => b.added_by_user_id ?? -1)

  const rows = users.map(user => {
    const added = booksByUser[user.id] ?? []
    const read  = added.filter(b => b.status === 'read').length
    return { user, added: added.length, read }
  }).sort((a, b) => b.added - a.added || a.user.username.localeCompare(b.user.username))

  return (
    <div className="page">
      <h1 className="page-title">Участники</h1>

      <div className="usp-list">
        {rows.map(({ user, added, read }) => (
          <Link key={user.id} to={`/users/${user.id}`} className="usp-item">
            <div className="usp-avatar">{user.username.slice(0, 2).toUpperCase()}</div>
            <div className="usp-info">
              <div className="usp-name">{user.username}</div>
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
