import { BrowserRouter, Routes, Route, Navigate, Outlet, useLocation } from 'react-router-dom'
import { QueryClient } from '@tanstack/react-query'
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client'
import { createSyncStoragePersister } from '@tanstack/query-sync-storage-persister'
import { AuthProvider, useAuth } from '@/context/AuthContext'
import Layout from '@/components/layout/Layout'
import DashboardPage from '@/pages/DashboardPage'
import BooksPage from '@/pages/BooksPage'
import BookPage from '@/pages/BookPage'
import AuthorPage from '@/pages/AuthorPage'
import AuthorsPage from '@/pages/AuthorsPage'
import MembersPage from '@/pages/MembersPage'
import MemberPage from '@/pages/MemberPage'
import PollsPage from '@/pages/PollsPage'
import StatsPage from '@/pages/StatsPage'
import LoginPage from '@/pages/LoginPage'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      gcTime: 1000 * 60 * 60 * 24, // 24h — сколько кеш живёт в localStorage
      staleTime: 1000 * 60 * 5,    // 5min — когда данные считаются устаревшими
    },
  },
})

const persister = createSyncStoragePersister({ storage: window.localStorage })

function PrivateRoute() {
  const { isAuthed, isLoading } = useAuth()
  const location = useLocation()
  if (isLoading) return null
  return isAuthed ? <Outlet /> : <Navigate to="/login" state={{ from: location.pathname }} replace />
}

export default function App() {
  return (
    <PersistQueryClientProvider client={queryClient} persistOptions={{ persister }}>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/" element={<Layout />}>
              <Route index element={<Navigate to="/dashboard" replace />} />
              <Route path="dashboard" element={<DashboardPage />} />
              <Route path="books" element={<BooksPage />} />
              <Route path="books/:id" element={<BookPage />} />
              <Route path="authors" element={<AuthorsPage />} />
              <Route path="authors/:id" element={<AuthorPage />} />
              <Route path="polls" element={<PollsPage />} />
              <Route element={<PrivateRoute />}>
                <Route path="members" element={<MembersPage />} />
                <Route path="members/:id" element={<MemberPage />} />
                <Route path="stats" element={<StatsPage />} />
              </Route>
            </Route>
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </PersistQueryClientProvider>
  )
}
