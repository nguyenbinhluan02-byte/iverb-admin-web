import { isUserSubmitted, searchText } from '@/lib/question'
import type { Question, QType } from '@/services/questions'

export type StatusFilter = 'all' | 'published' | 'unpublished' | 'upcoming' | 'draft'
export type SourceFilter = 'all' | 'admin' | 'user'
export type TypeFilter = 'all' | QType
export type SortOrder = 'newest' | 'oldest'

export interface LibraryFilters {
  query: string
  status: StatusFilter
  source: SourceFilter
  type: TypeFilter
  sort: SortOrder
}

export const DEFAULT_FILTERS: LibraryFilters = {
  query: '',
  status: 'all',
  source: 'all',
  type: 'all',
  sort: 'newest',
}

export function matchesStatus(q: Question, status: StatusFilter): boolean {
  switch (status) {
    case 'all':
      return true
    case 'published':
      return q.status === 'published'
    // Not live yet: scheduled, drafts and questions without a day.
    case 'unpublished':
      return q.status === 'scheduled' || q.status === 'draft' || q.status === 'unscheduled'
    case 'upcoming':
      return q.status === 'scheduled' || q.status === 'live'
    case 'draft':
      return q.status === 'draft'
  }
}

export function matchesSource(q: Question, source: SourceFilter): boolean {
  if (source === 'all') return true
  return source === 'user' ? isUserSubmitted(q) : !isUserSubmitted(q)
}

export function filterQuestions(questions: Question[], f: LibraryFilters): Question[] {
  const query = f.query.trim().toLowerCase()
  // The RPC returns newest day first.
  const ordered = f.sort === 'oldest' ? [...questions].reverse() : questions
  return ordered.filter(
    (q) =>
      matchesSource(q, f.source) &&
      matchesStatus(q, f.status) &&
      (f.type === 'all' || q.type === f.type) &&
      (!query || searchText(q).includes(query)),
  )
}

/** Status counts respect the "Added by" filter; source counts are over everything. */
export function countFilters(questions: Question[], source: SourceFilter) {
  const bySource = questions.filter((q) => matchesSource(q, source))
  const status = Object.fromEntries(
    (['all', 'published', 'unpublished', 'upcoming', 'draft'] as const).map((s) => [
      s,
      bySource.filter((q) => matchesStatus(q, s)).length,
    ]),
  ) as Record<StatusFilter, number>
  const sources = Object.fromEntries(
    (['all', 'admin', 'user'] as const).map((s) => [
      s,
      questions.filter((q) => matchesSource(q, s)).length,
    ]),
  ) as Record<SourceFilter, number>
  return { status, sources }
}
