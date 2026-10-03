import { useEffect, useRef, useState, useSyncExternalStore } from 'react'
import Knob from './Knob'
import * as P from '../lib/player'
import { OPT, RM, fmtT, tempoName } from '../lib/data'
import { fit } from '../lib/canvas'

export interface Knobs { mood: number; tempo: number; int: number }

const ringR = [0.62, 0.74, 0.86, 0.98]
const RING_NAMES = ['1. BASS', '2. BODY', '3. MELODY', '4. AIR']

export default function Hero({ knobs, onKnob, deckRef, rackRef, scrollRot, takeLabel }: {
  takeLabel: (id: string) => string
  knobs: Knobs
  onKnob: (k: keyof Knobs, v: number) => void
  deckRef: React.RefObject<HTMLDivElement | null>
  rackRef: React.RefObject<HTMLDivElement | null>
  scrollRot: React.RefObject<number>
}) {
  useSyncExternalStore(P.subscribe, P.getVersion)
  const { take, playing, loading } = P.state
  const [rings, setRings] = useState([true, true, true, true])
  const [vol, setVol] = useState(80)
  const ringsRef = useRef(rings); ringsRef.current = rings
  const discRef = useRef<HTMLCanvasElement>(null)
  const scopeRef = useRef<HTMLCanvasElement>(null)
  const spkRef = useRef<HTMLCanvasElement>(null)
  const armRef = useRef<HTMLDivElement>(null)
  const timeRef = useRef<HTMLSpanElement>(null)

  useEffect(() => { P.setVolume(vol / 100) }, [vol])

  useEffect(() => {
    const disc = discRef.current!, sc = scopeRef.current!, spk = spkRef.current!
    const dctx = disc.getContext('2d')!, sctx = sc.getContext('2d')!, spx = spk.getContext('2d')!
    let dd = fit(disc), sd = fit(sc); fit(spk)
    const onResize = () => { dd = fit(disc); sd = fit(sc); fit(spk) }
    addEventListener('resize', onResize)
    const buf = new Uint8Array(2048), sbuf = new Uint8Array(1024)
    const hits = [0, 0, 0, 0]
    let rot = 0, lastT = 0, lastStep = -1, idleT = 0, raf = 0
    const arm = [...armRef.current!.children] as HTMLElement[]

    const drawDisc = (pat: number[][]) => {
      const W = disc.width, H = disc.height, cx = W / 2, cy = H / 2, R = W * 0.44
      dctx.clearRect(0, 0, W, H)
      dctx.strokeStyle = '#2A2A2C'; dctx.lineWidth = dd; dctx.beginPath(); dctx.arc(cx, cy, W * 0.495, 0, 7); dctx.stroke()
      dctx.fillStyle = '#F1F0ED'; dctx.beginPath(); dctx.arc(cx, cy, W * 0.495 - 1, 0, 7); dctx.fill()
      const g = dctx.createRadialGradient(cx - R * 0.3, cy - R * 0.3, R * 0.1, cx, cy, R)
      g.addColorStop(0, '#B5403F'); g.addColorStop(1, '#9C2B2A')
      dctx.fillStyle = g; dctx.beginPath(); dctx.arc(cx, cy, R, 0, 7); dctx.fill()
      dctx.strokeStyle = 'rgba(0,0,0,.22)'; dctx.lineWidth = dd
      for (let i = 0; i < 4; i++) { dctx.beginPath(); dctx.arc(cx, cy, R * (ringR[i] - 0.06), 0, 7); dctx.stroke() }
      for (let tr = 0; tr < 4; tr++) {
        if (!ringsRef.current[tr]) continue
        const rr = R * (ringR[tr] - 0.03) * 0.98
        pat[tr].forEach((v, k) => {
          if (!v) return
          const a = -k / 16 * Math.PI * 2 + rot + (P.state.playing ? 0 : scrollRot.current || 0)
          const x = cx + Math.cos(a) * rr, y = cy + Math.sin(a) * rr
          dctx.fillStyle = '#161617'; dctx.beginPath(); dctx.arc(x, y, W * 0.0125, 0, 7); dctx.fill()
          dctx.fillStyle = 'rgba(255,255,255,.18)'; dctx.beginPath(); dctx.arc(x - W * 0.003, y - W * 0.004, W * 0.004, 0, 7); dctx.fill()
        })
      }
    }

    const drawScope = () => {
      const W = sc.width, H = sc.height
      sctx.fillStyle = 'rgba(17,19,18,.42)'; sctx.fillRect(0, 0, W, H)
      sctx.strokeStyle = 'rgba(70,209,138,.08)'; sctx.lineWidth = 1
      for (let i = 1; i < 8; i++) { sctx.beginPath(); sctx.moveTo(W * i / 8, 0); sctx.lineTo(W * i / 8, H); sctx.stroke() }
      for (let i = 1; i < 6; i++) { sctx.beginPath(); sctx.moveTo(0, H * i / 6); sctx.lineTo(W, H * i / 6); sctx.stroke() }
      sctx.strokeStyle = '#46D18A'; sctx.lineWidth = 2 * sd; sctx.shadowColor = '#46D18A'; sctx.shadowBlur = 10 * sd; sctx.beginPath()
      const mid = H * 0.42
      if (P.state.playing && P.analyser) {
        P.analyser.getByteTimeDomainData(buf)
        for (let i = 0; i < W; i++) { const v = (buf[Math.floor(i / W * buf.length)] - 128) / 128; const y = mid + v * H * 0.9; if (i) sctx.lineTo(i, y); else sctx.moveTo(i, y) }
      } else {
        idleT += RM ? 0 : 0.006
        for (let i = 0; i < W; i++) {
          const x = (i / W + idleT) % 1, ph = (x * 3) % 1
          let v = Math.sin(x * 40) * 0.01
          if (ph > 0.42 && ph < 0.46) v -= 0.06
          if (ph > 0.46 && ph < 0.49) v += 0.32
          if (ph > 0.49 && ph < 0.52) v -= 0.14
          if (ph > 0.6 && ph < 0.7) v += Math.sin((ph - 0.6) / 0.1 * Math.PI) * 0.05
          const y = mid - v * H; if (i) sctx.lineTo(i, y); else sctx.moveTo(i, y)
        }
      }
      sctx.stroke(); sctx.shadowBlur = 0
    }

    const drawSpk = (t: number) => {
      const W = spk.width, H = spk.height
      spx.clearRect(0, 0, W, H)
      let lvl = 0
      if (P.analyser && P.state.playing) {
        P.analyser.getByteTimeDomainData(sbuf)
        let s = 0; for (let i = 0; i < sbuf.length; i++) { const v = (sbuf[i] - 128) / 128; s += v * v }
        lvl = Math.min(1, Math.sqrt(s / sbuf.length) * 4)
      }
      for (let i = 0; i < 58; i++) {
        const a = i * 2.39996, r = Math.sqrt(i) * W * 0.058
        const wob = RM ? 0 : Math.max(0, Math.sin(t / 120 - r / (W * 0.05))) * (0.15 + lvl * 0.9)
        spx.fillStyle = '#161617'; spx.beginPath(); spx.arc(W / 2 + Math.cos(a) * r, H / 2 + Math.sin(a) * r, W * 0.026 * (1 + wob), 0, 7); spx.fill()
      }
    }

    const loop = (t: number) => {
      const dt = Math.min(50, t - lastT); lastT = t
      const tk = P.state.take
      const pat = tk ? tk.pat : P.defaultPat()
      if (P.state.playing && tk) {
        const p = P.progress()
        rot = p * Math.PI * 2 // one full turn = the whole take
        const k = Math.min(15, Math.floor(p * 16))
        if (k !== lastStep) { lastStep = k; for (let tr = 0; tr < 4; tr++) if (pat[tr][k] && ringsRef.current[tr]) hits[tr] = performance.now() }
        if (timeRef.current) timeRef.current.textContent = fmtT(p * tk.buffer.duration)
      } else { lastStep = -1; if (!RM) rot += dt * 0.00008 }
      arm.forEach((s, i) => s.classList.toggle('hit', performance.now() - hits[i] < 110))
      drawDisc(pat); drawScope(); drawSpk(t)
      raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)
    return () => { cancelAnimationFrame(raf); removeEventListener('resize', onResize) }
  }, [scrollRot])

  return (
    <section className="instrument" aria-label="Playable sequencer">
      <div className="deck" ref={deckRef}>
        <canvas id="disc" ref={discRef} aria-hidden="true" />
        <div className="arm" aria-hidden="true" ref={armRef}>
          {[0, 1, 2, 3].map(i => <span key={i} className={rings[i] ? '' : 'off'}>{i + 1}</span>)}
        </div>
        <button
          className={'play' + (playing ? '' : ' paused')}
          id="play"
          data-cursor={playing ? 'STOP' : 'PLAY'}
          aria-label={playing ? 'Stop playback' : take ? 'Play your latest take' : 'Nothing to play yet'}
          disabled={!take}
          onClick={() => { P.unlock(); P.toggle() }}
        >
          <span className="ic"><b /><b /></span>
          <span>{loading && !take ? 'LOADING' : playing ? 'PAUSE' : 'PLAY'}</span>
        </button>
      </div>

      <div className="rack" ref={rackRef}>
        <div className="crt">
          <div className="glass">
            <canvas id="scope" ref={scopeRef} aria-hidden="true" />
            <div className="readout">
              <span>TAKE {take ? takeLabel(take.meta.generation_id) : '—'}</span>
              <span ref={timeRef}>00:00</span>
              <span>{take ? String(Math.round(take.buffer.duration)).padStart(2, '0') : '00'} s</span>
            </div>
          </div>
        </div>
        <ul className="tracks" aria-label="Rings shown on the disc">
          {RING_NAMES.map((n, i) => (
            <li key={n}>
              <input className="sw" type="checkbox" id={'t' + (i + 1)} checked={rings[i]}
                onChange={e => setRings(r => r.map((v, j) => (j === i ? e.target.checked : v)))} />
              <label htmlFor={'t' + (i + 1)}>{n}</label>
            </li>
          ))}
        </ul>
        <div className="controls">
          <Knob id="k-mood" label="Mood" min={0} max={7} value={knobs.mood} display={OPT.mood[knobs.mood]} onChange={v => onKnob('mood', v)} />
          <Knob id="k-tempo" label="Tempo" min={60} max={160} value={knobs.tempo} display={tempoName(knobs.tempo) + ' · ' + knobs.tempo + ' bpm'} onChange={v => onKnob('tempo', v)} />
          <Knob id="k-int" label="Intensity" min={0} max={2} value={knobs.int} display={OPT.intensity[knobs.int]} onChange={v => onKnob('int', v)} />
        </div>
        <div className="out">
          <div className="vol">
            <input type="range" id="vol" min={0} max={100} value={vol} aria-label="Volume"
              style={{ ['--v' as string]: vol + '%' }} onChange={e => setVol(+e.target.value)} />
            <span className="label">Volume</span>
          </div>
          <canvas className="spk" id="spk" ref={spkRef} aria-hidden="true" />
        </div>
      </div>
    </section>
  )
}
