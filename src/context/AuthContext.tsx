import { createContext, useContext, useState, type ReactNode } from 'react'

interface AuthUser {
  user_id: number
  name: string
}

interface AuthContextType {
  isAuthed: boolean
  user: AuthUser | null
  login: (user: AuthUser) => void
  logout: () => void
  updateUser: (user: AuthUser) => void
}

const AuthContext = createContext<AuthContextType | null>(null)

const STORAGE_KEY = 'bookclub_auth'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() => {
    const stored = localStorage.getItem(STORAGE_KEY)
    return stored ? JSON.parse(stored) : null
  })

  function login(user: AuthUser) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(user))
    setUser(user)
  }

  function logout() {
    localStorage.removeItem(STORAGE_KEY)
    setUser(null)
  }

  function updateUser(user: AuthUser) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(user))
    setUser(user)
  }

  return (
    <AuthContext.Provider value={{ isAuthed: user !== null, user, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
