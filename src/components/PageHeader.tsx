import type { ReactNode } from 'react'

export function PageHeader({
  kicker,
  title,
  actions,
}: {
  kicker: ReactNode
  title: ReactNode
  actions?: ReactNode
}) {
  return (
    <header className="flex flex-wrap items-end justify-between gap-4">
      <div>
        <div className="text-xs font-extrabold tracking-[.06em] text-muted uppercase">{kicker}</div>
        <h1 className="mt-1 text-[28px] font-extrabold tracking-[-0.01em]">{title}</h1>
      </div>
      {actions && <div className="flex items-center gap-3">{actions}</div>}
    </header>
  )
}
