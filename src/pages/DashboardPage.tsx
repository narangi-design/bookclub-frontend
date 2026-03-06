import './DashboardPage.scss'
import { useBooks, usePolls, useUsers, useAwardVotes, usePollVotes, usePollRunoffs, useAuthors } from '@/hooks'
import AwardCard from '@/components/dashboard/AwardCard'
import CurrentBook from '@/components/dashboard/CurrentBook'
import StatNumberCard from '@/components/layout/StatNumberCard'
import BookCard from '@/components/layout/BookCard'


export default function DashboardPage() {
  const { data: books       = [] } = useBooks()
  const { data: polls       = [] } = usePolls()
  const { data: users       = [] } = useUsers()
  const { data: awardVotes  = [] } = useAwardVotes()
  const { data: pollVotes   = [] } = usePollVotes()
  const { data: pollRunoffs = [] } = usePollRunoffs()
  const { data: authors     = [] } = useAuthors()

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
        <StatNumberCard value={books.length}       label="Книг в списке"      />
        <StatNumberCard value={readBooks.length}   label="Прочитано"          />
        <StatNumberCard value={toReadBooks.length} label="Предстоит прочитать"/>
        <StatNumberCard value={users.length}       label="Активных участников"/>
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
              const authorName = [
                book.author_id != null ? authorById[book.author_id] : null,
                book.country,
              ].filter(Boolean).join(' · ') || undefined
              return (
                <BookCard
                  key={book.id}
                  book={book}
                  authorName={authorName}
                  showUser
                  userName={addedBy?.username}
                />
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
