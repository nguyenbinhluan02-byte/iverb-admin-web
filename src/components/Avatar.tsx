import { useState } from 'react'
import { colorFor, initials } from '@/lib/avatar'

/** Profile photo when there is one, else initials on a color from the name. */
export function Avatar({
  name,
  src,
  size = 32,
}: {
  name: string | null | undefined
  src?: string | null
  size?: number
}) {
  // A broken photo falls back to the initials.
  const [failed, setFailed] = useState<string | null>(null)
  const style = { width: size, height: size }

  if (src && failed !== src) {
    return (
      <img
        src={src}
        alt=""
        referrerPolicy="no-referrer"
        onError={() => setFailed(src)}
        className="shrink-0 rounded-full object-cover"
        style={style}
      />
    )
  }
  return (
    <span
      className="flex shrink-0 items-center justify-center rounded-full font-extrabold text-white"
      style={{ ...style, background: colorFor(name), fontSize: Math.round(size * 0.375) }}
    >
      {initials(name)}
    </span>
  )
}
