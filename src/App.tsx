import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
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

const queryClient = new QueryClient()

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="books" element={<BooksPage />} />
            <Route path="books/:id" element={<BookPage />} />
            <Route path="authors" element={<AuthorsPage />} />
            <Route path="authors/:id" element={<AuthorPage />} />
            <Route path="users" element={<UsersPage />} />
            <Route path="users/:id" element={<UserPage />} />
            <Route path="polls" element={<PollsPage />} />
            <Route path="stats" element={<StatsPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  )
}