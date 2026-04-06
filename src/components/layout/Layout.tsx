import { useState } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import AccountModal from './AccountModal'
import './Layout.scss'

const navItems = [
  { to: '/dashboard', label: 'Общее' },
  { to: '/books', label: 'Книги' },
  { to: '/authors', label: 'Авторы' },
  { to: '/members', label: 'Участники' },
  { to: '/stats', label: 'Всякая стата' },
  { to: '/polls', label: 'Голосования' },
]

export default function Layout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [showAccount, setShowAccount] = useState(false)

  function handleLogout() {
    logout()
    navigate('/login', { replace: true })
  }

  return (
    <div className="shell">
      <aside className="navigation">
        <div className="brand">Книжный клуб</div>
        <nav className="nav">
          {navItems.map(({ to, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `nav-link${isActive ? ' nav-link--active' : ''}`
              }
            >
              {label}
            </NavLink>
          ))}
        </nav>
        <div className="account-bar">
          <span className="account-name">{user?.name}</span>
          <div className="account-actions">
            <button className="account-btn" onClick={() => setShowAccount(true)} title="Настройки">⚙</button>
            <button className="account-btn" onClick={handleLogout} title="Выйти">→</button>
          </div>
        </div>
      </aside>
      <main className="main">
        <Outlet />
      </main>
      {showAccount && <AccountModal onClose={() => setShowAccount(false)} />}
    </div>
  )
}
