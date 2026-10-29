export type PageItem = number | 'gap'

/** Design: first, last, current ±1; anything else collapses into one "…". */
export function pageItems(current: number, pages: number): PageItem[] {
  const items: PageItem[] = []
  for (let p = 1; p <= pages; p++) {
    if (p === 1 || p === pages || Math.abs(p - current) <= 1) items.push(p)
    else if (items.at(-1) !== 'gap') items.push('gap')
  }
  return items
}

export function pageCount(total: number, size: number): number {
  return Math.max(1, Math.ceil(total / size))
}

/** "Showing 9–16 of 42" */
export function rangeLabel(page: number, size: number, total: number): string {
  return `Showing ${(page - 1) * size + 1}–${Math.min(page * size, total)} of ${total}`
}
