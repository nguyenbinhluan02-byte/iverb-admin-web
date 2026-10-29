import { ChevronLeft, ChevronRight } from 'lucide-react'
import { pageCount, pageItems, rangeLabel } from '@/lib/pagination'

const button =
  'flex h-[34px] min-w-[34px] items-center justify-center rounded-[9px] border px-2 text-[13px] font-bold'

// Design: Library → Pagination (below the list card).
export function Pagination({
  page,
  size,
  total,
  onChange,
}: {
  page: number
  size: number
  total: number
  onChange: (page: number) => void
}) {
  if (!total) return null
  const pages = pageCount(total, size)

  return (
    <nav aria-label="Pagination" className="flex flex-wrap items-center justify-between gap-3">
      <span className="text-[13px] font-semibold text-muted">{rangeLabel(page, size, total)}</span>
      <div className="flex items-center gap-1.5">
        <button
          type="button"
          aria-label="Previous page"
          disabled={page <= 1}
          onClick={() => onChange(page - 1)}
          className={`${button} border-line-strong bg-card text-ink disabled:text-[#C7C7CC]`}
        >
          <ChevronLeft size={16} strokeWidth={2.4} />
        </button>
        {pageItems(page, pages).map((p, i) =>
          p === 'gap' ? (
            <span key={`gap-${i}`} className="px-1 text-[13px] font-bold text-subtle">
              …
            </span>
          ) : (
            <button
              key={p}
              type="button"
              aria-current={p === page ? 'page' : undefined}
              onClick={() => onChange(p)}
              className={`${button} ${
                p === page
                  ? 'border-ink bg-ink text-white'
                  : 'border-line-strong bg-card text-ink hover:bg-page'
              }`}
            >
              {p}
            </button>
          ),
        )}
        <button
          type="button"
          aria-label="Next page"
          disabled={page >= pages}
          onClick={() => onChange(page + 1)}
          className={`${button} border-line-strong bg-card text-ink disabled:text-[#C7C7CC]`}
        >
          <ChevronRight size={16} strokeWidth={2.4} />
        </button>
      </div>
    </nav>
  )
}
