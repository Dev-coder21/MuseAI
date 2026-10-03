import { RM } from './data'

const $ = <T extends Element = HTMLElement>(s: string) => document.querySelector(s) as T | null
const $$ = <T extends Element = HTMLElement>(s: string) => [...document.querySelectorAll(s)] as T[]
export const clamp = (v: number, a = 0, b = 1) => Math.max(a, Math.min(b, v))
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t
export const E = {
  out: (t: number) => 1 - Math.pow(1 - t, 3),
  io: (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2),
}
const RED = '#A8302F', INK = '#1B1B1D'

/* ---------- words become sound ---------- */
const MORPH_TXT = 'warm rainy-evening piano with soft strings'
export function drawMorph(p: number) {
  const mcv = $<HTMLCanvasElement>('#mcv'); if (!mcv) return
  const d = Math.min(2, devicePixelRatio || 1)
  const W = mcv.offsetWidth * d, H = mcv.offsetHeight * d
  if (!W || !H) return
  if (mcv.width !== W || mcv.height !== H) { mcv.width = W; mcv.height = H }
  const x = mcv.getContext('2d')!
  x.clearRect(0, 0, W, H)
  const N = MORPH_TXT.length
  const fs = Math.min(W / 11, H / 3.4)
  x.font = `700 ${fs}px Archivo, sans-serif`
  const lines: string[] = []; let cur = ''
  MORPH_TXT.split(' ').forEach(w => { const t = cur ? cur + ' ' + w : w; if (x.measureText(t).width > W * 0.92 && cur) { lines.push(cur); cur = w } else cur = t })
  lines.push(cur)
  const lh = fs * 1.02, top = H / 2 - lines.length * lh / 2 + fs * 0.8
  const pos: { ch: string; x: number; y: number }[] = []
  lines.forEach((ln, l) => {
    let cx = (W - x.measureText(ln).width) / 2
    ;[...ln].forEach(ch => { pos.push({ ch, x: cx, y: top + l * lh }); cx += x.measureText(ch).width })
    if (l < lines.length - 1) pos.push({ ch: ' ', x: cx, y: top + l * lh })
  })
  const t = performance.now() / 1000, bw = W / N
  pos.forEach((c, i) => {
    const lt = E.io(clamp((p - 0.12 - (i / N) * 0.32) / 0.38))
    const code = c.ch.charCodeAt(0)
    const amp = c.ch === ' ' ? 0.04 : 0.25 + ((code * 37) % 61) / 61 * 0.75
    const live = p > 0.8 ? 0.75 + 0.25 * Math.sin(t * 6 + i * 0.7) : 1
    const bh = amp * H * 0.38 * lt * live
    const bx = i * bw + bw * 0.2, by = H / 2
    if (lt < 1) {
      x.globalAlpha = 1 - lt; x.fillStyle = INK; x.font = `700 ${fs}px Archivo, sans-serif`
      x.save(); x.translate(lerp(c.x, bx, lt), lerp(c.y, by, lt)); x.rotate(lt * 1.2 * (i % 2 ? 1 : -1)); x.scale(1 - lt * 0.7, 1 - lt * 0.7); x.fillText(c.ch, 0, 0); x.restore()
    }
    if (lt > 0) {
      x.globalAlpha = lt; x.fillStyle = i % 7 === 3 ? INK : RED
      const w = bw * 0.6; x.beginPath()
      if (x.roundRect) x.roundRect(bx, by - bh, w, bh * 2 || 1, w / 2); else x.rect(bx, by - bh, w, bh * 2 || 1)
      x.fill()
    }
  })
  x.globalAlpha = 1
  const st = $('#mstate'); if (st) st.textContent = p < 0.15 ? 'Reading your words' : p < 0.8 ? 'Turning letters into sound' : 'Playing back'
}

/* ---------- note burst ---------- */
export function noteBurst(el: HTMLElement) {
  if (RM) return
  const r = el.getBoundingClientRect()
  for (let i = 0; i < 16; i++) {
    const n = document.createElement('span'); n.className = 'note-fly'; n.textContent = ['♪', '♫', '♩', '♬'][i % 4]
    document.body.appendChild(n)
    const x0 = r.left + r.width / 2, y0 = r.top, vx = (Math.random() - 0.5) * 520, vy = -(300 + Math.random() * 420), rot = (Math.random() - 0.5) * 720
    const t0 = performance.now()
    const st = (now: number) => {
      const t = (now - t0) / 1000
      if (t > 1.6) { n.remove(); return }
      n.style.transform = `translate(${x0 + vx * t}px,${y0 + vy * t + 600 * t * t}px) rotate(${rot * t}deg) scale(${1 - t * 0.4})`
      n.style.opacity = String(1 - t / 1.6)
      requestAnimationFrame(st)
    }
    requestAnimationFrame(st)
  }
}

