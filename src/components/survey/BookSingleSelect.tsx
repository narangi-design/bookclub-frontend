import './BookPicker.scss'
import type { Book } from '@/types'
import CoverImage from '@/components/layout/CoverImage'

interface Props {
  books: Book[]
  selectedId: number | null
  onChange: (id: number) => void
  authorById?: Record<number, string>
}

export default function BookSingleSelect({ books, selectedId, onChange, authorById }: Props) {
  if (books.length === 0) {
    return <p className="book-picker-empty">Нет кандидатов.</p>
  }

  return (
    <div className="book-picker-grid" role="radiogroup">
      {books.map(book => {
        const selected = book.id === selectedId
        return (
          <button
            key={book.id}
            type="button"
            role="radio"
            aria-checked={selected}
            className={`book-picker-item${selected ? ' book-picker-item--selected' : ''}`}
            onClick={() => onChange(book.id)}
          >
            <span className="book-picker-cover">
              <span className="book-picker-mark book-picker-mark--radio">{selected ? '●' : ''}</span>
              <CoverImage coverSize="default" coverUrl={book.cover_url} title={book.title} />
            </span>
            <span className="book-picker-info">
              <span className="book-picker-title">{book.title}</span>
              {book.author_id != null && authorById?.[book.author_id] && (
                <span className="book-picker-author">{authorById[book.author_id]}</span>
              )}
            </span>
          </button>
        )
      })}
    </div>
  )
}
