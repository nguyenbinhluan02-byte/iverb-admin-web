import { colorFor, initials } from '@/lib/avatar'

export function Avatar({ name, size = 32 }: { name: string | null | undefined; size?: number }) {
  return (
    <span
      className="flex shrink-0 items-center justify-center rounded-full font-extrabold text-white"
      style={{
        width: size,
        height: size,
        background: colorFor(name),
        fontSize: Math.round(size * 0.375),
      }}
    >
      {initials(name)}
    </span>
  )
}
