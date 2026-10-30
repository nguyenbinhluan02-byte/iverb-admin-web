import type { QType, SearchSource, SearchStatus } from '@/services/questions'

// Filtering / counting happens on the server (api.admin_search_questions).
export type StatusFilter = SearchStatus
export type SourceFilter = SearchSource
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
