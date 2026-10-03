import Split from './Split'
const ROWS = [
  ['Composer', 'MusicGen by Meta'],
  ['Output', 'Studio WAV · 32 kHz'],
  ['Length', '1 – 30 seconds'],
  ['Controls', 'Mood, genre, instrument, intensity, tempo, purpose'],
  ['Presets', 'Study, meditation, workout, cinematic, lo-fi'],
  ['Visuals', 'Waveform and spectrogram'],
  ['Library', 'Every take saved and replayable'],
  ['Works on', 'Any modern browser, phone or desktop'],
]

export default function SpecSheet() {
  return (
    <section className="block" style={{ paddingTop: 0 }}>
      <div className="sec-head rv"><span className="eyebrow">Specification</span><Split text="Spec sheet" /></div>
      <dl className="spec rv">
        {ROWS.map(([k, v], i) => <div key={k} style={{ ['--i' as string]: i }}><dt>{k}</dt><dd>{v}</dd></div>)}
      </dl>
    </section>
  )
}
