// "Load more" row under a cursor-paged list.
export function LoadMore({
  shown,
  total,
  loading,
  onClick,
}: {
  shown: number
  total?: number
  loading: boolean
  onClick: () => void
}) {
  return (
    <div className="flex items-center justify-center gap-3 border-t border-line px-5 py-3.5">
      {total != null && (
        <span className="text-xs font-semibold text-muted">
          {shown} of {total}
        </span>
      )}
      <button
        type="button"
        disabled={loading}
        onClick={onClick}
        className="rounded-[9px] border border-line-strong bg-card px-3.5 py-2 text-[13px] font-bold hover:bg-page disabled:text-subtle"
      >
        {loading ? 'Loading…' : 'Load more'}
      </button>
    </div>
  )
}
