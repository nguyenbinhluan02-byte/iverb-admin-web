import { CalendarDays, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react'
import { Popover } from 'radix-ui'
import { useState } from 'react'
import { MONTHS, monthLabel } from './usersModel'

const yearButton =
  'flex size-7 items-center justify-center rounded-lg text-ink hover:bg-page disabled:text-[#C7C7CC] disabled:hover:bg-transparent'

// Design: Users → Joined month picker. Years from `firstYear` to the current
// year; future months disabled; no per-month counts.
export function MonthPicker({
  value,
  onChange,
  firstYear,
  today,
}: {
  /** 'YYYY-MM' or '' (any month). */
  value: string
  onChange: (month: string) => void
  firstYear: number
  /** 'YYYY-MM-DD' (UTC). */
  today: string
}) {
  const thisYear = Number(today.slice(0, 4))
  const thisMonth = Number(today.slice(5, 7))
  const minYear = Math.min(firstYear, thisYear)
  const [open, setOpen] = useState(false)
  const [year, setYear] = useState(thisYear)

  const openChange = (next: boolean) => {
    // Opens on the selected year, or the current year when nothing is selected.
    if (next) setYear(value ? Number(value.slice(0, 4)) : thisYear)
    setOpen(next)
  }
  const pick = (month: string) => {
    onChange(month)
    setOpen(false)
  }

  return (
    <Popover.Root open={open} onOpenChange={openChange}>
      <Popover.Trigger asChild>
        <button
          type="button"
          className={`flex h-[34px] items-center gap-[7px] rounded-[9px] border bg-card px-2.5 whitespace-nowrap ${
            open ? 'border-ink' : 'border-line-strong hover:border-disabled'
          }`}
        >
          <CalendarDays size={15} strokeWidth={2.2} className="text-muted" />
          <span className="text-[13px] font-semibold text-muted">Joined</span>
          <span className="text-[13px] font-extrabold">{monthLabel(value)}</span>
          <ChevronDown size={14} strokeWidth={2.4} className="text-muted" />
        </button>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
          align="start"
          sideOffset={6}
          aria-label="Joined month"
          className="z-[60] flex w-[272px] flex-col gap-2.5 rounded-xl border border-line bg-card p-3 shadow-menu"
        >
          <div className="flex items-center justify-between">
            <button
              type="button"
              aria-label="Previous year"
              disabled={year <= minYear}
              onClick={() => setYear(year - 1)}
              className={yearButton}
            >
              <ChevronLeft size={16} strokeWidth={2.4} />
            </button>
            <span className="text-sm font-extrabold">{year}</span>
            <button
              type="button"
              aria-label="Next year"
              disabled={year >= thisYear}
              onClick={() => setYear(year + 1)}
              className={yearButton}
            >
              <ChevronRight size={16} strokeWidth={2.4} />
            </button>
          </div>

          <div className="grid grid-cols-3 gap-1.5">
            {MONTHS.map((name, i) => {
              const month = `${year}-${String(i + 1).padStart(2, '0')}`
              const on = month === value
              const future = year > thisYear || (year === thisYear && i + 1 > thisMonth)
              return (
                <button
                  key={name}
                  type="button"
                  disabled={future}
                  aria-pressed={on}
                  onClick={() => pick(month)}
                  className={`h-[38px] rounded-[9px] border text-[13px] font-bold ${
                    on
                      ? 'border-brand bg-brand text-white'
                      : future
                        ? 'border-transparent bg-[#F7F7F8] text-[#C7C7CC]'
                        : 'border-line-strong bg-card text-ink hover:bg-page'
                  }`}
                >
                  {name}
                </button>
              )
            })}
          </div>

          <button
            type="button"
            onClick={() => pick('')}
            className="h-[34px] w-full rounded-[9px] border border-line-strong bg-card text-[13px] font-bold hover:bg-page"
          >
            Any month
          </button>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  )
}
