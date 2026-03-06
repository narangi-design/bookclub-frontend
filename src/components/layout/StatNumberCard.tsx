import './StatNumberCard.scss'
interface StatNumberCardProps {
  value: number
  label: string
}
export default function StatNumberCard({ value, label }: StatNumberCardProps) {
  return (
    <div className="stat-card">
      <div className="stat-value">{value}</div>
      <div className="stat-label">{label}</div>
    </div>
  )
}