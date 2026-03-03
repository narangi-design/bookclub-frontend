import { NavLink, Outlet } from 'react-router-dom'
import styles from './Layout.module.css'

const navItems = [
  { to: '/dashboard', label: 'Общее' },
  { to: '/books', label: 'Книги' },
  { to: '/stats', label: 'Всякая стата' },
  { to: '/polls', label: 'Голосования' },
]

export default function Layout() {
  return (
    <div className={styles.shell}>
      <aside className={styles.sidebar}>
        <div className={styles.brand}>Книжный клуб</div>
        <nav className={styles.nav}>
          {navItems.map(({ to, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `${styles.navLink} ${isActive ? styles.navLinkActive : ''}`
              }
            >
              {label}
            </NavLink>
          ))}
        </nav>
      </aside>
      <main className={styles.main}>
        <Outlet />
      </main>
    </div>
  )
}