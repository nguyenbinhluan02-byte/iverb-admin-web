// Same as the design prototype: first letters of the first 2 words,
// color picked from a fixed palette by a hash of the name.
const COLORS = [
  '#F2711C',
  '#1FA971',
  '#5B6CF0',
  '#D64F9A',
  '#0E9FB5',
  '#8A5CF6',
  '#C98A00',
  '#4B5563',
]

export function initials(name: string | null | undefined): string {
  return (
    (name ?? '')
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((s) => s[0].toUpperCase())
      .join('') || '?'
  )
}

export function colorFor(name: string | null | undefined): string {
  let h = 0
  for (const c of name ?? '') h = (h * 31 + c.charCodeAt(0)) % 997
  return COLORS[h % COLORS.length]
}
