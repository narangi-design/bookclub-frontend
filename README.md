# book-worm

A web dashboard for a book club. Tracks the current book, reading history, poll results, and club statistics.

## Stack

- **React 19** + **TypeScript**
- **Vite** — build tool and dev server
- **React Router v7** — routing (`/dashboard`, `/books`, `/polls`, `/stats`)
- **TanStack Query v5** — data fetching and caching
- **Recharts 3** — all charts
- **Radix UI** — Select, Tabs, Collapsible
- **CSS Modules** — scoped styles

## Pages

| Route | Description |
|---|---|
| `/dashboard` | Overview: current book, recent reads, awards, yearly chart |
| `/books` | Full book list with status filtering |
| `/polls` | Voting history with results |
| `/stats` | 19 charts covering books, polls, and members |

## Project structure

```
src/
├── api/          # Data fetching layer (fetchBooks, fetchPolls, ...)
├── mocks/        # Mock data (temporary, replaces real API)
├── hooks/        # React Query hooks (useBooks, usePolls, ...)
├── types/        # TypeScript interfaces
├── utils/        # Computation helpers for charts and stats
├── components/
│   ├── charts/   # Reusable chart components
│   ├── dashboard/# CurrentBook, AwardCard
│   └── layout/   # App shell with navigation
└── pages/        # DashboardPage, BooksPage, PollsPage, StatsPage
```

## Getting started

```bash
npm install
npm run dev
```

```bash
npm run build    # production build
npm run preview  # preview the build
npm run lint     # run ESLint
```

## Data

Data currently comes from mocks in `src/mocks/`. To connect a real API, only `src/api/index.ts` needs to change — all hooks and components stay untouched.

Planned architecture: Telegram bot (Java Spring Boot) → PostgreSQL → REST API → this frontend.
