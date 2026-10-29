import { makeQuestion } from '@/test/fixtures'
import { countPool, DEFAULT_PICK, filterPool, pickPool, pickWhen } from './pickModel'

const questions = [
  makeQuestion({ id: 1, status: 'published', date: '2026-10-12' }),
  makeQuestion({
    id: 2,
    status: 'published',
    date: '2026-09-01',
    author: { id: 'u', name: 'Tuan', role: 'user' },
  }),
  makeQuestion({ id: 3, status: 'live', date: '2026-10-29' }),
  makeQuestion({ id: 4, status: 'scheduled', date: '2026-11-02' }),
  makeQuestion({ id: 5, status: 'draft', date: '2026-11-06' }),
  makeQuestion({ id: 6, status: 'unscheduled', date: null }),
]
const pool = pickPool(questions)
const ids = (f = {}) => filterPool(pool, { ...DEFAULT_PICK, ...f }).map((q) => q.id)

describe('pick from library', () => {
  it('pool: shown, drafts and unscheduled — not live / scheduled', () => {
    expect(pool.map((q) => q.id)).toEqual([1, 2, 5, 6])
  })

  it('published first, shown longest ago by default', () => {
    expect(ids()).toEqual([2, 1, 5, 6])
    expect(ids({ sort: 'recent' })).toEqual([1, 2, 5, 6])
  })

  it('filters and counts', () => {
    expect(ids({ status: 'unpublished' })).toEqual([5, 6])
    expect(ids({ source: 'user' })).toEqual([2])
    expect(countPool(pool, 'all')).toEqual({ all: 4, published: 2, unpublished: 2 })
    expect(countPool(pool, 'admin')).toEqual({ all: 3, published: 1, unpublished: 2 })
  })

  it('when label', () => {
    expect(pickWhen(questions[0])).toBe('Shown Mon, Oct 12')
    expect(pickWhen(questions[4])).toBe('Draft · on Fri, Nov 6 (will move)')
    expect(pickWhen(questions[5])).toBe('Not scheduled')
  })
})