/* ---------- scroll motion (port of setupMotion) ---------- */
export function setupMotion(scrollRot: { current: number }) {
  const html = document.documentElement
  const motion = !RM
  const cleanups: (() => void)[] = []
  if (motion) html.classList.add('motion')

  // enter states
  $$('.sec-head p,.sec-head .eyebrow').forEach(e => { e.dataset.in = 'up'; e.style.setProperty('--d', '200') })
  const form = $('#form')
  if (form) { form.dataset.in = 'left'; const nx = form.nextElementSibling as HTMLElement; nx.dataset.in = 'right'; nx.style.setProperty('--d', '120') }
  $$('#result .scope').forEach(e => { e.dataset.in = 'wipe' })
  $$('#result .pane').forEach(e => { e.dataset.in = 'zoom'; e.style.setProperty('--d', '250') })
  $$('.log').forEach(e => { e.dataset.in = 'wipe' })
  $$('.caption>*').forEach((e, i) => { e.dataset.in = 'up'; e.style.setProperty('--d', String(i * 120)) })
  const targets = $$('.split,[data-in],.field,.spec')
  if (!motion || !('IntersectionObserver' in window)) targets.forEach(e => e.classList.add('in'))
  else {
    const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target) } }), { rootMargin: '0px 0px -10% 0px' })
    targets.forEach(e => io.observe(e))
    cleanups.push(() => io.disconnect())
  }

  const scrollers: ((y: number) => void)[] = []
  const on = (f: (y: number) => void) => scrollers.push(f)
  let vel = 0, lastY = scrollY, raf = 0
  const frame = () => {
    const y = scrollY; vel = lerp(vel, y - lastY, 0.2); lastY = y
    scrollers.forEach(f => f(y))
    raf = requestAnimationFrame(frame)
  }

  const pb = $('.prog')!
  on(y => { pb.style.transform = `scaleX(${clamp(y / Math.max(1, html.scrollHeight - innerHeight))})` })

  if (!motion) {
    requestAnimationFrame(() => drawMorph(1))
    raf = requestAnimationFrame(frame)
    return () => { cancelAnimationFrame(raf); cleanups.forEach(f => f()) }
  }

  // hero parallax + disc scroll spin
  const deck = $('.deck')!, rack = $('.rack')!
  on(y => {
    const p = clamp(y / innerHeight)
    deck.style.transform = `translateY(${p * -70}px) rotate(${p * -8}deg) scale(${1 - p * 0.08})`
    rack.style.transform = `translateY(${p * 50}px)`
    scrollRot.current = p * Math.PI * 1.5
  })

  // ticker driven by scroll velocity
  const tk = $('#ticker')!
  tk.style.animation = 'none'
  let tx = 0, dir = 1
  on(() => {
    if (Math.abs(vel) > 0.5) dir = Math.sign(vel)
    tx -= (0.6 + Math.min(30, Math.abs(vel)) * 0.5) * dir
    const w = tk.scrollWidth / 2
    if (tx < -w) tx += w
    if (tx > 0) tx -= w
    tk.style.transform = `translateX(${tx}px) skewX(${clamp(-vel * 0.4, -14, 14)}deg)`
  })

  // words → sound
  const morph = $('#morph')!
  const morphP = () => { const r = morph.getBoundingClientRect(); return { r, p: clamp(-r.top / (r.height - innerHeight)) } }
  on(() => { const { r, p } = morphP(); if (r.top < innerHeight && r.bottom > 0) drawMorph(p) })

  // horizontal signal path
  const hp = $('#path')!, track = $('.track')!, wire = $('.wire')!, pulse = $('.pulse')!, mods = $$('.track .mod'), hc = $('.hcount')!
  const wpath = $('#wirePath')!
  let over = 0
  const layoutH = () => {
    if (innerWidth <= 860) { hp.style.height = ''; return }
    over = track.scrollWidth - track.parentElement!.clientWidth
    hp.style.height = (innerHeight + over + innerHeight * 0.4) + 'px'
    wire.setAttribute('width', String(track.scrollWidth))
  }
  layoutH()
  addEventListener('resize', layoutH)
  cleanups.push(() => removeEventListener('resize', layoutH))
  on(() => {
    if (innerWidth <= 860) { mods.forEach(m => { m.classList.add('live'); m.style.transform = '' }); hc.textContent = '06'; return }
    const r = hp.getBoundingClientRect()
    const p = clamp(-r.top / (r.height - innerHeight))
    const mp = clamp((p - 0.05) / 0.9)
    track.style.transform = `translateX(${-mp * over}px)`
    const W = track.scrollWidth, px = mp * W
    wpath.setAttribute('d', `M0 2 H${W}`); wpath.style.strokeDashoffset = String(1 - mp); pulse.style.left = px + 'px'
    let lit = 0
    mods.forEach((m, i) => {
      const c = m.offsetLeft + m.offsetWidth / 2, live = px >= m.offsetLeft
      m.classList.toggle('live', live)
      m.style.transform = live ? `translateY(${-Math.max(0, 8 - Math.abs(px - c) / 30)}px)` : ''
      if (live) lit = i + 1
    })
    hc.textContent = String(lit).padStart(2, '0')
  })

  // presets dealt from a stack
  const carts = $$('.cart'), cw = $('#carts')!
  on(() => {
    const r = cw.getBoundingClientRect()
    const e = E.out(clamp((innerHeight - r.top) / (innerHeight * 0.75)))
    const mid = (carts.length - 1) / 2
    const cx = cw.clientWidth / 2
    carts.forEach((c, i) => {
      const off = cx - (c.offsetLeft + c.offsetWidth / 2), rot = (i - mid) * 7
      c.style.transform = `translate(${off * (1 - e)}px,${(1 - e) * 80 + Math.abs(i - mid) * (1 - e) * 14}px) rotate(${rot * (1 - e)}deg)`
      c.style.zIndex = String(10 - Math.abs(i - mid))
    })
  })

  // footer width stretch
  const big = $('.big')!
  on(() => {
    const r = big.getBoundingClientRect()
    const p = clamp((innerHeight - r.top) / (innerHeight + r.height))
    big.style.setProperty('--wd', String(lerp(62, 125, E.out(clamp(p * 1.6)))))
    big.style.letterSpacing = lerp(0.05, -0.05, clamp(p * 1.6)) + 'em'
  })

  // keep the morph bars breathing once it reaches "Playing back"
  const breathe = setInterval(() => { const { r, p } = morphP(); if (p > 0.8 && r.top < innerHeight && r.bottom > 0) drawMorph(p) }, 50)
  cleanups.push(() => clearInterval(breathe))

  // custom cursor + magnetic buttons (mouse only)
  if (matchMedia('(pointer:fine)').matches) {
    const cur = $('.cur')!, lab = cur.querySelector('span')!
    let mx = -100, my = -100, cx = -100, cy = -100
    const pm = (e: PointerEvent) => {
      mx = e.clientX; my = e.clientY
      const t = (e.target as Element).closest?.('[data-cursor]') as HTMLElement | null
      cur.classList.toggle('big', !!t)
      if (t) lab.textContent = t.dataset.cursor || ''
    }
    addEventListener('pointermove', pm)
    cleanups.push(() => removeEventListener('pointermove', pm))
    on(() => { cx = lerp(cx, mx, 0.22); cy = lerp(cy, my, 0.22); cur.style.transform = `translate(${cx}px,${cy}px)` })
    const mag = (e: PointerEvent) => {
      const b = (e.target as Element).closest?.('.btn,.play,.skip') as HTMLElement | null
      $$('.btn,.play,.skip').forEach(o => { if (o !== b) o.style.translate = '' })
      if (!b || (b as HTMLButtonElement).disabled) return
      const r = b.getBoundingClientRect()
      b.style.translate = `${(e.clientX - r.left - r.width / 2) * 0.22}px ${(e.clientY - r.top - r.height / 2) * 0.3}px`
    }
    addEventListener('pointermove', mag)
    cleanups.push(() => removeEventListener('pointermove', mag))
  }

  raf = requestAnimationFrame(frame)
  return () => { cancelAnimationFrame(raf); cleanups.forEach(f => f()) }
}
