import { useEffect, useRef, useState } from 'react'
import { RM } from '../lib/data'

/** Typewriter for the compiled brief: keeps the common prefix and types the rest. */
export default function Brief({ text }: { text: string }) {
  const [n, setN] = useState(text.length)
  const prev = useRef('')
  useEffect(() => {
    const a = prev.current
    let i = 0
    while (i < a.length && i < text.length && a[i] === text[i]) i++
    prev.current = text
    if (RM) { setN(text.length); return }
    setN(i)
    const id = setInterval(() => {
      i = Math.min(text.length, i + 2)
      setN(i)
      if (i >= text.length) clearInterval(id)
    }, 14)
    return () => clearInterval(id)
  }, [text])
  return (
    <p className="compiled" id="compiled" style={{ marginTop: 12 }} aria-live="polite">
      {text.slice(0, n)}<span className="caret" />
    </p>
  )
}
