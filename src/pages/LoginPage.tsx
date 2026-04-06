import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import './LoginPage.scss'

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8000'

declare global {
  interface Window {
    onTelegramAuth: (user: Record<string, unknown>) => void
  }
}

export default function LoginPage() {
  const { login, isAuthed } = useAuth()
  const navigate = useNavigate()
  const widgetRef = useRef<HTMLDivElement>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (isAuthed) {
      navigate('/dashboard', { replace: true })
      return
    }

    window.onTelegramAuth = async (user) => {
      const res = await fetch(`${API_URL}/api/auth/telegram`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(user),
      })

      if (res.ok) {
        const data = await res.json()
        login({ telegram_id: data.telegram_id, name: data.name })
        navigate('/dashboard', { replace: true })
      } else if (res.status === 403) {
        setError('Нет доступа. Обратитесь к администратору.')
      } else {
        setError('Ошибка авторизации. Попробуйте ещё раз.')
      }
    }

    const script = document.createElement('script')
    script.src = 'https://telegram.org/js/telegram-widget.js?22'
    script.setAttribute('data-telegram-login', 'EliteBookClubBot')
    script.setAttribute('data-size', 'large')
    script.setAttribute('data-onauth', 'onTelegramAuth(user)')
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
