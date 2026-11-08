import type { GrammarContent } from '@/services/lessons'
import type { LocaleCounts, TranslationItem } from '@/services/translations'
import { BLOCK_NAMES } from './editorModel'

// Translation status for the Languages card and the review screen (design
// changes since v1 §5).

export type LocaleState = 'missing' | 'old' | 'review' | 'ok' | 'busy'

export const LOCALE_STATE: Record<LocaleState, { dot: string; fg: string }> = {
  missing: { dot: '#C9C9CE', fg: '#8E8E93' },
  old: { dot: '#F5333F', fg: '#C21D29' },
  review: { dot: '#F2A76B', fg: '#B4500F' },
  ok: { dot: '#1FA971', fg: '#137A51' },
  busy: { dot: '#C9C9CE', fg: '#6E6E73' },
}

/** Sort: missing → old → review → busy → ok. */
export const LOCALE_ORDER: LocaleState[] = ['missing', 'old', 'review', 'busy', 'ok']

export function localeState(c: LocaleCounts | undefined, total: number, busy: boolean): { state: LocaleState; label: string } {
  if (busy) return { state: 'busy', label: 'Translating…' }
  if (!c || total === 0 || c.missing === total) return { state: 'missing', label: 'Not translated' }
  if (c.stale + c.missing > 0) return { state: 'old', label: `${c.stale + c.missing} outdated` }
  if (c.reviewed >= total) return { state: 'ok', label: 'Reviewed' }
  return { state: 'review', label: `Machine · ${c.fresh - c.reviewed} to review` }
}

export type ItemState = 'reviewed' | 'machine' | 'outdated' | 'missing' | 'translating'

export const ITEM_STATE: Record<ItemState, { label: string; bg: string; fg: string }> = {
  reviewed: { label: 'Reviewed', bg: 'rgba(31,169,113,0.12)', fg: '#137A51' },
  machine: { label: 'Machine', bg: '#FFF4EC', fg: '#B4500F' },
  outdated: { label: 'Outdated', bg: 'rgba(245,51,63,0.1)', fg: '#C21D29' },
  translating: { label: 'Translating…', bg: '#F2F2F3', fg: '#6E6E73' },
  missing: { label: 'Not translated', bg: '#F2F2F3', fg: '#6E6E73' },
}

export function itemState(item: TranslationItem | undefined, busy: boolean): ItemState {
  if (busy) return 'translating'
  if (!item?.translation) return 'missing'
  if (!item.fresh) return 'outdated'
  return item.status === 'reviewed' ? 'reviewed' : 'machine'
}

// ---------------------------------------------------------------------------
// Review fields of a grammar card. Editable = translated fields; locked = the
// English being learned (shown, never edited).

export type Path = (string | number)[]

export type ReviewRow =
  | { kind: 'section'; title: string }
  | { kind: 'locked'; text: string }
  | { kind: 'field'; path: Path; label: string; source: string }

const unstar = (s: string) => s.replace(/\*/g, '')

export function grammarRows(source: GrammarContent): ReviewRow[] {
  const rows: ReviewRow[] = [
    { kind: 'field', path: ['label'], label: 'Card label', source: source.label },
    { kind: 'field', path: ['heading'], label: 'Heading', source: source.heading },
  ]
  source.blocks.forEach((b, i) => {
    rows.push({ kind: 'section', title: BLOCK_NAMES[b.type] })
    const at = (...p: Path): Path => ['blocks', i, ...p]
    switch (b.type) {
      case 'text':
      case 'tip':
        rows.push({ kind: 'field', path: at('text'), label: b.type === 'tip' ? 'Tip' : 'Text', source: b.text })
        break
      case 'formula':
        b.rows.forEach((r, j) => {
          rows.push({ kind: 'field', path: at('rows', j, 'label'), label: 'Row label', source: r.label })
          rows.push({ kind: 'locked', text: r.parts.join(' + ') })
        })
        break
      case 'examples':
        b.items.forEach((it, j) => {
          rows.push({ kind: 'locked', text: unstar(it.sentence) })
          rows.push({ kind: 'field', path: at('items', j, 'translation'), label: 'Translation', source: unstar(it.sentence) })
        })
        break
      case 'compare':
        b.cols.forEach((c, j) => {
          rows.push({ kind: 'field', path: at('cols', j, 'title'), label: 'Column title', source: c.title })
          c.lines.forEach((l, k) =>
            rows.push({ kind: 'field', path: at('cols', j, 'lines', k), label: `Line ${k + 1}`, source: l }),
          )
        })
        break
      case 'signals':
        b.groups.forEach((g, j) => {
          rows.push({ kind: 'field', path: at('groups', j, 'title'), label: 'Group title', source: g.title })
          rows.push({ kind: 'locked', text: g.words.join(', ') })
        })
        break
      case 'mistake':
        rows.push({ kind: 'locked', text: `✕ ${b.wrong}   ✓ ${b.right}` })
        if (b.why) rows.push({ kind: 'field', path: at('why'), label: 'Why', source: b.why })
        break
      case 'check':
        rows.push({ kind: 'locked', text: `${b.question} — ${b.options.join(' / ')}` })
        rows.push({ kind: 'field', path: at('ok'), label: 'If right', source: b.ok })
        rows.push({ kind: 'field', path: at('bad'), label: 'If wrong', source: b.bad })
        break
    }
  })
  return rows
}

export function getAt(obj: unknown, path: Path): string {
  let cur: unknown = obj
  for (const p of path) {
    if (cur == null) return ''
    cur = (cur as Record<string | number, unknown>)[p]
  }
  return typeof cur === 'string' ? cur : ''
}

export function setAt<T>(obj: T, path: Path, value: string): T {
  const copy = structuredClone(obj) as unknown as Record<string | number, unknown>
  let cur = copy
  path.slice(0, -1).forEach((p, i) => {
    if (cur[p] == null) cur[p] = typeof path[i + 1] === 'number' ? [] : {}
    cur = cur[p] as Record<string | number, unknown>
  })
  cur[path[path.length - 1]] = value
  return copy as unknown as T
}
