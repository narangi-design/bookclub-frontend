import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import './LoginPage.scss'

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8000'

export default function LoginPage() {
  const { login, isAuthed } = useAuth()
  const navigate = useNavigate()
  const widgetRef = useRef<HTMLDivElement>(null)
  const [error, setError] = useState<string | null>(null)

  // Handle redirect-mode callback: Telegram redirects back with params in URL
  useEffect(() => {
    if (isAuthed) {
      navigate('/dashboard', { replace: true })
      return
    }

    const params = Object.fromEntries(new URLSearchParams(window.location.search))
    if (params.hash) {
      fetch(`${API_URL}/api/auth/telegram`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...params,
          id: Number(params.id),
          auth_date: Number(params.auth_date),
        }),
      }).then(res => {
        if (res.ok) return res.json()
        if (res.status === 403) throw new Error('Нет доступа. Обратитесь к администратору.')
        throw new Error('Ошибка авторизации. Попробуйте ещё раз.')
      }).then(data => {
        login({ telegram_id: data.telegram_id, name: data.name })
        navigate('/dashboard', { replace: true })
      }).catch(e => setError(e.message))
      return
    }

    // Inject widget in redirect mode
    const script = document.createElement('script')
    script.src = 'https://telegram.org/js/telegram-widget.js?22'
    script.setAttribute('data-telegram-login', 'EliteBookClubBot')
    script.setAttribute('data-size', 'large')
    script.setAttribute('data-auth-url', `${window.location.origin}/login`)
    script.setAttribute('data-request-access', 'write')
    script.async = true
    widgetRef.current?.appendChild(script)
  }, [isAuthed, login, navigate])

  return (
    <div className="login-page">
      <div className="login-card">
        <h1 className="login-title">Книжный клуб</h1>
        <p className="login-subtitle">Войдите через Telegram чтобы получить доступ</p>
        <div ref={widgetRef} className="login-widget" />
        {error && <p className="login-error">{error}</p>}
      </div>
    </div>
  )
}
