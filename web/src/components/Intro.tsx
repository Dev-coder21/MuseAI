import { useEffect, useRef, useState, type ReactNode } from 'react'
import { motion, animate } from 'motion/react'
import { PAT } from '../lib/data'
import { clamp } from '../lib/motion'

const RED = '#A8302F', INK = '#1B1B1D', PANEL = '#F1F0ED', CASE = '#E7E6E3', CRT = '#111312', PHOS = '#46D18A', LINE = '#2A2A2C', DOT = '#161617', MUTE = '#6E6C69'
/* close-up → top view → exploded → assembled → dive */
const T = { flat: 2.2, explode: 3.2, assemble: 4.1, dive: 5.7 }
const TOTAL_FRAMES = Math.round((T.dive + 1) * 30)
const EASE = [0.65, 0, 0.35, 1] as const
const SPRING = { type: 'spring', stiffness: 110, damping: 16 } as const
const ACTS: [number, string][] = [[0, '01 · Close-up'], [T.flat, '02 · Top view'], [T.explode, '03 · Exploded'], [T.assemble, '04 · Assembly'], [T.dive, '05 · Enter']]

const dots: [number, number][] = []
;[135, 165, 195, 225].forEach((rr, tr) => PAT[tr].forEach((v, k) => { if (!v) return; const a = k / 16 * Math.PI * 2 + tr * 0.3; dots.push([500 + Math.cos(a) * rr, 500 + Math.sin(a) * rr]) }))
const grille: [number, number, number][] = []
for (let i = 0; i < 64; i++) { const a = i * 2.39996, r = 10 * Math.sqrt(i); grille.push([1310 + Math.cos(a) * r, 320 + Math.sin(a) * r, r]) }

