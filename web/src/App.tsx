import { useCallback, useEffect, useRef, useState } from 'react'
import Header from './components/Header'
import Hero, { type Knobs } from './components/Hero'
import Ticker from './components/Ticker'
import WordsToSound from './components/WordsToSound'
import HowItWorks from './components/HowItWorks'
import Composer from './components/Composer'
import Presets from './components/Presets'
import Library from './components/Library'
import SpecSheet from './components/SpecSheet'
import Footer from './components/Footer'
import Intro from './components/Intro'
import { INITIAL_SEL, OPT, RM, TEMPO_BPM, tempoName, type Preset, type Selection } from './lib/data'
import * as P from './lib/player'
import { api, abs, ApiError } from './lib/api'
import { E, clamp, lerp, noteBurst, setupMotion } from './lib/motion'

const knobsFrom = (s: Selection, k: Knobs): Knobs => ({
  mood: s.mood ? OPT.mood.indexOf(s.mood as never) : k.mood,
  tempo: s.tempo ? TEMPO_BPM[s.tempo] : k.tempo,
  int: s.intensity ? OPT.intensity.indexOf(s.intensity as never) : k.int,
})

/** Red overlay that closes onto the hero disc after the intro. */
function iris(cb: () => void) {
  const disc = document.getElementById('disc')
  const ir = document.createElement('div'); ir.id = 'iris'
  document.body.prepend(ir)
  const d = disc!.getBoundingClientRect()
  const cx = d.left + d.width / 2, cy = d.top + d.height / 2, r1 = Math.hypot(innerWidth, innerHeight), r0 = d.width * 0.44
  const t0 = performance.now(), dur = 1000
  const step = (now: number) => {
    const t = clamp((now - t0) / dur), e = E.io(t)
    ir.style.clipPath = `circle(${lerp(r1, r0, e)}px at ${cx}px ${cy}px)`
    ir.style.opacity = String(t > 0.85 ? 1 - (t - 0.85) / 0.15 : 1)
    if (t < 1) requestAnimationFrame(step); else { ir.remove(); cb() }
  }
  requestAnimationFrame(step)
}

const HISTORY_SHOWN = 20

export default function App() {
  const [prompt, setPrompt] = useState('Warm rainy-evening piano with soft strings')
  const [sel, setSelRaw] = useState<Selection>(INITIAL_SEL)
  const [duration, setDuration] = useState(8)
  const [knobs, setKnobs] = useState<Knobs>(() => knobsFrom(INITIAL_SEL, { mood: 2, tempo: 96, int: 1 }))
  const [history, setHistory] = useState<P.TakeMeta[]>([])
  const [histErr, setHistErr] = useState<string | null>(null)
  const [histLoading, setHistLoading] = useState(true)
  const [fresh, setFresh] = useState<Set<string>>(new Set())
  const [intro, setIntro] = useState(!RM)
  const deckRef = useRef<HTMLDivElement>(null)
  const rackRef = useRef<HTMLDivElement>(null)
  const scrollRot = useRef(0)

  /* ---------- history + latest take ---------- */
  const refresh = useCallback(async () => {
    try {
      // Fetch generously so take numbers stay stable (oldest = #001).
      const rows = await api.history(1000)
      setHistory(rows); setHistErr(null)
      return rows
    } catch (e) {
      setHistErr(e instanceof ApiError ? e.message : "Couldn't load your library.")
      return null
    } finally { setHistLoading(false) }
  }, [])

  useEffect(() => {
    let alive = true
    void (async () => {
      const rows = await refresh()
      const latest = rows?.[0]
      if (!latest || !alive || P.state.take) return
      P.setLoading('latest')
      try { const t = await P.decodeTake(latest, abs(latest.audio_url)); if (alive && !P.state.take) P.setTake(t) }
      catch { /* the disc simply keeps its idle pattern */ }
      finally { P.setLoading(null) }
    })()
    return () => { alive = false }
  }, [refresh])

  const order = new Map(history.map((m, i) => [m.generation_id, history.length - i]))
  const takeLabel = (id: string) => { const n = order.get(id); return n ? '#' + String(n).padStart(3, '0') : '—' }

  const onSaved = async (meta: P.TakeMeta) => {
    setFresh(f => new Set(f).add(meta.generation_id))
    const rows = await refresh()
    if (!rows?.some(r => r.generation_id === meta.generation_id)) setHistory(h => [meta, ...h])
  }

  /* ---------- motion ---------- */
  useEffect(() => setupMotion(scrollRot), [])
  useEffect(() => {
    const html = document.documentElement
    if (intro) { html.classList.add('locked'); scrollTo(0, 0) }
    else html.classList.remove('locked')
  }, [intro])
  const enterApp = () => {
    const html = document.documentElement
    html.classList.add('booting')
    setTimeout(() => html.classList.remove('booting'), 2200)
  }
  const finishIntro = useCallback(() => {
    // Hide the intro first so the iris sits over the real hero, then close onto the disc.
    setIntro(false)
    requestAnimationFrame(() => iris(enterApp))
  }, [])

  /* ---------- controls sync ---------- */
  const setSel = useCallback((s: Selection) => { setSelRaw(s); setKnobs(k => knobsFrom(s, k)) }, [])
  const onKnob = (key: keyof Knobs, v: number) => {
    setKnobs(k => ({ ...k, [key]: v }))
    setSelRaw(s => key === 'mood' ? { ...s, mood: OPT.mood[v] } : key === 'tempo' ? { ...s, tempo: tempoName(v) } : { ...s, intensity: OPT.intensity[v] })
  }
  const loadPreset = (p: Preset) => {
    setSel({ mood: p.mood, genre: p.genre, instrument: p.instrument, intensity: null, tempo: p.tempo, purpose: p.purpose })
    setPrompt(p.prompt)
    document.getElementById('composer')?.scrollIntoView({ behavior: RM ? 'auto' : 'smooth' })
  }

  return (
    <>
      {intro && <Intro onFinish={finishIntro} />}
      <div className="prog" aria-hidden="true" />
      <div className="cur" aria-hidden="true"><span>PLAY</span></div>
      <div className="wrap" inert={intro || undefined}>
        <Header onReplay={() => { if (!RM) setIntro(true) }} />
        <Hero knobs={knobs} onKnob={onKnob} deckRef={deckRef} rackRef={rackRef} scrollRot={scrollRot}
          takeLabel={takeLabel} />
        <div className="caption">
          <h1>A music composer<br />that listens to words</h1>
          <p>The disc plays your latest take. Each ring is one band of the sound, from deep bass on the inside to bright air on the outside, and each dot marks a moment where that band is loud. Press play and the arm reads the dots as the disc turns.</p>
          <p>Turn the knobs to set the mood, tempo and intensity of your next piece, then compose it below. The disc reloads with every new take you make.</p>
        </div>
      </div>
      <div inert={intro || undefined}>
        <Ticker />
        <WordsToSound />
        <HowItWorks />
        <div className="wrap">
          <Composer prompt={prompt} setPrompt={setPrompt} sel={sel} setSel={setSel} duration={duration} setDuration={setDuration}
            takeLabel={takeLabel} onSaved={onSaved} noteBurst={noteBurst} />
          <Presets onLoad={loadPreset} />
          <Library rows={history.slice(0, HISTORY_SHOWN)} fresh={fresh} takeLabel={takeLabel} error={histErr} loading={histLoading} />
          <SpecSheet />
          <Footer />
        </div>
      </div>
    </>
  )
}
