import './CoverImage.scss'
import { useState } from 'react'

const SUPABASE_COVERS = 'https://ovigdecypjaknjmazawc.supabase.co/storage/v1/object/public/covers'

interface Props {
  coverSize: "small" | "default" | "large"
  bookId: number
  title: string
}

export default function CoverImage({ coverSize, bookId, title }: Props) {
  const [error, setError] = useState(false)

  if (error) {
    return (
      <div className={`cover-placeholder cover-placeholder--${coverSize}`}>
        <span className="cover-initials">{title.slice(0, 2)}</span>
      </div>
    )
  }
  return (
    <img
      src={`${SUPABASE_COVERS}/${bookId}.webp`}
      alt={title}
      className={`${coverSize}-book-cover`}
      onError={() => setError(true)}
    />
  )
}