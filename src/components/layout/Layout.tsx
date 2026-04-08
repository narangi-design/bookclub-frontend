import { useState } from 'react'
import { NavLink, Outlet, useNavigate, Link } from 'react-router-dom'
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

const bottomMainItems = [
  { to: '/dashboard', label: 'Главная' },
  { to: '/books', label: 'Книги' },
  { to: '/authors', label: 'Авторы' },
]

const bottomDrawerItems = [
  { to: '/members', label: 'Участники' },
  { to: '/stats', label: 'Всякая стата' },
  { to: '/polls', label: 'Голосования' },
]

export default function Layout() {
  const { user, isAuthed, logout } = useAuth()
  const navigate = useNavigate()
  const [showAccount, setShowAccount] = useState(false)
  const [showDrawer, setShowDrawer] = useState(false)

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
        {isAuthed ? (
          <div className="account-bar">
            <span className="account-name">{user?.name}</span>
            <div className="account-actions">
              <button className="account-btn" onClick={() => setShowAccount(true)} title="Настройки">⚙</button>
              <button className="account-btn" onClick={handleLogout} title="Выйти">→</button>
            </div>
          </div>
        ) : (
          <div className="auth-hint">
            <p className="auth-hint-text">Без авторизации мы не показываем имена участников</p>
            <Link to="/login" className="login-link">Войти</Link>
          </div>
        )}
      </aside>

      <main className="main">
        <Outlet />
      </main>

      {/* Mobile bottom nav */}
      <nav className="bottom-nav">
        {bottomMainItems.map(({ to, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `bottom-nav-item${isActive ? ' bottom-nav-item--active' : ''}`
            }
          >
            {label}
          </NavLink>
        ))}

        <button
          className={`bottom-nav-item bottom-nav-item--burger${showDrawer ? ' bottom-nav-item--active' : ''}`}
          onClick={() => setShowDrawer(v => !v)}
        >
          ☰
        </button>

        {isAuthed ? (
          <button className="bottom-nav-item bottom-nav-item--auth" onClick={() => setShowAccount(true)}>
            <span className="bottom-nav-auth-name">{user?.name}</span>
          </button>
        ) : (
          <Link to="/login" className="bottom-nav-item">
            Войти
          </Link>
        )}
      </nav>

      {/* Burger drawer */}
      {showDrawer && (
        <div className="drawer-overlay" onClick={() => setShowDrawer(false)}>
          <div className="drawer" onClick={e => e.stopPropagation()}>
            {bottomDrawerItems.map(({ to, label }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  `drawer-link${isActive ? ' drawer-link--active' : ''}`
                }
                onClick={() => setShowDrawer(false)}
              >
                {label}
              </NavLink>
            ))}
          </div>
        </div>
      )}

      {showAccount && <AccountModal onClose={() => setShowAccount(false)} />}
    </div>
  )
}
