import Split from './Split'
import { useEffect, useRef, useState, useSyncExternalStore } from 'react'
import Brief from './Brief'
import { fit } from '../lib/canvas'
import { CONTROL_KEYS, OPT, RM, fmtT, processPrompt, type ControlKey, type Selection } from '../lib/data'
import * as P from '../lib/player'
import { api, abs, ApiError } from '../lib/api'

const STAGES = ['Processing prompt', 'Generating audio', 'Analyzing waveform', 'Rendering spectrogram', 'Saving to history']
type StageState = { cls: '' | 'run' | 'done'; t: string }
const blank = (): StageState[] => STAGES.map(() => ({ cls: '', t: '' }))
const wait = (ms: number) => new Promise(r => setTimeout(r, RM ? 0 : ms))
const IDEAS = ['', 'Neon city at 3am', 'Sunrise over a quiet harbour', 'A chase through a desert canyon', 'Rain on a tin roof, slow and close']

interface Props {
  prompt: string
  setPrompt: (s: string) => void
  sel: Selection
  setSel: (s: Selection) => void
  duration: number
  setDuration: (n: number) => void
  takeLabel: (id: string) => string
  onSaved: (meta: P.TakeMeta) => Promise<void> | void
  noteBurst: (el: HTMLElement) => void
}

