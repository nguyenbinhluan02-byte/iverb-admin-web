import { Check, ChevronDown, type LucideIcon } from 'lucide-react'
import { Popover } from 'radix-ui'
import { useState } from 'react'

export interface FilterOption<T extends string> {
  value: T
  label: string
  icon: LucideIcon
  /** Icon tile tint, e.g. green for Published. Grey by default. */
  iconColor?: string
  iconBg?: string
  count?: number
}

// Design: Components → Dropdown (filter).
export function FilterDropdown<T extends string>({
  label,
  icon: TriggerIcon,
  value,
  options,
  onChange,
}: {
  label: string
  icon: LucideIcon
  value: T
  options: FilterOption<T>[]
  onChange: (value: T) => void
}) {
  const [open, setOpen] = useState(false)
  const current = options.find((o) => o.value === value) ?? options[0]

  return (
    <Popover.Root open={open} onOpenChange={setOpen}>
      <Popover.Trigger asChild>
        <button
          type="button"
          className={`flex h-[34px] items-center gap-[7px] rounded-[9px] border bg-card px-2.5 whitespace-nowrap ${
            open ? 'border-ink' : 'border-line-strong hover:border-disabled'
          }`}
        >
          <TriggerIcon size={15} strokeWidth={2.2} className="text-muted" />
          <span className="text-[13px] font-semibold text-muted">{label}</span>
          <span className="text-[13px] font-extrabold">{current.label}</span>
          <ChevronDown size={14} strokeWidth={2.4} className="text-muted" />
        </button>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
          align="start"
          sideOffset={6}
          className="z-40 flex min-w-[230px] flex-col gap-0.5 rounded-xl border border-line bg-card p-1.5 shadow-menu"
        >
          {options.map((o) => {
            const on = o.value === value
            const Icon = o.icon
            return (
              <button
                key={o.value}
                type="button"
                onClick={() => {
                  onChange(o.value)
                  setOpen(false)
                }}
                className={`flex w-full items-center gap-2.5 rounded-lg px-2 py-[7px] text-left text-ink hover:bg-page ${
                  on ? 'bg-brand-tint-2' : ''
                }`}
              >
                <span
                  className="flex size-7 shrink-0 items-center justify-center rounded-lg"
                  style={{ background: o.iconBg ?? 'var(--color-page)' }}
                >
                  <Icon size={15} strokeWidth={2.2} color={o.iconColor ?? 'var(--color-muted)'} />
                </span>
                <span
                  className={`flex-1 text-sm whitespace-nowrap ${on ? 'font-extrabold' : 'font-semibold'}`}
                >
                  {o.label}
                </span>
                {o.count != null && (
                  <span className="text-xs font-bold text-subtle">{o.count}</span>
                )}
                <span className="flex w-4 justify-center">
                  {on && <Check size={16} strokeWidth={2.8} className="text-brand" />}
                </span>
              </button>
            )
          })}
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  )
}
