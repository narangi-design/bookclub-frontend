import { useEffect, useState } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import './LoginPage.scss'

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8000'

export default function LoginPage() {
  const { login, isAuthed } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (isAuthed) navigate('/dashboard', { replace: true })
  }, [isAuthed, navigate])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const res = await fetch(`${API_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    })

    setLoading(false)

    if (res.ok) {
      const data = await res.json()
      login({ user_id: data.user_id, name: data.name }, data.access_token)
      navigate('/dashboard', { replace: true })
    } else {
      setError('Неверный логин или пароль')
    }
  }

  const canGoBack = location.key !== 'default'

  return (
    <div className="login-page">
      <nav className="login-nav">
        {canGoBack && (
          <button className="login-nav-back" onClick={() => navigate(-1)}>← Назад</button>
        )}
        <Link to="/dashboard" className="login-nav-home">На главную</Link>
      </nav>

      <div className="login-card">
        <div className="login-header">
          <h1 className="login-title">Книжный клуб</h1>
          <p className="login-subtitle">Войдите, чтобы видеть имена участников</p>
        </div>
        <form className="login-form" onSubmit={handleSubmit}>
          <input
            className="login-input"
            type="text"
            placeholder="Логин"
            value={username}
            onChange={e => setUsername(e.target.value)}
            required
          />
          <input
            className="login-input"
            type="password"
            placeholder="Пароль"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
          />
          <button className="login-button" type="submit" disabled={loading}>
            {loading ? 'Входим...' : 'Войти'}
          </button>
        </form>
        {error && <p className="login-error">{error}</p>}
      </div>
    </div>
  )
}
