import Split from './Split'
const STAGES = [
  ['Your idea', 'A line of description plus mood, genre, instrument, intensity, tempo, purpose and length.'],
  ['Prompt builder', 'Weaves your words and controls into one clear brief for the composer.'],
  ['AI composer', "Meta's MusicGen writes an original piece from the brief, up to 30 seconds long."],
  ['Listening', 'The finished track is measured so its shape can be drawn and played back.'],
  ['Visuals', 'A waveform and a spectrogram show the loudness and colour of the sound.'],
  ['Your library', 'Every take is kept with its description, so you can replay or remake it later.'],
]

export default function HowItWorks() {
  return (
    <section className="hpin" id="path">
      <div className="stick">
        <div className="wrap" style={{ width: '100%' }}>
          <div className="sec-head">
            <span className="eyebrow">How it works · six stages</span>
            <Split text={"From a sentence\nto a waveform"} />
            <div style={{ display: 'flex', gap: 24, alignItems: 'end', justifyContent: 'space-between', flexWrap: 'wrap' }}>
              <p>Every piece of music takes the same route from your words to a finished track. Scroll to send an idea down the wire and watch each stage light up.</p>
              <span className="hcount" aria-hidden="true">00</span>
            </div>
          </div>
          <div className="trackwrap">
            <div className="track">
              <svg className="wire" height="4" aria-hidden="true">
                <path d="M0 2 H10" stroke="rgba(27,27,29,.18)" strokeWidth="2" fill="none" />
                <path id="wirePath" d="M0 2 H10" pathLength={1} strokeDasharray="1" strokeDashoffset="1" stroke="#A8302F" strokeWidth="3" fill="none" />
              </svg>
              <span className="pulse" aria-hidden="true" />
              {STAGES.map(([t, d], i) => (
                <article className="mod" key={t}>
                  <div className="n"><span className="label">{String(i + 1).padStart(2, '0')}</span><i className="led" /></div>
                  <h3>{t}</h3>
                  <p>{d}</p>
                </article>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
