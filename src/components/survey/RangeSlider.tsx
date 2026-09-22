import './RangeSlider.scss'
import type { CSSProperties } from 'react'

interface Props {
  min?: number
  max: number
  value: number | null
  onChange: (value: number) => void
  label?: string
}

export default function RangeSlider({ min = 0, max, value, onChange, label }: Props) {
  const current = value ?? min
  const clampedMax = Math.max(max, min)
  const frac = clampedMax > min ? (current - min) / (clampedMax - min) : 0

  const trackStyle = {
    '--range-fill': `${frac * 100}%`,
    '--range-fill-frac': frac,
  } as CSSProperties

  return (
    <div className="range-slider">
      {label && <h2 className="section-title">{label}</h2>}
      <div className="range-slider-track-wrap" style={trackStyle}>
        <span className="range-slider-bubble">{current}</span>
        <input
          type="range"
          min={min}
          max={clampedMax}
          value={current}
          onChange={e => onChange(Number(e.target.value))}
          className="range-slider-input"
        />
      </div>
    </div>
  )
}