export default function Composer(p: Props) {
  useSyncExternalStore(P.subscribe, P.getVersion)
  const { take, playing } = P.state
  const [stages, setStages] = useState<StageState[]>(blank)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const waveRef = useRef<HTMLCanvasElement>(null)
  const specRef = useRef<HTMLCanvasElement>(null)
  const timeRef = useRef<HTMLSpanElement>(null)
  const resultRef = useRef<HTMLDivElement>(null)
  const sweep = useRef(1)

  const req = { prompt: p.prompt, ...p.sel, duration: p.duration }
  const brief = processPrompt(req)

  /* ---------- waveform + spectrogram ---------- */
  useEffect(() => {
    const wv = waveRef.current!, sp = specRef.current!
    const wctx = wv.getContext('2d')!, spx = sp.getContext('2d')!
    let dpr = fit(wv); fit(sp)
    const onResize = () => { dpr = fit(wv); fit(sp) }
    addEventListener('resize', onResize)
    let raf = 0
    const draw = () => {
      const t = P.state.take, W = wv.width, H = wv.height
      const prog = P.state.playing ? P.progress() : 0
      wctx.clearRect(0, 0, W, H)
      const peaks = t?.peaks || []
      const n = peaks.length || 1, bw = W / n
      for (let i = 0; i < n; i++) {
        const h = (peaks[i] || 0) * H * 0.46
        wctx.fillStyle = i / n < prog ? '#46D18A' : 'rgba(207,216,210,.45)'
        wctx.fillRect(i * bw, H / 2 - h, Math.max(1, bw * 0.7), h * 2 || 1)
      }
      if (t) { wctx.fillStyle = '#A8302F'; wctx.fillRect(prog * W - 1, 0, 2 * (dpr > 1 ? 2 : 1), H) }
      spx.fillStyle = '#0b0c0b'; spx.fillRect(0, 0, sp.width, sp.height)
      if (t) {
        spx.imageSmoothingEnabled = true; spx.drawImage(t.spec, 0, 0, sp.width, sp.height)
        spx.fillStyle = 'rgba(168,48,47,.9)'; spx.fillRect(prog * sp.width - 1, 0, 2, sp.height)
      }
      const f = sweep.current
      if (f < 1) {
        wctx.fillStyle = '#111312'; wctx.fillRect(f * W, 0, W, H)
        spx.fillStyle = '#0b0c0b'; spx.fillRect(f * sp.width, 0, sp.width, sp.height)
      }
      if (timeRef.current) {
        const dur = t ? t.buffer.duration : p.duration
        timeRef.current.textContent = `${fmtT(prog * (t ? dur : 0))} / ${fmtT(dur)}`
      }
      raf = requestAnimationFrame(draw)
    }
    raf = requestAnimationFrame(draw)
    return () => { cancelAnimationFrame(raf); removeEventListener('resize', onResize) }
  }, [p.duration])

  /* ---------- compose / regenerate ---------- */
  async function run(kind: 'compose' | 'regen') {
    if (busy) return
    P.unlock()
    P.stop()
    setBusy(true); setError(null)
    if (kind === 'compose') resultRef.current?.scrollIntoView({ behavior: RM ? 'auto' : 'smooth', block: 'center' })
    const st = blank()
    const put = (i: number, s: Partial<StageState>) => { st[i] = { ...st[i], ...s }; setStages([...st]) }
    setStages([...st])
    const timed = async <T,>(i: number, fn: () => Promise<T>, min = 0) => {
      put(i, { cls: 'run' })
      const a = performance.now()
      const tick = setInterval(() => put(i, { t: ((performance.now() - a) / 1000).toFixed(0) + ' s' }), 1000)
      try {
        const [v] = await Promise.all([fn(), wait(min)])
        put(i, { cls: 'done', t: ((performance.now() - a) / 1000).toFixed(2) + ' s' })
        return v
      } finally { clearInterval(tick) }
    }
    try {
      // The server does stage 1 and 2 in one call; stage 1 is shown on a short timer.
      const call = kind === 'compose'
        ? api.generate({ prompt: p.prompt, ...p.sel, duration: p.duration })
        : api.regenerate(take!.meta.generation_id)
      call.catch(() => { /* surfaced below */ })
      await timed(0, () => wait(350))
      const meta = await timed(1, () => call)
      const tk = await timed(2, () => P.decodeTake(meta, abs(meta.audio_url)), 250)
      await timed(3, async () => {
        P.setTake(tk)
        for (let i = 0; i <= 24; i++) { sweep.current = i / 24; await wait(18) }
        sweep.current = 1
      })
      await timed(4, async () => { await p.onSaved(meta) }, 200)
      P.play(0)
    } catch (e) {
      sweep.current = 1
      setError(e instanceof ApiError ? e.message : "Something went wrong while preparing your piece. Please try again.")
      setStages(blank())
    } finally {
      setBusy(false)
    }
  }

  const toggleChip = (k: ControlKey, o: string) => p.setSel({ ...p.sel, [k]: p.sel[k] === o ? null : o })
  const surprise = () => {
    const s = { ...p.sel }
    for (const k of CONTROL_KEYS) s[k] = Math.random() < 0.8 ? OPT[k][(Math.random() * OPT[k].length) | 0] : null
    p.setSel(s)
    p.setPrompt(IDEAS[(Math.random() * IDEAS.length) | 0])
  }

  const m = take?.meta
  return (
    <section className="block" id="composer" style={{ paddingTop: 0 }}>
      <div className="sec-head rv">
        <span className="eyebrow">Composer</span>
        <Split text={"Describe it.\nHear it."} />
        <p>Write a line, pick a few controls and watch your brief take shape. Press Compose to hear it, then play, seek and remake it.</p>
      </div>
      <div className="composer">
        <form className="pane rv" id="form" autoComplete="off" onSubmit={e => e.preventDefault()}>
          <label className="label" htmlFor="prompt">Your description</label>
          <div style={{ height: 10 }} />
          <textarea id="prompt" value={p.prompt} onChange={e => p.setPrompt(e.target.value)} />
          <div id="fields">
            {CONTROL_KEYS.map(k => (
              <div className="field" key={k}>
                <span className="label"><span>{k}</span><span className="eyebrow">{p.sel[k] || '—'}</span></span>
                <div className="chips" role="group" aria-label={k}>
                  {OPT[k].map((o, i) => (
                    <button type="button" key={o} className="chip" style={{ ['--i' as string]: i }}
                      aria-pressed={p.sel[k] === o} onClick={() => toggleChip(k, o)}>{o}</button>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <div className="field">
            <span className="label"><label htmlFor="dur">Duration</label><span className="eyebrow">Up to 30 s</span></span>
            <div className="dur">
              <input type="range" id="dur" min={1} max={30} value={p.duration} onChange={e => p.setDuration(+e.target.value)} />
              <output>{p.duration} s</output>
            </div>
          </div>
        </form>

        <div className="pane rv">
          <span className="label">Your brief</span>
          <Brief text={brief.final_prompt} />
          <dl className="patch" id="req" aria-label="Selected settings">
            {CONTROL_KEYS.map(k => <div key={k}><dt>{k}</dt><dd className={p.sel[k] ? '' : 'off'}>{p.sel[k] || 'Any'}</dd></div>)}
            <div><dt>length</dt><dd>{p.duration} s</dd></div>
          </dl>
          <div className="go">
            <button className="btn red" id="compose" type="button" disabled={busy}
              onClick={e => { p.noteBurst(e.currentTarget); void run('compose') }}>{busy ? 'Composing…' : 'Compose'}</button>
            <button className="btn" id="random" type="button" disabled={busy} onClick={surprise}>Surprise me</button>
          </div>
          <p className="note" style={{ marginTop: 14 }}>Composing takes a little while, usually under a minute for a short piece. Longer pieces take longer.</p>
        </div>
      </div>

      <div className="result rv" id="result" ref={resultRef}>
        <div className="scope">
          <div className="tag"><span>Waveform · tap to seek</span><span ref={timeRef}>00:00 / 00:00</span></div>
          <canvas className="cv-wave" id="wave" ref={waveRef} data-cursor="SEEK" role="slider" aria-label="Seek"
            aria-valuemin={0} aria-valuemax={100} aria-valuenow={0} tabIndex={take ? 0 : -1}
            onClick={e => { if (!take) return; const r = e.currentTarget.getBoundingClientRect(); P.unlock(); P.play((e.clientX - r.left) / r.width) }} />
          <div className="tag"><span>Spectrogram</span><span>0 – 8 kHz</span></div>
          <canvas className="cv-spec" id="spec" ref={specRef} />
        </div>
        <div className="pane">
          <span className="label">Generation</span>
          <ul className="stages" id="stages" style={{ marginTop: 14 }}>
            {STAGES.map((s, i) => <li key={s} className={stages[i].cls}>{s}<span>{stages[i].t}</span></li>)}
          </ul>
          {error && <p className="err" role="alert">{error}</p>}
          <dl className="info" id="info">
            {m ? <>
              <dt>Take</dt><dd>{p.takeLabel(m.generation_id)}</dd>
              <dt>Brief</dt><dd>{m.final_prompt}</dd>
              <dt>Length</dt><dd>{(take!.buffer.duration).toFixed(1)} s</dd>
              <dt>Quality</dt><dd>Studio WAV · {Math.round(m.sampling_rate / 1000)} kHz</dd>
              <dt>Composed in</dt><dd>{m.generation_time_seconds.toFixed(2)} s</dd>
            </> : <><dt>Take</dt><dd>Nothing composed yet</dd></>}
          </dl>
          <div className="go">
            <button className="btn red" id="rplay" type="button" disabled={!take || busy} onClick={() => { P.unlock(); P.toggle() }}>{playing ? 'Stop' : 'Play'}</button>
            <button className="btn" id="regen" type="button" disabled={!take || busy} onClick={() => void run('regen')}>Regenerate</button>
          </div>
        </div>
      </div>
    </section>
  )
}
