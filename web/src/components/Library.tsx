import Split from './Split'
import { useEffect, useRef, useState, useSyncExternalStore } from 'react'
import { fit } from '../lib/canvas'
import * as P from '../lib/player'
import { abs } from '../lib/api'

function Spark({ pk }: { pk: number[] }) {
  const ref = useRef<HTMLCanvasElement>(null)
  useEffect(() => {
    const c = ref.current!
    fit(c)
    const x = c.getContext('2d')!, W = c.width, H = c.height, n = 40
    const mx = Math.max(...pk.map(Math.abs), 1e-6)
    x.clearRect(0, 0, W, H); x.fillStyle = '#A8302F'
    for (let i = 0; i < n; i++) {
      // Use the peak in each slice so quiet passages still read.
      const a = Math.floor(i / n * pk.length), b = Math.max(a + 1, Math.floor((i + 1) / n * pk.length))
      let v = 0; for (let j = a; j < b; j++) v = Math.max(v, Math.abs(pk[j] || 0))
      const h = Math.max(1, v / mx * H * 0.9)
      x.fillRect(i * W / n, H / 2 - h / 2, W / n * 0.6, h)
    }
  }, [pk])
  return <canvas ref={ref} />
}

interface Props {
  rows: P.TakeMeta[]
  fresh: Set<string>
  takeLabel: (id: string) => string
  error: string | null
  loading: boolean
}

export default function Library({ rows, fresh, takeLabel, error, loading }: Props) {
  useSyncExternalStore(P.subscribe, P.getVersion)
  const [busy, setBusy] = useState<string | null>(null)
  const [rowErr, setRowErr] = useState<string | null>(null)
  const cur = P.state.take?.meta.generation_id
  const playRow = async (m: P.TakeMeta) => {
    P.unlock()
    if (cur === m.generation_id) { P.toggle(); return }
    setBusy(m.generation_id); setRowErr(null)
    try { P.setTake(await P.decodeTake(m, abs(m.audio_url))); P.play(0) }
    catch { setRowErr("That take couldn't be loaded. It may have been removed.") }
    finally { setBusy(null) }
  }
  return (
    <section className="block" id="history" style={{ paddingTop: 0 }}>
      <div className="sec-head rv">
        <span className="eyebrow">Library</span>
        <Split text={"Every take,\nkept"} />
        <p>Each composition is stored with its prompt, controls and timings, newest first. Anything you compose above is added to the top. Press play on any row to hear it.</p>
      </div>
      {(error || rowErr) && <p className="err" role="alert" style={{ marginBottom: 16 }}>{rowErr || error}</p>}
      <div className="log rv">
        <table>
          <thead><tr><th>Take</th><th>Brief</th><th>Mood · Genre · Instrument</th><th>Length</th><th>Composed in</th><th>Wave</th><th><span className="sr">Play</span></th></tr></thead>
          <tbody id="hist">
            {rows.length === 0 && <tr className="empty"><td colSpan={7}>{loading ? 'Loading your takes…' : error ? 'Your takes will appear here once the composer is reachable.' : 'No takes yet. Compose something above and it will appear here.'}</td></tr>}
            {rows.map((m, i) => {
              const on = cur === m.generation_id && P.state.playing
              const ctl = ['mood', 'genre', 'instrument'].map(k => m.controls?.[k]).filter(Boolean).join(' · ') || '—'
              return (
                <tr key={m.generation_id} style={{ ["--i" as string]: Math.min(i, 8) }} className={fresh.has(m.generation_id) ? 'fresh' : ''}>
                  <td data-l="Take">{takeLabel(m.generation_id)}</td>
                  <td data-l="Brief" className="brief" style={{ maxWidth: 320 }}>{m.final_prompt}</td>
                  <td data-l="Style">{ctl}</td>
                  <td data-l="Length">{(+m.duration_seconds).toFixed(1)} s</td>
                  <td data-l="Composed in">{(+m.generation_time_seconds).toFixed(2)} s</td>
                  <td data-l="Wave" className="wv"><Spark pk={m.waveform_points || []} /></td>
                  <td className="act">
                    {fresh.has(m.generation_id) && <span className="pill">this session</span>}
                    <button type="button" className="rowplay" data-cursor={on ? 'STOP' : 'PLAY'} disabled={busy === m.generation_id}
                      aria-label={(on ? 'Stop ' : 'Play ') + 'take ' + takeLabel(m.generation_id)} onClick={() => void playRow(m)}>
                      {busy === m.generation_id ? '…' : on ? '■' : '▶'}
                    </button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </section>
  )
}
