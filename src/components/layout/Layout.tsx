import { NavLink, Outlet } from 'react-router-dom'
import './Layout.scss'

const navItems = [
  { to: '/dashboard', label: 'Общее' },
  { to: '/books', label: 'Книги' },
  { to: '/authors', label: 'Авторы' },
  { to: '/users', label: 'Участники' },
  { to: '/stats', label: 'Всякая стата' },
  { to: '/polls', label: 'Голосования' },
]

export default function Layout() {
  return (
    <div className="shell">
      <aside className="sidebar">
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
      </aside>
      <main className="main">
        <Outlet />
      </main>
    </div>
  )
}
