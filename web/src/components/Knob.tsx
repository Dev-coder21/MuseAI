import { useRef } from 'react'

interface Props {
  id: string
  label: string
  min: number
  max: number
  value: number
  display: string
  onChange: (v: number) => void
}

export default function Knob({ id, label, min, max, value, display, onChange }: Props) {
  const drag = useRef<{ y: number; v: number } | null>(null)
  const set = (v: number) => onChange(Math.max(min, Math.min(max, Math.round(v))))
  const r = (value - min) / (max - min)
  return (
    <div className="knob">
      <button
        id={id}
        type="button"
        data-cursor="DRAG"
        aria-label={label}
        role="slider"
        aria-valuemin={min}
        aria-valuemax={max}
        aria-valuenow={value}
        aria-valuetext={display}
        onPointerDown={e => { drag.current = { y: e.clientY, v: value }; e.currentTarget.setPointerCapture(e.pointerId) }}
        onPointerMove={e => { const d = drag.current; if (d) set(d.v + (d.y - e.clientY) / 140 * (max - min)) }}
        onPointerUp={() => { drag.current = null }}
        onPointerCancel={() => { drag.current = null }}
        onKeyDown={e => {
          const d = ({ ArrowUp: 1, ArrowRight: 1, ArrowDown: -1, ArrowLeft: -1 } as Record<string, number>)[e.key]
          if (!d) return
          e.preventDefault()
          set(value + d * (max - min > 10 ? 4 : 1))
        }}
        onWheel={e => set(value + (e.deltaY < 0 ? 1 : -1) * (max - min > 10 ? 2 : 1))}
      >
        <span className="cap" style={{ transform: `rotate(${-135 + r * 270}deg)` }} />
      </button>
      <span className="label">{label}</span>
      <output>{display}</output>
    </div>
  )
}
