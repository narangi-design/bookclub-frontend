import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AuthProvider, useAuth } from '@/context/AuthContext'
import Layout from '@/components/layout/Layout'
import DashboardPage from '@/pages/DashboardPage'
import BooksPage from '@/pages/BooksPage'
import BookPage from '@/pages/BookPage'
import AuthorPage from '@/pages/AuthorPage'
import AuthorsPage from '@/pages/AuthorsPage'
import UsersPage from '@/pages/UsersPage'
import UserPage from '@/pages/UserPage'
import PollsPage from '@/pages/PollsPage'
import StatsPage from '@/pages/StatsPage'
import LoginPage from '@/pages/LoginPage'

const queryClient = new QueryClient()

function PrivateRoute() {
  const { isAuthed } = useAuth()
  return isAuthed ? <Outlet /> : <Navigate to="/login" replace />
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
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
                <Route path="users" element={<UsersPage />} />
                <Route path="users/:id" element={<UserPage />} />
                <Route path="stats" element={<StatsPage />} />
              </Route>
            </Route>
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  )
}
