export default function Footer() {
  return (
    <footer>
      <div className="big" aria-label="MuseAI">{'MuseAI'.split('').map((c, i) => <span key={i}>{c}</span>)}</div>
      <div className="credit"><span className="eyebrow">Made by</span><span className="who">Dev Trivedi</span></div>
    </footer>
  )
}
