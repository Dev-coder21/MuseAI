import type { TakeMeta } from './player'

export const API = (import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/$/, '') || 'http://127.0.0.1:8000'
export const abs = (u: string) => (u.startsWith('http') ? u : API + u)

export class ApiError extends Error {}

async function call<T>(path: string, init?: RequestInit): Promise<T> {
  let res: Response
  try {
    res = await fetch(API + path, { ...init, headers: { 'Content-Type': 'application/json', ...(init?.headers || {}) } })
  } catch {
    throw new ApiError("Can't reach the composer right now. Make sure it's switched on, then try again.")
  }
  if (!res.ok) {
    if (res.status === 404) throw new ApiError("That take couldn't be found. It may have been removed.")
    throw new ApiError('The composer ran into a problem making this piece. Please try again in a moment.')
  }
  return res.json() as Promise<T>
}

export interface GenerateBody {
  prompt: string
  mood: string | null
  genre: string | null
  instrument: string | null
  intensity: string | null
  tempo: string | null
  purpose: string | null
  duration: number
}

export const api = {
  health: () => call<{ status: string; device: string; model_id: string }>('/health'),
  generate: (b: GenerateBody) => call<TakeMeta>('/generate', { method: 'POST', body: JSON.stringify(b) }),
  regenerate: (generation_id: string, prompt_override?: string) =>
    call<TakeMeta>('/regenerate', { method: 'POST', body: JSON.stringify({ generation_id, prompt_override }) }),
  history: (limit = 20) => call<TakeMeta[]>('/history?limit=' + limit),
}
