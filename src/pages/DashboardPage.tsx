import { useState } from 'react'
import { useBooks, usePolls, useUsers, useAwardVotes, usePollVotes, usePollRunoffs, useAuthors } from '@/hooks'
import AwardCard from '@/components/dashboard/AwardCard'
import CurrentBook from '@/components/dashboard/CurrentBook'
import './DashboardPage.scss'

const COVER_FORMATS = ['jpg', 'jpeg', 'png', 'webp']

function SmallCover({ bookId, title }: { bookId: number; title: string }) {
  const [attempt, setAttempt] = useState(0)
  if (attempt >= COVER_FORMATS.length) {
    return <div className="recent-cover-placeholder">{title.slice(0, 2)}</div>
  }
  return (
    <img
      key={attempt}
      src={`/covers/${bookId}.${COVER_FORMATS[attempt]}`}
      alt={title}
      className="recent-cover"
      onError={() => setAttempt(a => a + 1)}
    />
  )
}

function formatDate(iso: string) {
  return new Intl.DateTimeFormat('ru-RU', {
    day: 'numeric', month: 'short', year: 'numeric',
  }).format(new Date(iso))
}

interface StatCardProps {
  value: number
  label: string
}
function StatCard({ value, label }: StatCardProps) {
  return (
    <div className="stat-card">
      <div className="stat-value">{value}</div>
      <div className="stat-label">{label}</div>
    </div>
  )
}

export default function DashboardPage() {
  const { data: books      = [] } = useBooks()
  const { data: polls      = [] } = usePolls()
  const { data: users      = [] } = useUsers()
  const { data: awardVotes = [] } = useAwardVotes()
  const { data: pollVotes   = [] } = usePollVotes()
  const { data: pollRunoffs = [] } = usePollRunoffs()
  const { data: authors    = [] } = useAuthors()

  const authorById = Object.fromEntries(authors.map(a => [a.id, a.value]))

  const readBooks   = books.filter(b => b.status === 'read')
  const toReadBooks = books.filter(b => b.status === 'to_read')

  // Current book = most recently elected by date
  const currentBook    = readBooks
    .filter(b => b.elected_at !== null)
    .sort((a, b) => (b.elected_at ?? '').localeCompare(a.elected_at ?? ''))[0]
  const electedPoll    = polls.find(p => p.id === currentBook?.elected_poll_id)
  // If elected via runoff (stage 2), resolve to parent stage-1 poll for stage1Votes
  const currentPoll    = electedPoll?.stage === 2
    ? polls.find(p => p.id === electedPoll.parent_poll_id) ?? electedPoll
    : electedPoll
  const currentAddedBy = users.find(u => u.id === currentBook?.added_by_user_id)
  const currentRunoff  = electedPoll?.stage === 2
    ? pollRunoffs.find(r => r.poll_id === electedPoll.id)
    : undefined

  // Last 5 read books excluding the current one
  const recentBooks = readBooks
    .filter(b => b.elected_at !== null && b.id !== currentBook?.id)
    .sort((a, b) => (b.elected_at ?? '').localeCompare(a.elected_at ?? ''))
    .slice(0, 5)

  const votes2023 = awardVotes.filter(v => v.year === 2023)
  const votes2024 = awardVotes.filter(v => v.year === 2024)

  return (
    <div className="page">
      <h1 className="page-title">Привет, мы книжный клуб!</h1>

      <div className="stats-row">
        <StatCard value={books.length}       label="Книг в списке"      />
        <StatCard value={readBooks.length}   label="Прочитано"          />
        <StatCard value={toReadBooks.length} label="Предстоит прочитать"/>
        <StatCard value={users.length}       label="Активных участников"/>
      </div>

      {currentBook && (
        <section className="section">
          <h2 className="section-title">Сейчас читаем</h2>
          <CurrentBook
            book={currentBook}
            authorName={currentBook.author_id != null ? authorById[currentBook.author_id] : undefined}
            addedByUser={currentAddedBy}
            poll={currentPoll}
            pollVotes={pollVotes}
            runoff={currentRunoff}
            allBooks={books}
          />
        </section>
      )}

      {recentBooks.length > 0 && (
        <section className="section">
          <h2 className="section-title">Последние прочитанные</h2>
          <div className="recent-list">
            {recentBooks.map(book => {
              const addedBy = users.find(u => u.id === book.added_by_user_id)
              const authorName = book.author_id != null ? authorById[book.author_id] : null
              return (
                <div key={book.id} className="recent-item">
                  <SmallCover bookId={book.id} title={book.title} />
                  <div className="recent-info">
                    <div className="recent-title">{book.title}</div>
                    {(authorName || book.country) && (
                      <div className="recent-meta">
                        {[authorName, book.country].filter(Boolean).join(' · ')}
                      </div>
                    )}
                    <div className="recent-footer">
                      {book.elected_at && <span>{formatDate(book.elected_at)}</span>}
                      {addedBy && (
                        <>
                          <span className="recent-dot">·</span>
                          <span>от {addedBy.username}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </section>
      )}

      <section className="section">
        <h2 className="section-title">Премии книжного клуба</h2>
        <div className="awards-grid">
          <AwardCard year={2023} votes={votes2023} books={books} />
          <AwardCard year={2024} votes={votes2024} books={books} />
        </div>
      </section>
    </div>
  )
}
