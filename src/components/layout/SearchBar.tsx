import './SearchBar.scss'

interface Props {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  count?: number
}

export default function SearchBar({ value, onChange, placeholder = 'Поиск…', count }: Props) {
  return (
    <div className="search-bar">
      <input
        type="search"
        className="search-bar-input"
        placeholder={placeholder}
        value={value}
        onChange={e => onChange(e.target.value)}
      />
      {count !== undefined && <span className="search-bar-count">{count}</span>}
    </div>
  )
}
