import './BookPicker.scss'
import type { Book } from '@/types'
import CoverImage from '@/components/layout/CoverImage'

interface Props {
  books: Book[]
  selectedIds: number[]
  onChange: (ids: number[]) => void
  authorById?: Record<number, string>
  disabled?: boolean
}

export default function BookMultiSelect({ books, selectedIds, onChange, authorById, disabled }: Props) {
  function toggle(bookId: number) {
    onChange(
      selectedIds.includes(bookId)
        ? selectedIds.filter(id => id !== bookId)
        : [...selectedIds, bookId]
    )
  }

  if (books.length === 0) {
    return <p className="book-picker-empty">Список кандидатов пока пуст.</p>
  }

  return (
    <div className="book-picker-grid">
      {books.map(book => {
        const selected = selectedIds.includes(book.id)
        return (
          <button
            key={book.id}
            type="button"
            disabled={disabled}
            className={`book-picker-item${selected ? ' book-picker-item--selected' : ''}`}
            onClick={() => toggle(book.id)}
            aria-pressed={selected}
          >
            <span className="book-picker-cover">
              <span className="book-picker-mark">{selected ? '✓' : ''}</span>
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
