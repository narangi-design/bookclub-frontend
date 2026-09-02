# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

A web dashboard for a book club — tracks the current read, voting history, and club statistics across 19 charts. Part of the Book Club project; data comes from a separate `bookclub-api` backend (also consumed by a Telegram bot), so **this repo has no backend code** — all data access goes through `VITE_API_URL`.

All club content (book titles, member names, UI labels) is in Russian. Match that when adding user-facing strings.

## Commands

```bash
npm run dev       # dev server (Vite)
npm run build     # tsc -b && vite build — type-checks before bundling
npm run lint      # ESLint over the whole project
npm run preview   # preview a production build
npm test          # vitest (watch mode)
npm run test:ui   # vitest with the browser UI
```

To run a single test file: `npx vitest run src/utils/index.test.ts`. There is currently one test file, covering `src/utils/index.ts`.

Requires a `.env.local` with `VITE_API_URL=<bookclub-api base URL>` (falls back to `http://localhost:8000` if unset).

## Architecture

### Data flow: api → hooks → components

Every resource (`books`, `polls`, `poll-votes`, `award-votes`, `award-events`, `members`, `authors`) follows a strict three-layer pipeline, each layer in a single `index.ts`/`index.tsx` (not one file per resource):

- **`src/api/index.ts`** — raw `fetch` wrappers, one function per endpoint (`fetchBooks`, `fetchPolls`, ...). Two helpers underpin them: `get` (public) and `authGet` (attaches `Authorization: Bearer <token>` from `localStorage['bookclub_token']`, throws on non-OK). Only `members` uses `authGet`; everything else is public.
- **`src/hooks/index.ts`** — one TanStack Query hook per fetch function (`useBooks`, `usePolls`, ...), each with a fixed `queryKey`. `useMemberVisibility()` (blur vs visible) derives from `useAuth().hasToken`.
- **Components/pages** consume only the hooks — never call `api/` or `fetch` directly.

Query caching is global in [App.tsx](src/App.tsx): a single `QueryClient` (`staleTime` 5 min, `gcTime` 24 h) is wrapped in `PersistQueryClientProvider` with a `localStorage` sync persister, so query results survive page reloads.

### Auth

[AuthContext](src/context/AuthContext.tsx) owns the JWT (`localStorage['bookclub_token']`) and current user. On mount it validates any stored token against `/api/auth/me` and clears it on failure. `PrivateRoute` in [App.tsx](src/App.tsx) gates `/members`, `/members/:id`, and `/stats` behind `isAuthed`, redirecting to `/login` with the origin path in router state. `hasToken` (token present, not yet validated) is distinct from `isAuthed` (validated) — `useMemberVisibility` intentionally uses the weaker `hasToken` check to decide whether to blur member names.

### Computation lives in utils, not components

[src/utils/index.ts](src/utils/index.ts) holds all data-shaping/aggregation functions consumed by chart and stat components (grouping by year/month, top-N rankings, poll-competitiveness ratios, sankey/treemap/sunburst/radar shaping, etc.). Chart components in `src/components/charts/` are thin: they take already-shaped data and render Recharts primitives. When adding a new chart, add its data function to `utils/index.ts` (with a unit test) rather than computing inline in the component.

### Charts

All charts go through Recharts, centralized in [src/components/charts/index.tsx](src/components/charts/index.tsx): shared color palette (`diagramColors`), tooltip style (`TT_STYLE`), and axis/grid presets (`TICK`, `GRID_V/H`, `AXIS`, ...) live at the top of that file — reuse them instead of restyling per-chart so all 19 charts stay visually consistent.

### Poll structure (two-stage runoffs)

A `Poll` has `stage` (1 or 2) and `parent_poll_id` (null for stage 1, pointing at the stage-1 poll for a stage-2 runoff). The frontend joins these client-side — there's no backend join: a two-round poll is displayed as one session on `/polls`, and the winner is read from the runoff's `winner_book_id` if present, else the stage-1 poll's. See `sortedPolls`, `topRunnerUps`, and `sankeyNominationData` in `utils/index.ts` for how stage/parent relationships are traversed.

### Routing & path alias

React Router v7, routes declared in [App.tsx](src/App.tsx). `@/` is aliased to `src/` in both `vite.config.ts` and `tsconfig.app.json` — use it for all internal imports.

### Styles

CSS Modules (`.scss` via `sass`, scoped per component) — no global utility classes. Each component owns its own stylesheet next to it.

### `gen_authors.cjs`

A standalone one-off Node script (not part of the app build) for normalizing author-name variants in the source data — a large `CANONICAL` lookup table mapping raw/alternate spellings to a canonical "Имя Фамилия" form. Not imported by the frontend; run manually with `node gen_authors.cjs` if regenerating author data.
