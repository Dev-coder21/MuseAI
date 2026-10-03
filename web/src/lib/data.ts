export const OPT = {
  mood: ['Calm', 'Happy', 'Sad', 'Energetic', 'Relaxing', 'Emotional', 'Dark', 'Peaceful'],
  genre: ['Ambient', 'Classical', 'Jazz', 'Electronic', 'Cinematic', 'Lo-fi', 'Acoustic'],
  instrument: ['Piano', 'Guitar', 'Violin', 'Strings', 'Synth', 'Drums', 'Flute'],
  intensity: ['Low', 'Medium', 'High'],
  tempo: ['Slow', 'Medium', 'Fast'],
  purpose: ['Study', 'Meditation', 'Workout', 'Sleep', 'Gaming', 'Cinematic', 'Background'],
} as const

export type ControlKey = keyof typeof OPT
export const CONTROL_KEYS = Object.keys(OPT) as ControlKey[]
export type Selection = Record<ControlKey, string | null>

export interface Preset {
  title: string
  prompt: string
  mood: string
  genre: string
  instrument: string
  tempo: string
  purpose: string
}

export const PRESETS: Preset[] = [
  { title: 'Study Piano', prompt: 'Calm peaceful piano music for studying', mood: 'Calm', genre: 'Ambient', instrument: 'Piano', tempo: 'Slow', purpose: 'Study' },
  { title: 'Meditation', prompt: 'Deep ambient flute and pad music for meditation', mood: 'Peaceful', genre: 'Ambient', instrument: 'Flute', tempo: 'Slow', purpose: 'Meditation' },
  { title: 'Workout Beats', prompt: 'Energetic upbeat electronic music for workout', mood: 'Energetic', genre: 'Electronic', instrument: 'Drums', tempo: 'Fast', purpose: 'Workout' },
  { title: 'Cinematic Strings', prompt: 'Emotional dark orchestral strings composition', mood: 'Dark', genre: 'Cinematic', instrument: 'Strings', tempo: 'Medium', purpose: 'Cinematic' },
  { title: 'Lo-Fi Chill', prompt: 'Relaxing lo-fi acoustic guitar beat', mood: 'Relaxing', genre: 'Lo-fi', instrument: 'Guitar', tempo: 'Slow', purpose: 'Background' },
]

/** 16-step patterns per ring; used before a take is analysed and on the preset cartridges. */
export const PAT: number[][] = [
  [1, 0, 0, 1, 0, 0, 1, 0, 1, 0, 0, 0, 1, 0, 1, 0],
  [1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1, 0, 0],
  [1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 1, 1, 0],
  [1, 0, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 0, 1, 0],
]

export const TEMPO_BPM: Record<string, number> = { Slow: 72, Medium: 100, Fast: 132 }
export const tempoName = (v: number) => (v < 86 ? 'Slow' : v < 118 ? 'Medium' : 'Fast')

export const INITIAL_SEL: Selection = {
  mood: 'Calm', genre: 'Cinematic', instrument: 'Piano', intensity: null, tempo: 'Slow', purpose: 'Study',
}

/** Port of backend/prompt_processor.py, used for the live "Your brief" preview. */
export function processPrompt(p: { prompt?: string } & Partial<Selection>) {
  const raw = (p.prompt || '').trim()
  const c: Partial<Record<ControlKey, string>> = {}
  for (const k of CONTROL_KEYS) { const v = p[k]; if (v) c[k] = v }
  const d: string[] = []
  if (c.mood) d.push(c.mood.toLowerCase())
  if (c.tempo) d.push(c.tempo.toLowerCase() + ' tempo')
  if (c.intensity) d.push(c.intensity.toLowerCase() + ' intensity')
  const ds = d.join(', ')
  const gi: string[] = []
  if (c.genre) gi.push(c.genre)
  if (c.instrument) gi.push(c.instrument)
  const style = gi.length ? gi.join(' ') : 'music composition'
  const parts: string[] = []
  if (raw) parts.push(raw)
  const ph: string[] = []
  if (ds) ph.push(`in a ${ds} style`)
  if (c.purpose) ph.push(`suitable for ${c.purpose.toLowerCase()}`)
  if (ph.length && !raw) parts.push(`A ${style} ` + ph.join(' '))
  else if (ph.length && raw) {
    const a = ph.join(' ')
    if (!raw.toLowerCase().includes(a.toLowerCase())) parts.push(`(${a})`)
  }
  const fp = parts.length ? parts.join(', ').split(/\s+/).join(' ') : 'A calm acoustic instrumental music composition'
  return { original_prompt: raw, controls: c, final_prompt: fp }
}

export const fmtT = (s: number) =>
  `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(Math.floor(s % 60)).padStart(2, '0')}`

export const RM = typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches
