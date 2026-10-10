import './RecommendationsPage.scss'
import { useState } from 'react'
import { useMembers, useRecommendations, usePageTitle } from '@/hooks'
import { memberName } from '@/utils'
import FilterBar from '@/components/layout/FilterBar'
import RecommendationCard from '@/components/recommendations/RecommendationCard'

type SortKey = 'message_date' | 'created_at'

const SORT_OPTIONS: { key: SortKey; label: string }[] = [
  { key: 'message_date', label: 'По дате сообщения' },
  { key: 'created_at', label: 'По дате добавления' },
]

export default function RecommendationsPage() {
  usePageTitle('Рекомендации')
  const { data: recommendations = [] } = useRecommendations()
  const { data: members = [] } = useMembers()
  const [sortKey, setSortKey] = useState<SortKey>('message_date')
  const [author, setAuthor] = useState('all')

  const nameById = Object.fromEntries(members.map(m => [m.id, memberName(m)]))
  const byAuthor = Object.groupBy(recommendations, r => r.author_member_id)

  const authorOptions = [
    { key: 'all', label: 'Все', count: recommendations.length },
    ...Object.entries(byAuthor)
      .map(([id, recs]) => ({ key: id, label: nameById[Number(id)] ?? 'Участник', count: recs?.length ?? 0 }))
      .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label)),
  ]

  const shown = (author === 'all' ? recommendations : byAuthor[Number(author)] ?? [])
    .toSorted((a, b) => Date.parse(b[sortKey]) - Date.parse(a[sortKey]))

  return (
    <div className="page">
      <h1 className="page-title">Рекомендации</h1>

      {recommendations.length === 0 ? (
        <p className="rcp-empty">
          Пока пусто. Ответь в чате клуба командой /recommend на сообщение с рекомендацией — и оно появится здесь.
        </p>
      ) : (
        <>
          <FilterBar options={authorOptions} value={author} onChange={setAuthor} />

          <div className="filter-row rcp-sort">
            {SORT_OPTIONS.map(({ key, label }) => (
              <button
                key={key}
                className={`filter-btn${sortKey === key ? ' filter-btn--active' : ''}`}
                onClick={() => setSortKey(key)}
              >
                {label}
              </button>
            ))}
          </div>

          <div className="rcp-list">
            {shown.map(r => (
              <RecommendationCard key={r.id} rec={r} nameById={nameById} showAuthor />
            ))}
          </div>
        </>
      )}
    </div>
  )
}
