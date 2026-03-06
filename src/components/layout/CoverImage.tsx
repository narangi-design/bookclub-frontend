import './CoverImage.scss'
import { useState } from 'react'

const COVER_FORMATS = ['jpg', 'jpeg', 'png', 'webp']

interface Props {
  coverSize: "small" | "default"
  bookId: number
  title: string
}

export default function CoverImage({ coverSize, bookId, title }: Props) {
  const [attempt, setAttempt] = useState(0)

  if (attempt >= COVER_FORMATS.length) {
    return (
      <div className={`cover-placeholder cover-placeholder--${coverSize}`}>
        <span className="cover-initials">{title.slice(0, 2)}</span>
      </div>
    )
  }
  return (
    <img
      key={attempt}
      src={`/covers/${bookId}.${COVER_FORMATS[attempt]}`}
      alt={title}
      className={`${coverSize}-book-cover`}
      onError={() => setAttempt(a => a + 1)}
    />
  )
}