export default function WordsToSound() {
  return (
    <section className="morph" id="morph" aria-label="Words become sound">
      <div className="stick wrap">
        <div className="mh"><span className="eyebrow">Input · text</span><span className="eyebrow">Output · audio</span></div>
        <canvas id="mcv" role="img" aria-label="The phrase warm rainy-evening piano with soft strings turning into waveform bars" />
        <div className="mf"><span>Keep scrolling</span><b id="mstate">Reading your words</b><span>Powered by MusicGen</span></div>
      </div>
    </section>
  )
}