function Scene({ onDone }: { onDone: () => void }) {
  const [phase, setPhase] = useState(0) // 0 close-up · 1 top view · 2 exploded · 3 assembled · 4 dive
  const diveRef = useRef<SVGGElement>(null)
  useEffect(() => {
    const ts = [1, 2, 3, 4].map(p => setTimeout(() => setPhase(p), [0, T.flat, T.explode, T.assemble, T.dive][p] * 1000))
    return () => ts.forEach(clearTimeout)
  }, [])
  useEffect(() => {
    if (phase !== 4) return
    const g = diveRef.current!
    const c = animate(1, 18, {
      duration: 0.9, delay: 0.15, ease: [0.7, 0, 0.84, 0],
      onUpdate: v => g.setAttribute('transform', `translate(500 500) scale(${v}) translate(-500 -500)`),
      onComplete: onDone,
    })
    return () => c.stop()
  }, [phase, onDone])
  const ex = phase === 2, gone = phase >= 4

  let n = 0
  const D = (Tag: 'rect' | 'circle', props: Record<string, unknown>) => {
    const i = n++
    const M = motion[Tag] as React.ElementType
    return <M key={'d' + i} stroke={LINE} strokeWidth={1.6} {...props} initial={false} animate={{ fillOpacity: ex ? 0 : 1 }} transition={{ duration: 0.45, delay: ex ? 0 : 0.25 + i * 0.02 }} />
  }
  const Fade = (key: string, child: ReactNode, delay = 0.3) =>
    <motion.g key={key} initial={false} animate={{ opacity: ex ? 0 : 1 }} transition={{ duration: 0.35, delay: ex ? 0 : delay }}>{child}</motion.g>
  const Label = (x: number, y: number, ax: number, ay: number, lines: string[]) => (
    <motion.g key={'lbl' + lines[0]} initial={{ opacity: 0 }} animate={{ opacity: ex ? 1 : 0 }} transition={{ duration: 0.35, delay: ex ? 0.35 : 0 }}>
      <line x1={ax} y1={ay} x2={x} y2={y} stroke={MUTE} strokeWidth={1} />
      <circle cx={ax} cy={ay} r={3.5} fill={RED} />
      {lines.map((t, k) => <text key={k} x={x + (x < ax ? -8 : 8)} y={y + 4 + k * 17} textAnchor={x < ax ? 'end' : 'start'} fontFamily="IBM Plex Mono, monospace" fontSize={13} letterSpacing={1} fill={k ? MUTE : INK}>{t}</text>)}
    </motion.g>
  )
  const Part = (key: string, i: number, dx: number, dy: number, dr: number, children: ReactNode[], keep = false) => (
    <motion.g key={key} initial={false}
      animate={gone && !keep ? { x: 0, y: 0, rotate: 0, opacity: 0 } : ex ? { x: dx, y: dy, rotate: dr, opacity: 1 } : { x: 0, y: 0, rotate: 0, opacity: 1 }}
      transition={gone ? { duration: 0.25 } : { ...SPRING, delay: i * 0.05 }}>{children}</motion.g>
  )
  const label = (x: number, y: number, t: string) => <text x={x} y={y} textAnchor="middle" fontFamily="Archivo, sans-serif" fontSize={13} letterSpacing={2} fill={INK}>{t}</text>

  const svg = (
    <svg viewBox="100 80 1400 840" preserveAspectRatio="xMidYMid meet" aria-hidden="true">
      <defs>
        <pattern id="grid" width={40} height={40} patternUnits="userSpaceOnUse"><path d="M40 0H0V40" fill="none" stroke="rgba(27,27,29,.08)" strokeWidth={1} /></pattern>
        <radialGradient id="redg" cx={0.38} cy={0.35} r={0.8}><stop offset={0} stopColor="#B8433F" /><stop offset={1} stopColor="#94292A" /></radialGradient>
      </defs>
      <motion.rect x={-200} y={-200} width={2000} height={1400} fill="url(#grid)" initial={{ opacity: 0 }} animate={{ opacity: ex ? 1 : 0 }} transition={{ duration: 0.4 }} />
      <motion.g initial={{ y: -105, scale: 0.85 }} animate={phase === 0 || phase >= 3 ? { y: -105, scale: 0.85 } : { y: 0, scale: 1 }} transition={{ duration: 0.9, ease: EASE }}>
        <g ref={diveRef}>
          {Part('body', 0, 0, 0, 0, [
            D('rect', { x: 180, y: 150, width: 1240, height: 700, rx: 40, fill: PANEL }),
            Fade('t', <text x={220} y={200} fontFamily="Archivo, sans-serif" fontSize={20} letterSpacing={2} fill={INK}>MUSEAI</text>),
          ], true)}
          {Part('platter', 1, -150, -20, -12, [
            D('circle', { cx: 500, cy: 500, r: 272, fill: CASE }),
            D('circle', { cx: 500, cy: 500, r: 240, fill: 'url(#redg)' }),
            ...[150, 180, 210].map(r => <circle key={'r' + r} cx={500} cy={500} r={r} fill="none" stroke="rgba(0,0,0,.25)" strokeWidth={1.2} />),
            <motion.g key="spin" initial={{ rotate: 0 }} animate={{ rotate: 360 }} transition={{ duration: 9, ease: 'linear', repeat: Infinity }}>
              <circle cx={500} cy={500} r={240} fill="none" />
              {dots.map(([x, y], k) => <motion.circle key={k} cx={x} cy={y} r={8.5} fill={DOT} initial={false} animate={{ scale: ex ? 0 : 1 }}
                transition={ex ? { duration: 0.2 } : { type: 'spring', stiffness: 300, damping: 15, delay: 0.35 + k * 0.012 }} />)}
            </motion.g>,
            Label(170, 300, 320, 360, ['01  PLATTER', 'Ø 480 · 4 RINGS']),
          ], true)}
          {Part('arm', 2, 80, 140, 14, [
            D('rect', { x: 600, y: 476, width: 320, height: 48, rx: 8, fill: PANEL }),
            Fade('n', <g>{[635, 665, 695, 725].map((x, k) => <g key={k}><circle cx={x} cy={492} r={4} fill={INK} /><text x={x} y={514} textAnchor="middle" fontFamily="Archivo, sans-serif" fontSize={14} fill={INK}>{k + 1}</text></g>)}</g>),
            Label(640, 640, 760, 524, ['05  TONEARM', 'READS 4 BANDS']),
          ])}
          {Part('crt', 3, 120, -110, 0, [
            D('rect', { x: 880, y: 200, width: 330, height: 240, rx: 44, fill: PANEL }),
            <motion.rect key="glass" x={902} y={220} width={286} height={200} rx={36} initial={false} animate={{ fill: ex ? '#2b2f2d' : CRT, fillOpacity: ex ? 0 : 1 }} transition={{ duration: 0.4, delay: ex ? 0 : 0.5 }} />,
            <motion.path key="trace" d="M920 340 H990 l10 -8 l8 8 l9 -60 l12 104 l10 -60 l9 16 H1080 l10 -8 l8 8 l9 -60 l12 104 l10 -60 l9 16 H1172" fill="none" stroke={PHOS} strokeWidth={3} strokeLinejoin="round"
              style={{ filter: `drop-shadow(0 0 4px ${PHOS})` }} initial={false} animate={{ pathLength: ex ? 0 : 1, opacity: ex ? 0 : 1 }} transition={{ duration: ex ? 0.2 : 0.8, delay: ex ? 0 : 0.6, ease: EASE }} />,
            Fade('ro', <text x={1045} y={404} textAnchor="middle" fontFamily="IBM Plex Mono, monospace" fontSize={13} fill="#cfd8d2" style={{ whiteSpace: 'pre' }}>{'1     96 bpm     0'}</text>, 0.8),
            Label(1240, 150, 1150, 205, ['02  DISPLAY', 'PHOSPHOR SCOPE']),
          ])}
          {Part('grille', 4, 110, -30, 0, [
            ...grille.map(([x, y, r], k) => <motion.circle key={'g' + k} cx={x} cy={y} r={5} fill={DOT} initial={false}
              animate={ex ? { scale: 0.6 } : { scale: [1, 1.4, 1] }}
              transition={ex ? { duration: 0.2 } : { duration: 1.1, repeat: Infinity, repeatDelay: 0.4, delay: r * 0.012, ease: 'easeInOut' }} />),
            Label(1440, 430, 1350, 380, ['03  SPEAKER', '64 PORTS']),
          ])}
          {[950, 1050, 1150].map((x, k) => Part('knob' + k, 5 + k, 0, 120 + k * 20, 0, [
            D('circle', { cx: x, cy: 640, r: 36, fill: PANEL }),
            <motion.g key="cap" initial={false} animate={{ rotate: ex ? -140 : 0, opacity: ex ? 0.25 : 1 }} transition={ex ? { duration: 0.3 } : { ...SPRING, delay: 0.3 + k * 0.08 }}>
              <circle cx={x} cy={640} r={24} fill={PANEL} stroke={DOT} strokeWidth={6} />
              <rect x={x - 11} y={636} width={22} height={8} rx={2} fill={DOT} />
              <rect x={x - 4} y={629} width={8} height={22} rx={2} fill={DOT} />
            </motion.g>,
            Fade('l', label(x, 705, ['MOOD', 'TEMPO', 'INTENSITY'][k])),
            k === 1 ? Label(1050, 830, 1050, 676, ['04  CONTROLS × 3']) : null,
          ]))}
          {Part('lever', 8, 120, 70, 22, [
            D('circle', { cx: 1310, cy: 650, r: 48, fill: 'none' }),
            D('rect', { x: 1294, y: 560, width: 32, height: 94, rx: 8, fill: PANEL }),
            <path key="x" d="M1302 572 h16 M1310 564 v16" stroke={INK} strokeWidth={4} />,
            Fade('l', label(1310, 728, 'POWER / SPEED')),
            Label(1450, 760, 1340, 700, ['06  POWER']),
          ])}
          <motion.g key="wires" initial={false} animate={{ opacity: gone ? 0 : 1 }} transition={{ duration: 0.25 }}>
            {['M960 440 V560 H950 V604', 'M1045 440 V604', 'M1130 440 V560 H1150 V604', 'M1210 320 H1228', 'M920 500 H860'].map((d, k) =>
              <motion.path key={k} d={d} fill="none" stroke={LINE} strokeWidth={1.5} initial={false} animate={{ pathLength: ex ? 0 : 1 }} transition={{ duration: ex ? 0.2 : 0.5, delay: ex ? 0 : 0.45 + k * 0.06, ease: EASE }} />)}
          </motion.g>
        </g>
      </motion.g>
    </svg>
  )

  const show = phase === 3
  return (
    <>
      {/* camera: starts on the tilted close-up, then rises to the top view */}
      <motion.div className="i-cam" style={{ transformPerspective: 1500 }}
        initial={{ rotateX: 50, rotateZ: -16, scale: 2.1, x: '-2%', y: '16%', opacity: 0 }}
        animate={phase === 0 ? { rotateX: 50, rotateZ: -16, scale: 2.1, x: '-2%', y: '16%', opacity: 1 } : { rotateX: 0, rotateZ: 0, scale: 1, x: '0%', y: '0%', opacity: 1 }}
        transition={phase === 0 ? { opacity: { duration: 0.6 } } : { duration: 1.1, ease: [0.6, 0, 0.25, 1] }}>
        <motion.div className="i-cam" initial={{ x: '0%' }} animate={phase === 0 ? { x: '-3%' } : { x: '0%' }} transition={phase === 0 ? { duration: T.flat, ease: 'linear' } : { duration: 0.8, ease: EASE }}>{svg}</motion.div>
      </motion.div>
      <motion.div className="i-light" initial={{ opacity: 1 }} animate={{ opacity: phase === 0 ? 1 : 0 }} transition={{ duration: 0.8 }} />
      <motion.div className="i-word" initial={false} animate={{ opacity: gone ? 0 : 1 }} transition={{ duration: 0.25 }}>
        {'MuseAI'.split('').map((c, k) => (
          <span key={k}><motion.i initial={{ y: '110%' }} animate={{ y: show || gone ? '0%' : '110%' }} transition={{ type: 'spring', stiffness: 140, damping: 17, delay: show ? 0.35 + k * 0.05 : 0 }}>{c}</motion.i></span>
        ))}
      </motion.div>
      <motion.div className="i-tag" initial={{ opacity: 0 }} animate={{ opacity: show ? 1 : 0 }} transition={{ duration: 0.4, delay: show ? 0.8 : 0 }}>A composer that listens to words</motion.div>
    </>
  )
}

