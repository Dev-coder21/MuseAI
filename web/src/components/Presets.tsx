import Split from './Split'
import { useEffect, useRef } from 'react'
import { fit } from '../lib/canvas'
import { PAT, PRESETS, RM, type Preset } from '../lib/data'

function Cart({ p, i, onLoad }: { p: Preset; i: number; onLoad: (p: Preset) => void }) {
  const cv = useRef<HTMLCanvasElement>(null)
  const spin = useRef<() => void>(() => {})
  const stopSpin = useRef(false)
  useEffect(() => {
    const c = cv.current!
    const d = fit(c), x = c.getContext('2d')!, W = c.width, cx = W / 2, R = W * 0.46
    let a = 0
    const pat = PAT[i % 4], pat2 = PAT[(i + 1) % 4]
    const draw = () => {
      x.clearRect(0, 0, W, W)
      x.fillStyle = '#A8302F'; x.beginPath(); x.arc(cx, cx, R, 0, 7); x.fill()
      x.strokeStyle = 'rgba(0,0,0,.2)'; x.lineWidth = d
      ;[0.5, 0.72, 0.94].forEach(r => { x.beginPath(); x.arc(cx, cx, R * r, 0, 7); x.stroke() })
      ;([[pat, 0.82], [pat2, 0.6]] as [number[], number][]).forEach(([pt, r]) => pt.forEach((v, k) => {
        if (!v) return
        const an = k / 16 * Math.PI * 2 + a
        x.fillStyle = '#161617'; x.beginPath(); x.arc(cx + Math.cos(an) * R * r, cx + Math.sin(an) * R * r, W * 0.022, 0, 7); x.fill()
      }))
      x.fillStyle = '#F1F0ED'; x.beginPath(); x.arc(cx, cx, R * 0.18, 0, 7); x.fill()
    }
    draw()
    spin.current = () => {
      stopSpin.current = false
      const s = () => { if (stopSpin.current) return; a += 0.03; draw(); requestAnimationFrame(s) }
      if (!RM) s()
    }
    return () => { stopSpin.current = true }
  }, [i])
  return (
    <button className="cart" type="button" data-cursor="LOAD" onClick={() => onLoad(p)}
      onPointerEnter={() => spin.current()} onPointerLeave={() => { stopSpin.current = true }}>
      <canvas ref={cv} />
      <div><span className="label">Cart 0{i + 1}</span><h3 style={{ marginTop: 6 }}>{p.title}</h3></div>
      <p>{p.prompt}</p>
      <div className="meta">{[p.mood, p.genre, p.instrument, p.tempo].map(m => <i key={m}>{m}</i>)}</div>
    </button>
  )
}

export default function Presets({ onLoad }: { onLoad: (p: Preset) => void }) {
  return (
    <section className="block" id="presets" style={{ paddingTop: 0 }}>
      <div className="sec-head rv">
        <span className="eyebrow">Presets · five starting points</span>
        <Split text={"Load a\ncartridge"} />
        <p>Five starting points. Each one fills the description and controls in the composer. The rings show its rhythm on the disc.</p>
      </div>
      <div className="carts rv" id="carts">
        {PRESETS.map((p, i) => <Cart key={p.title} p={p} i={i} onLoad={onLoad} />)}
      </div>
    </section>
  )
}
