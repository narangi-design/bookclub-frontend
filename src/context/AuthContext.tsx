import { createContext, useContext, useState, useEffect, useCallback, useMemo, type ReactNode } from 'react'

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8000'
const TOKEN_KEY = 'bookclub_token'

interface AuthUser {
  user_id: number
  name: string
  auth_method: 'password' | 'telegram'
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
  const [isLoading, setIsLoading] = useState(() => !!localStorage.getItem(TOKEN_KEY))
  const [hasToken, setHasToken] = useState(() => !!localStorage.getItem(TOKEN_KEY))

  useEffect(() => {
    const token = localStorage.getItem(TOKEN_KEY)
    if (!token) return
    fetch(`${API_URL}/api/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => res.ok ? res.json() : Promise.reject())
      .then((data: AuthUser) => setUser(data))
      .catch(() => localStorage.removeItem(TOKEN_KEY))
      .finally(() => setIsLoading(false))
  }, [])

  const login = useCallback((user: AuthUser, token: string) => {
    localStorage.setItem(TOKEN_KEY, token)
    setUser(user)
    setHasToken(true)
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY)
    setUser(null)
    setHasToken(false)
  }, [])

  const updateUser = useCallback((user: AuthUser) => {
    setUser(user)
  }, [])

  const value = useMemo(
    () => ({ isAuthed: user !== null, isLoading, hasToken, user, login, logout, updateUser }),
    [user, isLoading, hasToken, login, logout, updateUser]
  )

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
