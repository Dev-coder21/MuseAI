import { PRESETS, processPrompt } from '../lib/data'

const LINES = PRESETS.map(p => processPrompt(p).final_prompt)

export default function Ticker() {
  return (
    <div className="ticker" aria-hidden="true">
      <div id="ticker">{[...LINES, ...LINES].map((s, i) => <span key={i}>{s}</span>)}</div>
    </div>
  )
}
