import './CoverImage.scss'
import { useState } from 'react'

interface Props {
  coverSize: 'small' | 'default' | 'large'
  coverUrl: string | null | undefined
  title: string
}

export default function CoverImage({ coverSize, coverUrl, title }: Props) {
  const [error, setError] = useState(false)

  if (!coverUrl || error) {
    return (
      <div className={`cover-placeholder cover-placeholder--${coverSize}`}>
        <span className="cover-initials">{title.slice(0, 2)}</span>
      </div>
    )
  }
  return (
    <img
      src={coverUrl}
      alt={title}
      className={`${coverSize}-book-cover`}
      onError={() => setError(true)}
    />
  )
}