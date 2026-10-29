// Design: Components → Segmented control.
export function Segmented<T extends string>({
  value,
  options,
  onChange,
}: {
  value: T
  options: { value: T; label: string }[]
  onChange: (value: T) => void
}) {
  return (
    <div className="flex gap-1 rounded-[10px] bg-track p-1">
      {options.map((o) => {
        const on = o.value === value
        return (
          <button
            key={o.value}
            type="button"
            onClick={() => onChange(o.value)}
            className={`rounded-[7px] px-3.5 py-[7px] text-[13px] font-bold whitespace-nowrap ${
              on ? 'bg-card text-ink shadow-[0_1px_2px_rgba(0,0,0,.08)]' : 'text-muted'
            }`}
          >
            {o.label}
          </button>
        )
      })}
    </div>
  )
}
