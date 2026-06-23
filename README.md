# bookclub-frontend

A web dashboard for a book club. Tracks the current read, voting history, and club statistics across 19 charts.

Part of the [Book Club](https://github.com/stars/narangi-design/lists/book-club) project — data comes from [Book Club API](https://github.com/narangi-design/bookclub-api), which is also used by the [Telegram Bot](https://github.com/narangi-design/bookclub-chatbot).

> All club content (book titles, member names, UI labels) is in Russian.

---

## Stack

- **React 19** + **TypeScript**
- **Vite** — build tool and dev server
- **React Router v7** — routing
- **TanStack Query v5** — data fetching and caching
- **Recharts 3** — all charts
- **Radix UI** — Select, Tabs, Collapsible
- **CSS Modules** — scoped styles

---

## Pages

| Route | Description |
|---|---|
| `/dashboard` | Current book, recent reads, yearly chart, awards |
| `/books` | Full book list with status filtering |
| `/books/:id` | Individual book page |
| `/authors` | All authors |
| `/authors/:id` | Individual author page |
| `/members` | All club members |
| `/members/:id` | Individual member page |
| `/polls` | Voting history — single-round and runoff polls, winners highlighted |
| `/stats` | 19 charts covering books, polls, and members |

Member pages show personal voting history and stats and are only accessible when logged in. Login is handled via `/login` with a JWT token stored in context.

---

## Getting started

**Prerequisites:** [Node.js](https://nodejs.org/) v18+

```bash
npm install
npm run dev
```

```bash
npm run build    # production build
npm run preview  # preview the build
npm run lint     # ESLint
```

Required `.env.local`:
```
VITE_API_URL=https://your-api.vercel.app
```

---

## Technical decisions

### Data fetching
TanStack Query fetches all data from `bookclub-api`. Each resource (`books`, `polls`, `members`, ...) has its own hook in `src/hooks/`. Components never fetch directly — everything goes through the hook layer.

### Charts
All charts use Recharts. Chart-specific computation (grouping, aggregation) lives in `src/utils/` rather than in components, so the chart components themselves are thin wrappers around data that's already shaped correctly.

### Styles
CSS Modules with scoped class names. No global utility classes. Each component owns its styles.

### Poll display
Two-round polls (with a runoff) are grouped into a single session on the polls page. The winner is read from the runoff poll's `winner_book_id` if it exists, falling back to the first-round poll. This happens entirely in the frontend without a join on the backend.

---

## File structure

```
src/
  api/          # Fetch functions (one per resource)
  hooks/        # React Query hooks
  types/        # TypeScript interfaces
  utils/        # Data computation for charts and stats
  context/      # AuthContext — JWT token, current user
  components/
    charts/     # Reusable chart components
    dashboard/  # CurrentBook, AwardCard
    layout/     # App shell, navigation, shared UI
    polls/      # PollCard
  pages/        # DashboardPage, BooksPage, BookPage,
                # AuthorsPage, AuthorPage,
                # MembersPage, MemberPage,
                # PollsPage, StatsPage, LoginPage
```

---

## Future improvements

- Mobile responsive layout
- Sortable and filterable book table
- Pagination or virtual scroll for long lists
