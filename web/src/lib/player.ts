import { PAT } from './data'

export interface TakeMeta {
  generation_id: string
  original_prompt: string
  final_prompt: string
  controls: Record<string, string>
  duration_seconds: number
  sampling_rate: number
  audio_url: string
  waveform_url?: string
  spectrogram_url?: string
  waveform_points?: number[]
  generation_time_seconds: number
  device?: string
  created_at: string
}

export interface Take {
  meta: TakeMeta
  buffer: AudioBuffer
  peaks: number[]
  spec: HTMLCanvasElement
  pat: number[][]
}

let AC: AudioContext | null = null
let master: GainNode | null = null
export let analyser: AnalyserNode | null = null
let volume = 0.8

function ctx(): AudioContext {
  if (!AC) {
    const C = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
    AC = new C()
    master = AC.createGain()
    analyser = AC.createAnalyser()
    analyser.fftSize = 2048
    master.connect(analyser)
    analyser.connect(AC.destination)
    master.gain.value = volume * volume * 0.9
  }
  return AC
}

/** Must be called from a user gesture before playback (mobile Safari requires it). */
export function unlock() {
  const c = ctx()
  if (c.state === 'suspended') void c.resume()
}

export function setVolume(v: number) {
  volume = v
  if (master) master.gain.value = v * v * 0.9
}

/* ---------- state + subscription ---------- */
type S = { take: Take | null; playing: boolean; loading: string | null }
export const state: S = { take: null, playing: false, loading: null }
let startAt = 0
let src: AudioBufferSourceNode | null = null
const subs = new Set<() => void>()
let version = 0
const emit = () => { version++; subs.forEach(f => f()) }
export const subscribe = (f: () => void) => { subs.add(f); return () => { subs.delete(f) } }
export const getVersion = () => version

export function progress(): number {
  if (!state.playing || !state.take || !AC) return 0
  return Math.min(1, (AC.currentTime - startAt) / state.take.buffer.duration)
}

export function play(from = 0) {
  const t = state.take
  if (!t) return
  const c = ctx()
  if (c.state === 'suspended') void c.resume()
  stopSource()
  src = c.createBufferSource()
  src.buffer = t.buffer
  src.connect(master!)
  src.start(0, from * t.buffer.duration)
  startAt = c.currentTime - from * t.buffer.duration
  const me = src
  src.onended = () => { if (src === me) { src = null; state.playing = false; emit() } }
  state.playing = true
  emit()
}

function stopSource() {
  if (src) { const s = src; src = null; try { s.stop() } catch { /* already stopped */ } }
}

export function stop() {
  stopSource()
  if (state.playing) { state.playing = false; emit() }
}

export function toggle() { if (state.playing) stop(); else play(0) }

/* ---------- loading + analysis ---------- */
const cache = new Map<string, Take>()

export async function decodeTake(meta: TakeMeta, audioUrl: string): Promise<Take> {
  const hit = cache.get(meta.generation_id)
  if (hit) return hit
  const res = await fetch(audioUrl)
  if (!res.ok) throw new Error('missing')
  const buf = await ctx().decodeAudioData(await res.arrayBuffer())
  const take = { meta, buffer: buf, ...analyze(buf) }
  cache.set(meta.generation_id, take)
  return take
}

export function setTake(t: Take | null) {
  stop()
  state.take = t
  emit()
}

export function setLoading(msg: string | null) { state.loading = msg; emit() }

