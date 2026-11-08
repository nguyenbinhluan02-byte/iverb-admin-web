import type { ButtonHTMLAttributes, ReactNode } from 'react'

// Small pieces shared by the week editor (design Weekly Lessons.dc.html).

export const inputCls =
  'w-full rounded-[10px] border border-line-strong bg-card px-3 py-2.5 text-sm text-ink disabled:bg-page disabled:text-muted'
export const smallInputCls =
  'w-full rounded-[9px] border border-line-strong bg-card px-2.5 py-[9px] text-[13px] text-ink disabled:bg-page disabled:text-muted'

export function FieldLabel({ children, color }: { children: ReactNode; color?: string }) {
  return (
    <span className="text-xs font-bold" style={{ color: color ?? '#6E6E73' }}>
      {children}
    </span>
  )
}

/** Orange when on (design `chip`). */
export function Chip({
  on,
  children,
  className = '',
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { on: boolean }) {
  return (
    <button
      type="button"
      {...props}
      className={`rounded-full border px-[11px] py-1.5 text-[13px] font-bold disabled:cursor-not-allowed ${className}`}
      style={{
        borderColor: on ? '#F2711C' : '#E4E4E7',
        background: on ? 'rgba(242,113,28,0.1)' : '#fff',
        color: on ? '#C25A14' : '#17171A',
      }}
    >
      {children}
    </button>
  )
}

export function IconButton({
  title,
  children,
  danger,
  className = '',
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { title: string; danger?: boolean }) {
  return (
    <button
      type="button"
      title={title}
      aria-label={title}
      {...props}
      className={`flex size-8 items-center justify-center rounded-lg border border-line-strong bg-card disabled:opacity-40 ${
        danger ? 'text-red' : 'text-ink'
      } ${className}`}
    >
      {children}
    </button>
  )
}

export function LinkButton({ children, ...props }: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="button"
      {...props}
      className="self-start text-[13px] font-extrabold text-brand disabled:text-subtle"
    >
      {children}
    </button>
  )
}
