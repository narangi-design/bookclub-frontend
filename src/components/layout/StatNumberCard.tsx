import './StatNumberCard.scss'
import { Link } from 'react-router-dom'

interface StatNumberCardProps {
  value: number
  label: string
  blur?: boolean
  href?: string
}
export default function StatNumberCard({ value, label, blur, href }: StatNumberCardProps) {
  const content = (
    <>
      <div className={`stat-value${blur ? ' member-blur' : ''}`}>
        {blur ? '···' : value}
      </div>
      <div className="stat-label">{label}</div>
    </>
  )
  return href
    ? <Link to={href} className="stat-card">{content}</Link>
    : <div className="stat-card">{content}</div>
}