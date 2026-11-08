import { describe, expect, it } from 'vitest'
import type { GrammarContent } from '@/services/lessons'
import type { TranslationItem } from '@/services/translations'
import { getAt, grammarRows, itemState, localeState, setAt } from './translationModel'

const counts = (c: Partial<{ fresh: number; stale: number; missing: number; reviewed: number }>) => ({
  locale: 'vi', fresh: 0, stale: 0, missing: 0, reviewed: 0, ...c,
})

describe('translationModel', () => {
  it('locale state (design table)', () => {
    expect(localeState(counts({ missing: 7 }), 7, false)).toEqual({ state: 'missing', label: 'Not translated' })
    expect(localeState(counts({ fresh: 5, stale: 1, missing: 1 }), 7, false)).toEqual({ state: 'old', label: '2 outdated' })
    expect(localeState(counts({ fresh: 7, reviewed: 3 }), 7, false)).toEqual({ state: 'review', label: 'Machine · 4 to review' })
    expect(localeState(counts({ fresh: 7, reviewed: 7 }), 7, false)).toEqual({ state: 'ok', label: 'Reviewed' })
    expect(localeState(counts({ fresh: 7 }), 7, true).state).toBe('busy')
  })

  it('item state', () => {
    const base = { kind: 'card', id: 1, source: {} } as unknown as TranslationItem
    expect(itemState({ ...base, translation: null, status: null, fresh: null } as TranslationItem, false)).toBe('missing')
    expect(itemState({ ...base, translation: {}, status: 'machine', fresh: false } as TranslationItem, false)).toBe('outdated')
    expect(itemState({ ...base, translation: {}, status: 'machine', fresh: true } as TranslationItem, false)).toBe('machine')
    expect(itemState({ ...base, translation: {}, status: 'reviewed', fresh: true } as TranslationItem, false)).toBe('reviewed')
    expect(itemState(undefined, true)).toBe('translating')
  })

  it('review rows: translated fields vs locked English', () => {
    const src: GrammarContent = {
      label: 'Rule',
      heading: 'H',
      blocks: [
        { type: 'examples', items: [{ sentence: 'I *went*.' }] },
        { type: 'mistake', wrong: 'w', right: 'r' },
        { type: 'signals', groups: [{ title: 'Past', tone: 'accent', words: ['ago'] }] },
      ],
    }
    const rows = grammarRows(src)
    const fields = rows.filter((r) => r.kind === 'field').map((r) => (r.kind === 'field' ? r.path.join('.') : ''))
    expect(fields).toEqual(['label', 'heading', 'blocks.0.items.0.translation', 'blocks.2.groups.0.title'])
    expect(rows.filter((r) => r.kind === 'locked').map((r) => (r.kind === 'locked' ? r.text : ''))).toEqual([
      'I went.',
      '✕ w   ✓ r',
      'ago',
    ])
  })

  it('getAt / setAt', () => {
    const tr = { blocks: [{ type: 'examples', items: [{ sentence: 's' }] }] }
    const next = setAt(tr, ['blocks', 0, 'items', 0, 'translation'], 'Tôi đã đi.')
    expect(getAt(next, ['blocks', 0, 'items', 0, 'translation'])).toBe('Tôi đã đi.')
    expect(getAt(tr, ['blocks', 0, 'items', 0, 'translation'])).toBe('') // not mutated
  })
})
