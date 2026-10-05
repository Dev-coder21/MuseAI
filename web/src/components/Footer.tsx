export default function Footer() {
  return (
    <footer>
      <div className="big" aria-label="MuseAI">{'MuseAI'.split('').map((c, i) => <span key={i}>{c}</span>)}</div>
    </footer>
  )
}
