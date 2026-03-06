interface Option {
  key: string
  label: string
  count: number
}

interface Props {
  options: Option[]
  value: string
  onChange: (key: string) => void
}

export default function FilterBar({ options, value, onChange }: Props) {
  return (
    <div className="filter-row">
      {options.map(({ key, label, count }) => (
        <button
          key={key}
          className={`filter-btn${value === key ? ' filter-btn--active' : ''}`}
          onClick={() => onChange(key)}
        >
          {label}
          <span className="filter-count">{count}</span>
        </button>
      ))}
    </div>
  )
}