/** Full-screen intro. Calls onFinish once the dive (or Skip) is done; the caller runs the iris. */
export default function Intro({ onFinish }: { onFinish: (skipped: boolean) => void }) {
  const act = useRef<HTMLElement>(null), frame = useRef<HTMLSpanElement>(null), bar = useRef<HTMLElement>(null)
  const done = useRef(false)
  const finish = useRef((skipped: boolean) => { if (done.current) return; done.current = true; onFinish(skipped) })
  useEffect(() => {
    const t0 = performance.now()
    let raf = 0
    const tick = (now: number) => {
      const t = (now - t0) / 1000
      if (frame.current) frame.current.textContent = 'FRAME ' + String(Math.min(TOTAL_FRAMES, Math.round(t * 30))).padStart(4, '0') + ' / ' + String(TOTAL_FRAMES).padStart(4, '0')
      if (bar.current) bar.current.style.transform = `scaleX(${clamp(t / (T.dive + 1))})`
      for (let i = ACTS.length - 1; i >= 0; i--) if (t >= ACTS[i][0]) { if (act.current) act.current.textContent = ACTS[i][1]; break }
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    const safety = setTimeout(() => finish.current(false), (T.dive + 4) * 1000)
    return () => { cancelAnimationFrame(raf); clearTimeout(safety) }
  }, [])
  return (
    <div id="intro" aria-label="MuseAI intro animation">
      <div id="intro-root" aria-hidden="true"><Scene onDone={() => finish.current(false)} /></div>
      <div className="i-hud">
        <span className="tr">MuseAI</span>
        <span className="bl"><b ref={act}>01 · Close-up</b><span ref={frame}>FRAME 0000 / {String(TOTAL_FRAMES).padStart(4, '0')}</span></span>
        <button className="skip br" type="button" autoFocus onClick={() => finish.current(true)}>Skip intro →</button>
        <span className="bar"><i ref={bar} /></span>
      </div>
    </div>
  )
}