function fft(re: Float32Array, im: Float32Array) {
  const n = re.length
  for (let i = 1, j = 0; i < n; i++) {
    let b = n >> 1
    for (; j & b; b >>= 1) j ^= b
    j ^= b
    if (i < j) { [re[i], re[j]] = [re[j], re[i]];[im[i], im[j]] = [im[j], im[i]] }
  }
  for (let l = 2; l <= n; l <<= 1) {
    const a = -2 * Math.PI / l, wr = Math.cos(a), wi = Math.sin(a)
    for (let i = 0; i < n; i += l) {
      let cr = 1, ci = 0
      for (let j = 0; j < l / 2; j++) {
        const ur = re[i + j], ui = im[i + j]
        const vr = re[i + j + l / 2] * cr - im[i + j + l / 2] * ci
        const vi = re[i + j + l / 2] * ci + im[i + j + l / 2] * cr
        re[i + j] = ur + vr; im[i + j] = ui + vi
        re[i + j + l / 2] = ur - vr; im[i + j + l / 2] = ui - vi
        const t = cr * wr - ci * wi; ci = cr * wi + ci * wr; cr = t
      }
    }
  }
}

/** Port of analyze() from the reference: peaks, spectrogram image and 4-band × 16-step disc pattern. */
export function analyze(b: AudioBuffer) {
  const d = b.getChannelData(0), N = 600
  let peaks: number[] = []
  const blk = Math.max(1, Math.floor(d.length / N))
  for (let i = 0; i < N; i++) {
    let m = 0
    for (let j = 0; j < blk; j++) m = Math.max(m, Math.abs(d[i * blk + j] || 0))
    peaks.push(m)
  }
  const mx = Math.max(...peaks) || 1
  peaks = peaks.map(p => p / mx)
  // Spectrogram covers 0–8 kHz whatever the sample rate.
  const F = 512, cols = 220, hop = Math.max(1, Math.floor((d.length - F) / cols))
  const rows = Math.min(F / 2, Math.round(8000 / (b.sampleRate / F)))
  const c = document.createElement('canvas'); c.width = cols; c.height = rows
  const x = c.getContext('2d')!, img = x.createImageData(cols, rows)
  for (let ci = 0; ci < cols; ci++) {
    const re = new Float32Array(F), im = new Float32Array(F)
    for (let i = 0; i < F; i++) re[i] = (d[ci * hop + i] || 0) * (0.5 - 0.5 * Math.cos(2 * Math.PI * i / F))
    fft(re, im)
    for (let r = 0; r < rows; r++) {
      const mag = Math.hypot(re[r], im[r])
      const v = Math.max(0, Math.min(1, (20 * Math.log10(mag + 1e-6) + 50) / 55))
      const p = ((rows - 1 - r) * cols + ci) * 4
      img.data[p] = v < 0.5 ? v * 2 * 120 : 120 + (v - 0.5) * 2 * 135
      img.data[p + 1] = v < 0.5 ? 20 + v * 2 * 40 : 60 + (v - 0.5) * 2 * 170
      img.data[p + 2] = v < 0.5 ? 30 + v * 60 : 60 - (v - 0.5) * 60
      img.data[p + 3] = 255
    }
  }
  x.putImageData(img, 0, 0)
  // Band edges scaled from the reference's 22.05 kHz bins to this file's rate.
  const hz = (f: number) => Math.max(1, Math.min(rows, Math.round(f / (b.sampleRate / F))))
  const edges = [[hz(43), hz(258)], [hz(258), hz(861)], [hz(861), hz(2584)], [hz(2584), rows]]
  const seg = Array.from({ length: 4 }, () => new Array(16).fill(0))
  for (let ci = 0; ci < cols; ci++) {
    const k = Math.min(15, Math.floor(ci / cols * 16))
    for (let bnd = 0; bnd < 4; bnd++) {
      const [lo, hi] = edges[bnd]
      let e = 0
      for (let r = lo; r < hi; r++) e += img.data[((rows - 1 - r) * cols + ci) * 4 + 1]
      seg[bnd][k] += e / Math.max(1, hi - lo)
    }
  }
  const pat = seg.map(row => {
    const srt = [...row].sort((a, b) => a - b), thr = srt[8] * 1.02
    const out = row.map(v => (v > thr ? 1 : 0))
    if (!out.some(Boolean)) out[0] = 1
    return out
  })
  return { peaks, spec: c, pat }
}

export const defaultPat = () => PAT.map(r => r.slice())
