import './RecommendationCard.scss'
import { Link } from 'react-router-dom'
import { formatDate } from '@/utils'
import TelegramText from './TelegramText'
import type { Recommendation } from '@/types'

interface Props {
  rec: Recommendation
  nameById: Record<number, string>
  /** Off on a member's profile, where the author is already the page's subject */
  showAuthor?: boolean
}

export default function RecommendationCard({ rec, nameById, showAuthor = false }: Props) {
  const savedBy = rec.saved_by_member_id != null ? nameById[rec.saved_by_member_id] : null
  return (
    <article className="rcp-item">
      <header className="rcp-head">
        {showAuthor && (
          <Link to={`/members/${rec.author_member_id}`} className="rcp-author">
            {nameById[rec.author_member_id] ?? 'Участник'}
          </Link>
        )}
        <span className="rcp-date">{formatDate(rec.message_date)}</span>
        <a className="rcp-source" href={rec.message_url} target="_blank" rel="noopener noreferrer">
          в чате ↗
        </a>
      </header>
      <TelegramText className="rcp-text" text={rec.text} entities={rec.entities} />
      <footer className="rcp-foot">
        сохранено {formatDate(rec.created_at)}{savedBy && `, ${savedBy}`}
      </footer>
    </article>
  )
}
