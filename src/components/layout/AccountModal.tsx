import { useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import './AccountModal.scss'

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8000'

interface Props {
  onClose: () => void
}

export default function AccountModal({ onClose }: Props) {
  const { user, updateUser } = useAuth()

  const [newUsername, setNewUsername] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [currentPassword, setCurrentPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!newUsername && !newPassword) {
      setError('Укажите новый никнейм или новый пароль')
      return
    }
    setLoading(true)
    setError(null)
    setSuccess(false)

    const token = localStorage.getItem('bookclub_token')
    const res = await fetch(`${API_URL}/api/auth/me`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        current_password: currentPassword,
        new_username: newUsername || undefined,
        new_password: newPassword || undefined,
      }),
    })

    setLoading(false)

    if (res.ok) {
      const data = await res.json()
      updateUser({ user_id: data.user_id, name: data.name })
      setSuccess(true)
      setNewUsername('')
      setNewPassword('')
      setCurrentPassword('')
    } else {
      const data = await res.json().catch(() => ({}))
      setError(data.detail ?? 'Что-то пошло не так')
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">Настройки аккаунта</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <form className="modal-form" onSubmit={handleSubmit}>
          <label className="modal-label">
            Новый никнейм
            <input
              className="modal-input"
              type="text"
              value={newUsername}
              onChange={e => setNewUsername(e.target.value)}
              placeholder={user?.name}
            />
          </label>

          <label className="modal-label">
            Новый пароль
            <input
              className="modal-input"
              type="password"
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
              placeholder="Оставьте пустым, чтобы не менять"
            />
          </label>

          <label className="modal-label">
            Текущий пароль <span className="modal-required">*</span>
            <input
              className="modal-input"
              type="password"
              value={currentPassword}
              onChange={e => setCurrentPassword(e.target.value)}
              required
            />
          </label>

          {error && <p className="modal-error">{error}</p>}
          {success && <p className="modal-success">Сохранено</p>}

          <button className="modal-button" type="submit" disabled={loading}>
            {loading ? 'Сохраняем...' : 'Сохранить'}
          </button>
        </form>
      </div>
    </div>
  )
}
