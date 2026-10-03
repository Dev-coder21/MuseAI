import { Fragment } from 'react'

/** Section heading whose words rise in one by one (lines separated by "\n"). */
export default function Split({ text }: { text: string }) {
  let i = 0
  return (
    <h2 className="split">
      {text.split('\n').map((line, l) => (
        <Fragment key={l}>
          {l > 0 && <br />}
          {line.split(' ').map((w, k) => (
            <Fragment key={k}>
              {k > 0 && ' '}
              <span className="w"><span className="wi" style={{ ['--i' as string]: i++ }}>{w}</span></span>
            </Fragment>
          ))}
        </Fragment>
      ))}
    </h2>
  )
}
