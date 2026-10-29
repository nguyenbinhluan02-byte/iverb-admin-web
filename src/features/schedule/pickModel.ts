import type { SourceFilter, TypeFilter } from '@/features/library/filter'
import { dayLabel } from '@/lib/question'
import type { Question } from '@/services/questions'

// "Choose from library": api.admin_search_questions with p_pickable = true
// (shown → copied, drafts / no day → moved; shown first).
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

export function pickWhen(q: Question): string {
  if (q.status === 'published') return `Shown ${dayLabel(q.date!)}`
  if (q.status === 'draft') return q.date ? `Draft · on ${dayLabel(q.date)} (will move)` : 'Draft'
  return 'Not scheduled'
}
