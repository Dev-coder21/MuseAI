/** Size a canvas's backing store to its CSS box at up to 2× pixel ratio. */
export function fit(c: HTMLCanvasElement) {
  const d = Math.min(2, devicePixelRatio || 1)
  c.width = Math.max(1, c.offsetWidth * d)
  c.height = Math.max(1, c.offsetHeight * d)
  return d
}
