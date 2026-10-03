export default function Header({ onReplay }: { onReplay: () => void }) {
  return (
    <header className="top">
      <div className="intro">
        <p>MuseAI turns a sentence into a short piece of music. Type what you hear in your head, set mood, tempo and instrument, and it composes an original track you can play, see as a waveform and spectrogram, and remake.</p>
        <a href="#composer">OPEN THE COMPOSER</a>
        <button className="replay" type="button" onClick={onReplay}>REPLAY INTRO</button>
      </div>
      <div className="brand">
        <div className="mark"><i aria-hidden="true" />MuseAI</div>
        <small>An AI music composer</small>
      </div>
    </header>
  )
}
