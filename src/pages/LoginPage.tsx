import { useEffect, useRef, useState } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import { useAuth } from '@/context/AuthContext'
import { usePageTitle } from '@/hooks'
import './LoginPage.scss'

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8000'
const TELEGRAM_BOT_USERNAME = import.meta.env.VITE_TELEGRAM_BOT_USERNAME as string | undefined

interface TelegramAuthPayload {
  id: number
  first_name?: string
  last_name?: string
  username?: string
  photo_url?: string
  auth_date: number
  hash: string
}

declare global {
  interface Window {
    onTelegramAuth?: (user: TelegramAuthPayload) => void
  }
}

export default function LoginPage() {
  usePageTitle('Авторизоваться в элитном книжном клубе')
  const { login, isAuthed } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const queryClient = useQueryClient()
  const from = (location.state as { from?: string })?.from ?? '/dashboard'
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [tgStatus, setTgStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [tgError, setTgError] = useState<string | null>(null)
  const widgetContainerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (isAuthed) navigate(from, { replace: true })
  }, [isAuthed, navigate, from])

  useEffect(() => {
    if (!TELEGRAM_BOT_USERNAME || !widgetContainerRef.current) return

    window.onTelegramAuth = async (tgUser: TelegramAuthPayload) => {
      setTgStatus('loading')
      setTgError(null)

      const res = await fetch(`${API_URL}/api/auth/telegram-login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(tgUser),
      })

      if (res.ok) {
        const data = await res.json()
        setTgStatus('success')
        login({ user_id: data.user_id, name: data.name, auth_method: 'telegram' }, data.access_token)
        await queryClient.invalidateQueries()
        navigate(from, { replace: true })
      } else {
        const data = await res.json().catch(() => ({}))
        setTgStatus('error')
        setTgError(data.detail ?? 'Не удалось войти через Telegram')
      }
    }

    const script = document.createElement('script')
    script.src = 'https://telegram.org/js/telegram-widget.js?22'
    script.async = true
    script.setAttribute('data-telegram-login', TELEGRAM_BOT_USERNAME)
    script.setAttribute('data-size', 'large')
    script.setAttribute('data-radius', '0')
    script.setAttribute('data-userpic', 'false')
    script.setAttribute('data-onauth', 'onTelegramAuth(user)')
    script.setAttribute('data-request-access', 'write')
    widgetContainerRef.current.appendChild(script)

    return () => {
      delete window.onTelegramAuth
    }
  }, [from, login, navigate, queryClient])

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
      login({ user_id: data.user_id, name: data.name, auth_method: 'password' }, data.access_token)
      await queryClient.invalidateQueries()
      navigate(from, { replace: true })
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
          <p className="login-subtitle">Войдите, чтобы видеть ссылки на записи заседаний и имена участников</p>
        </div>
        {TELEGRAM_BOT_USERNAME && (
          <>
            <div className="login-telegram-widget" ref={widgetContainerRef} />
            {tgStatus === 'loading' && <p className="login-tg-status">Проверяем...</p>}
            {tgStatus === 'success' && <p className="login-tg-status login-tg-status--success">Готово, входим...</p>}
            {tgStatus === 'error' && <p className="login-tg-status login-tg-status--error">{tgError}</p>}
            <div className="login-divider"><span>или войдите по старому логину</span></div>
          </>
        )}
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
