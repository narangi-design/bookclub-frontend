import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8000'
const TOKEN_KEY = 'bookclub_token'

interface AuthUser {
  user_id: number
  name: string
}

interface AuthContextType {
  isAuthed: boolean
  isLoading: boolean
  hasToken: boolean
  user: AuthUser | null
  login: (user: AuthUser, token: string) => void
  logout: () => void
  updateUser: (user: AuthUser) => void
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [hasToken] = useState(() => !!localStorage.getItem(TOKEN_KEY))

  useEffect(() => {
    const token = localStorage.getItem(TOKEN_KEY)
    if (!token) {
      setIsLoading(false)
      return
    }
    fetch(`${API_URL}/api/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => res.ok ? res.json() : Promise.reject())
      .then((data: AuthUser) => setUser(data))
      .catch(() => localStorage.removeItem(TOKEN_KEY))
      .finally(() => setIsLoading(false))
  }, [])

  function login(user: AuthUser, token: string) {
    localStorage.setItem(TOKEN_KEY, token)
    setUser(user)
  }

  function logout() {
    localStorage.removeItem(TOKEN_KEY)
    setUser(null)
  }

  function updateUser(user: AuthUser) {
    setUser(user)
  }

  return (
    <AuthContext.Provider value={{ isAuthed: user !== null, isLoading, hasToken, user, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
