import { matchesSource, type SourceFilter, type TypeFilter } from '@/features/library/filter'
import { dayLabel, searchText } from '@/lib/question'
import type { Question } from '@/services/questions'

export type PickStatus = 'all' | 'published' | 'unpublished'
export type PickSort = 'oldest' | 'recent'

export interface PickFilters {
  query: string
  status: PickStatus
  source: SourceFilter
  type: TypeFilter
  sort: PickSort
}

export const DEFAULT_PICK: PickFilters = {
  query: '',
  status: 'all',
  source: 'all',
  type: 'all',
  sort: 'oldest',
}

/** Questions that can go on an empty day: shown before (copied), drafts and unscheduled (moved). */
export function pickPool(questions: Question[]): Question[] {
  return questions.filter(
    (q) => q.status === 'published' || q.status === 'draft' || q.status === 'unscheduled',
  )
}

const matchesStatus = (q: Question, s: PickStatus) =>
  s === 'all' || (s === 'published') === (q.status === 'published')

export function filterPool(pool: Question[], f: PickFilters): Question[] {
  const query = f.query.trim().toLowerCase()
  const rank = (q: Question) => (q.status === 'published' ? 0 : 1)
  const byDate = (a: Question, b: Question) => {
    // Undated last, then by id.
    if (a.date !== b.date) {
      if (!a.date) return 1
      if (!b.date) return -1
      return f.sort === 'oldest' ? a.date.localeCompare(b.date) : b.date.localeCompare(a.date)
    }
    return a.id - b.id
  }
  return pool
    .filter(
      (q) =>
        matchesStatus(q, f.status) &&
        matchesSource(q, f.source) &&
        (f.type === 'all' || q.type === f.type) &&
        (!query || searchText(q).includes(query)),
    )
    .sort((a, b) => rank(a) - rank(b) || byDate(a, b))
}

export function countPool(pool: Question[], source: SourceFilter): Record<PickStatus, number> {
  const bySource = pool.filter((q) => matchesSource(q, source))
  return {
    all: bySource.length,
    published: bySource.filter((q) => matchesStatus(q, 'published')).length,
    unpublished: bySource.filter((q) => matchesStatus(q, 'unpublished')).length,
  }
}

export function pickWhen(q: Question): string {
  if (q.status === 'published') return `Shown ${dayLabel(q.date!)}`
  if (q.status === 'draft') return q.date ? `Draft · on ${dayLabel(q.date)} (will move)` : 'Draft'
  return 'Not scheduled'
}
