import type { Question } from '@/services/questions'
import { countFilters, DEFAULT_FILTERS, filterQuestions, type StatusFilter } from './filter'

const q = (id: number, over: Partial<Question>): Question => ({
  id,
  type: 'single',
  prompt: `Question ${id}`,
  content: {
    options: [
      { id: 'a', text: 'went' },
      { id: 'b', text: 'gone' },
    ],
  },
  answer_key: { correct: ['a'] },
  status: 'published',
  date: '2026-10-01',
  author: { id: 'u', name: 'Linh Tran', role: 'admin' },
  usage_count: 1,
  created_at: '',
  updated_at: '',
  ...over,
})

const all = [
  q(1, { status: 'scheduled' }),
  q(2, { status: 'live', author: { id: 'x', name: 'Tuan Nguyen', role: 'user' } }),
  q(3, {
    status: 'draft',
    type: 'fill',
    content: { before: 'I have', after: 'home.' },
    answer_key: { accepted: ['gone'] },
  }),
  q(4, { status: 'published' }),
  q(5, { status: 'unscheduled', author: null }),
]
const ids = (qs: Question[]) => qs.map((x) => x.id)

describe('filterQuestions', () => {
  it('keeps the RPC order for newest and reverses for oldest', () => {
    expect(ids(filterQuestions(all, DEFAULT_FILTERS))).toEqual([1, 2, 3, 4, 5])
    expect(ids(filterQuestions(all, { ...DEFAULT_FILTERS, sort: 'oldest' }))).toEqual([
      5, 4, 3, 2, 1,
    ])
  })

  it('filters by status', () => {
    const by = (status: StatusFilter) => ids(filterQuestions(all, { ...DEFAULT_FILTERS, status }))
    expect(by('published')).toEqual([4])
    expect(by('upcoming')).toEqual([1, 2])
    expect(by('unpublished')).toEqual([1, 3, 5])
    expect(by('draft')).toEqual([3])
  })

  it('filters by source and type', () => {
    expect(ids(filterQuestions(all, { ...DEFAULT_FILTERS, source: 'user' }))).toEqual([2])
    expect(ids(filterQuestions(all, { ...DEFAULT_FILTERS, source: 'admin' }))).toEqual([1, 3, 4, 5])
    expect(ids(filterQuestions(all, { ...DEFAULT_FILTERS, type: 'fill' }))).toEqual([3])
  })

  it('searches prompt, sentence, answer, author and options', () => {
    const find = (query: string) => ids(filterQuestions(all, { ...DEFAULT_FILTERS, query }))
    expect(find('question 4')).toEqual([4])
    expect(find('I HAVE ___')).toEqual([3])
    expect(find('tuan')).toEqual([2])
    expect(find('went')).toEqual([1, 2, 4, 5])
    expect(find('gone')).toEqual([1, 2, 3, 4, 5])
  })
})

describe('countFilters', () => {
  it('counts statuses within the source filter', () => {
    expect(countFilters(all, 'all').status).toEqual({
      all: 5,
      published: 1,
      unpublished: 3,
      upcoming: 2,
      draft: 1,
    })
    expect(countFilters(all, 'user').status).toEqual({
      all: 1,
      published: 0,
      unpublished: 0,
      upcoming: 1,
      draft: 0,
    })
    expect(countFilters(all, 'user').sources).toEqual({ all: 5, admin: 4, user: 1 })
  })
})
