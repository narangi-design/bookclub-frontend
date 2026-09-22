import { useEffect, useRef, useState } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import { useAuth } from '@/context/AuthContext'
import { usePageTitle } from '@/hooks'
import './LoginPage.scss'

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8000'
const TELEGRAM_BOT_USERNAME = import.meta.env.VITE_TELEGRAM_BOT_USERNAME as string | undefined
const TELEGRAM_BOT_ID = import.meta.env.VITE_TELEGRAM_BOT_ID as string | undefined

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

// EXPERIMENTAL, opt-in only (see the "через редирект" link below the
// widget) — a plain full-page redirect to oauth.telegram.org instead of the
// widget's popup, kept alongside the known-working widget rather than
// replacing it while we figure out why Telegram's instant-auto-confirm
// redirect (when the browser already has a telegram.org session) doesn't
// deliver the auth payload the same way a manual/logged-out request does.
function telegramAuthUrl() {
  const returnTo = `${window.location.origin}/login`
  const params = new URLSearchParams({
    bot_id: TELEGRAM_BOT_ID ?? '',
    origin: window.location.origin,
    request_access: 'write',
    return_to: returnTo,
  })
  return `https://oauth.telegram.org/auth?${params.toString()}`
}

function parseTelegramParams(params: URLSearchParams): TelegramAuthPayload | null {
  if (!params.has('hash')) return null
  return {
    id: Number(params.get('id')),
    first_name: params.get('first_name') ?? undefined,
    last_name: params.get('last_name') ?? undefined,
    username: params.get('username') ?? undefined,
    photo_url: params.get('photo_url') ?? undefined,
    auth_date: Number(params.get('auth_date')),
    hash: params.get('hash') ?? '',
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
  const [tgStatus, setTgStatus] = useState<'idle' | 'loading' | 'success' | 'error' | 'timeout'>('idle')
  const [tgError, setTgError] = useState<string | null>(null)
  const [useFallback, setUseFallback] = useState(false)
  const widgetContainerRef = useRef<HTMLDivElement>(null)
  const tgStatusRef = useRef(tgStatus)
  const wasBlurredRef = useRef(false)

  useEffect(() => {
    tgStatusRef.current = tgStatus
  }, [tgStatus])

  useEffect(() => {
    if (isAuthed) navigate(from, { replace: true })
  }, [isAuthed, navigate, from])

  // Handles the "Войти через Telegram" button's return trip — checks both
  // ?query and #fragment since the instant-auto-confirm case (browser
  // already has a telegram.org session) turned out to use the same query
  // format as a manual/logged-out request, but keeping both is cheap
  // insurance against that changing. If we went to Telegram (flag set right
  // before navigating away, in the button's onClick) and came back with
  // nothing, silently swap in the widget instead of asking the user to
  // notice and pick a fallback themselves.
  useEffect(() => {
    const attempted = sessionStorage.getItem('tg_redirect_attempted') === '1'
    sessionStorage.removeItem('tg_redirect_attempted')

    const tgUser =
      parseTelegramParams(new URLSearchParams(location.search)) ??
      parseTelegramParams(new URLSearchParams(location.hash.replace(/^#/, '')))

    if (!tgUser) {
      if (attempted) setUseFallback(true)
      return
    }

    window.history.replaceState(null, '', location.pathname)

    async function completeLogin() {
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

    completeLogin()
    // Only ever meant to run once, right after a redirect-mode return trip.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // The widget's popup runs on telegram.org — we can't see inside it, so we
  // can't tell a failed/blocked handshake (e.g. Telegram unreachable over a
  // VPN) from the user just not clicking yet. Losing then regaining window
  // focus is a reasonable proxy for "the popup opened and closed": if our
  // callback still hasn't fired shortly after, something went wrong before
  // it ever reached us.
  useEffect(() => {
    if (!TELEGRAM_BOT_USERNAME) return

    function handleBlur() {
      wasBlurredRef.current = true
    }

    function handleFocus() {
      if (!wasBlurredRef.current) return
      wasBlurredRef.current = false
      setTimeout(() => {
        if (tgStatusRef.current === 'idle') setTgStatus('timeout')
      }, 1500)
    }

    window.addEventListener('blur', handleBlur)
    window.addEventListener('focus', handleFocus)
    return () => {
      window.removeEventListener('blur', handleBlur)
      window.removeEventListener('focus', handleFocus)
    }
  }, [])

  const showWidget = !!TELEGRAM_BOT_USERNAME && (useFallback || !TELEGRAM_BOT_ID)

  useEffect(() => {
    if (!showWidget || !widgetContainerRef.current) return

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
  }, [from, login, navigate, queryClient, showWidget])

  function handleTelegramRedirectClick() {
    sessionStorage.setItem('tg_redirect_attempted', '1')
  }

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
        {TELEGRAM_BOT_USERNAME && TELEGRAM_BOT_ID && !useFallback && (
          <a className="login-telegram-button" href={telegramAuthUrl()} onClick={handleTelegramRedirectClick}>
            Войти через Telegram
          </a>
        )}
        {useFallback && <p className="login-tg-status">Пробуем ещё раз...</p>}
        {showWidget && <div className="login-telegram-widget" ref={widgetContainerRef} />}
        {tgStatus === 'loading' && <p className="login-tg-status">Проверяем...</p>}
        {tgStatus === 'success' && <p className="login-tg-status login-tg-status--success">Готово, входим...</p>}
        {tgStatus === 'error' && <p className="login-tg-status login-tg-status--error">{tgError}</p>}
        {tgStatus === 'timeout' && (
          <p className="login-tg-status login-tg-status--error">
            Не удалось связаться с Telegram — проверьте соединение (например, VPN) и попробуйте ещё раз
          </p>
        )}
        {TELEGRAM_BOT_USERNAME && (
          <div className="login-divider"><span>или войдите по старому логину</span></div>
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
