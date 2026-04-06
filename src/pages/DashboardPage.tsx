import './DashboardPage.scss'
import { useBooks, usePolls, useUsers, useAwardVotes, usePollVotes, useAuthors } from '@/hooks'
import { useAuth } from '@/context/AuthContext'
import AwardCard from '@/components/dashboard/AwardCard'
import CurrentBook from '@/components/dashboard/CurrentBook'
import StatNumberCard from '@/components/layout/StatNumberCard'
import BookCardList from '@/components/layout/BookCardList'


export default function DashboardPage() {
  const { isAuthed } = useAuth()
  const { data: books       = [] } = useBooks()
  const { data: polls       = [] } = usePolls()
  const { data: users       = [] } = useUsers()
  const { data: awardVotes  = [] } = useAwardVotes()
  const { data: pollVotes   = [] } = usePollVotes()
  const { data: authors     = [] } = useAuthors()

  const authorById = Object.fromEntries(authors.map(a => [a.id, a.value]))
  const userById   = Object.fromEntries(users.map(u => [u.id, u.username]))

  const readBooks   = books.filter(b => b.status === 'read')
  const toReadBooks = books.filter(b => b.status === 'to_read')

  // Current book = most recently elected by date
  const currentBook      = readBooks
    .filter(b => b.elected_at !== null)
    .sort((a, b) => (b.elected_at ?? '').localeCompare(a.elected_at ?? ''))[0]
  const electedPoll      = polls.find(p => p.id === currentBook?.elected_poll_id)
  // If elected via runoff (stage 2), resolve to parent stage-1 poll for stage1Votes
  const currentPoll      = electedPoll?.stage === 2
    ? polls.find(p => p.id === electedPoll.parent_poll_id) ?? electedPoll
    : electedPoll
  const currentAddedBy   = users.find(u => u.id === currentBook?.added_by_user_id)
  const currentRunoffPoll = electedPoll?.stage === 2 ? electedPoll : undefined

  // Last 5 read books excluding the current one
  const recentBooks = readBooks
    .filter(b => b.elected_at !== null && b.id !== currentBook?.id)
    .sort((a, b) => (b.elected_at ?? '').localeCompare(a.elected_at ?? ''))
    .slice(0, 6)

  const votes2023 = awardVotes.filter(v => v.year === 2023)
  const votes2024 = awardVotes.filter(v => v.year === 2024)
  const votes2025 = awardVotes.filter(v => v.year === 2025)

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
            runoffPoll={currentRunoffPoll}
            allBooks={books}
          />
        </section>
      )}

      {recentBooks.length > 0 && (
        <section className="section">
          <h2 className="section-title">Последние прочитанные</h2>
          <BookCardList
            books={recentBooks}
            authorById={authorById}
            showCountry
            userById={userById}
            showUser={isAuthed}
          />
        </section>
      )}

      <section className="section">
        <h2 className="section-title">Премии книжного клуба</h2>
        <div className="awards-grid">
          <AwardCard year={2025} votes={votes2025} books={books} authorById={authorById} userById={userById} />
          <AwardCard year={2024} votes={votes2024} books={books} authorById={authorById} userById={userById} />
          <AwardCard year={2023} votes={votes2023} books={books} authorById={authorById} userById={userById} />
        </div>
      </section>
    </div>
  )
}
