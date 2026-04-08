import './StatNumberCard.scss'
interface StatNumberCardProps {
  value: number
  label: string
  blur?: boolean
}
export default function StatNumberCard({ value, label, blur }: StatNumberCardProps) {
  return (
    <div className="stat-card">
      <div className={`stat-value${blur ? ' member-blur' : ''}`}>
        {blur ? '···' : value}
      </div>
      <div className="stat-label">{label}</div>
    </div>
  )
}