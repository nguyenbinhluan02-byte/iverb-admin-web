import { CheckCheck, ChevronDown, Languages, RefreshCw, Search } from 'lucide-react'
import { useState } from 'react'
import { LOCALES, type LessonTranslations } from '@/services/translations'
import { LOCALE_ORDER, LOCALE_STATE, localeState, type LocaleState } from './translationModel'

// Languages card of the Lesson tab (design changes since v1 §5 UI).

type Filter = 'all' | 'attn' | 'ok' | LocaleState

const TABS: { id: Filter; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'attn', label: 'Needs review' },
  { id: 'ok', label: 'Reviewed' },
]

const matches = (f: Filter, s: LocaleState) =>
  f === 'all' || (f === 'attn' ? s === 'missing' || s === 'old' || s === 'review' : f === s)

export function LanguagesCard({
  summary,
  saved,
  locale,
  onLocale,
  busy,
  hasMachine,
  onRetranslate,
  onMarkAll,
}: {
  summary: LessonTranslations | undefined
  /** The lesson exists (translations need saved cards). */
  saved: boolean
  locale: string | null
  onLocale: (locale: string | null) => void
  busy: Set<string>
  /** The selected language has machine translations still to review. */
  hasMachine: boolean
  onRetranslate: (locale: string) => void
  onMarkAll: (locale: string) => void
}) {
  const [open, setOpen] = useState(false)
  const [filter, setFilter] = useState<Filter>('all')
  const [query, setQuery] = useState('')

  const total = (summary?.cards_total ?? 0) + (summary?.words_total ?? 0)
  const rows = LOCALES.map((l) => ({
    ...l,
    ...localeState(summary?.locales.find((c) => c.locale === l.code), total, busy.has('*') || busy.has(l.code)),
  })).sort((a, b) => LOCALE_ORDER.indexOf(a.state) - LOCALE_ORDER.indexOf(b.state))

  const count = (s: LocaleState) => rows.filter((r) => r.state === s).length
  const chips = (
    [
      { f: 'ok', n: count('ok'), label: 'reviewed', dot: '#1FA971' },
      { f: 'attn', n: count('review'), label: 'to review', dot: '#F2A76B' },
      { f: 'old', n: count('old'), label: 'outdated', dot: '#F5333F' },
      { f: 'missing', n: count('missing'), label: 'not translated', dot: '#C9C9CE' },
    ] as const
  ).filter((c) => c.n > 0)

  const q = query.trim().toLowerCase()
  const shown = rows.filter(
    (r) =>
      matches(filter, r.state) &&
      (!q || r.name.toLowerCase().includes(q) || r.english.toLowerCase().includes(q) || r.code.includes(q)),
  )
  const current = rows.find((r) => r.code === locale) ?? null

  return (
    <div className="flex flex-col gap-3 rounded-[18px] border border-line bg-card px-4 py-3.5">
      <div className="flex flex-wrap items-center justify-between gap-2.5">
        <div className="flex min-w-0 items-center gap-2.5">
          <span className="flex size-[30px] flex-none items-center justify-center rounded-lg bg-page">
            <Languages size={16} strokeWidth={2.2} />
          </span>
          <span className="flex min-w-0 flex-col gap-px">
            <span className="text-sm font-extrabold">Languages</span>
            <span className="text-xs text-muted">
              Write in English. Saving translates every language that's missing or outdated. Users see machine
              translations until you review them.
            </span>
          </span>
        </div>
        {current && (
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              disabled={busy.has(current.code)}
              title="Reviewed cards are kept unless the English changed"
              onClick={() => onRetranslate(current.code)}
              className="flex items-center gap-1.5 rounded-[9px] border border-line-strong bg-card px-3 py-2 text-[13px] font-bold whitespace-nowrap disabled:opacity-50"
            >
              <RefreshCw size={14} strokeWidth={2.4} />
              <span>Re-translate {current.name}</span>
            </button>
            {hasMachine && (
              <button
                type="button"
                onClick={() => onMarkAll(current.code)}
                className="flex items-center gap-1.5 rounded-[9px] border border-line-strong bg-card px-3 py-2 text-[13px] font-bold whitespace-nowrap"
              >
                <CheckCheck size={14} strokeWidth={2.4} />
                <span>Mark all {current.name} reviewed</span>
              </button>
            )}
          </div>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-2.5">
        <button
          type="button"
          onClick={() => onLocale(null)}
          className="flex h-10 items-center gap-2 rounded-[10px] border-[1.5px] px-3.5 text-[13px] font-extrabold whitespace-nowrap"
          style={{
            borderColor: locale ? '#E4E4E7' : '#F2711C',
            background: locale ? '#fff' : 'rgba(242,113,28,0.06)',
          }}
        >
          <span className="size-2 rounded-full bg-ink" />
          Tiếng Anh<span className="font-semibold text-muted">· Source</span>
        </button>

        <div className="relative">
          <button
            type="button"
            disabled={!saved}
            onClick={() => setOpen((o) => !o)}
            className="flex h-10 min-w-60 items-center gap-2 rounded-[10px] border-[1.5px] pr-3 pl-3.5 disabled:opacity-50"
            style={{
              borderColor: current ? '#F2711C' : '#E4E4E7',
              background: current ? 'rgba(242,113,28,0.06)' : '#fff',
            }}
          >
            <span className="size-2 flex-none rounded-full" style={{ background: current ? LOCALE_STATE[current.state].dot : '#C9C9CE' }} />
            <span className="flex-1 text-left text-[13px] font-extrabold whitespace-nowrap">
              {current?.name ?? (saved ? 'Choose a language' : 'Save the lesson first')}
            </span>
            <span
              className="text-xs font-bold whitespace-nowrap"
              style={{ color: current ? LOCALE_STATE[current.state].fg : '#8E8E93' }}
            >
              {current?.label ?? `${LOCALES.length} languages`}
            </span>
            <ChevronDown size={14} strokeWidth={2.4} />
          </button>
          {open && (
            <>
              <div className="fixed inset-0 z-30" onClick={() => setOpen(false)} />
              <div className="absolute top-[calc(100%+6px)] left-0 z-31 flex w-[340px] flex-col overflow-hidden rounded-[14px] border border-line bg-card shadow-menu">
                <div className="flex flex-col gap-2 border-b border-page p-2.5">
                  <div className="flex h-9 items-center gap-2 rounded-[9px] bg-page px-2.5">
                    <Search size={15} className="text-muted" />
                    <input
                      autoFocus
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      placeholder={`Search ${LOCALES.length} languages`}
                      className="min-w-0 flex-1 border-none bg-transparent text-[13px] outline-none"
                    />
                  </div>
                  <div className="flex gap-1 rounded-[9px] bg-page p-[3px]">
                    {TABS.map((t) => {
                      const on = filter === t.id || (t.id === 'attn' && (filter === 'old' || filter === 'missing'))
                      return (
                        <button
                          key={t.id}
                          type="button"
                          onClick={() => setFilter(t.id)}
                          className="flex-1 rounded-[7px] px-2 py-1.5 text-xs font-extrabold whitespace-nowrap"
                          style={{
                            background: on ? '#fff' : 'transparent',
                            color: on ? '#17171A' : '#6E6E73',
                            boxShadow: on ? '0 1px 2px rgba(0,0,0,0.08)' : 'none',
                          }}
                        >
                          {t.label}
                        </button>
                      )
                    })}
                  </div>
                </div>
                <div className="max-h-80 overflow-y-auto p-1.5">
                  {shown.map((r) => (
                    <button
                      key={r.code}
                      type="button"
                      onClick={() => {
                        onLocale(r.code)
                        setOpen(false)
                      }}
                      className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left hover:bg-[#F7F7F8]"
                      style={{ background: r.code === locale ? 'rgba(242,113,28,0.06)' : undefined }}
                    >
                      <span className="size-2 flex-none rounded-full" style={{ background: LOCALE_STATE[r.state].dot }} />
                      <span className="min-w-0 flex-1 truncate text-[13px] font-bold">{r.name}</span>
                      <span className="text-[11px] font-bold text-subtle uppercase">{r.code}</span>
                      <span className="w-[120px] text-right text-xs font-bold whitespace-nowrap" style={{ color: LOCALE_STATE[r.state].fg }}>
                        {r.label}
                      </span>
                    </button>
                  ))}
                  {shown.length === 0 && (
                    <div className="py-6 text-center text-[13px] text-muted">No languages match.</div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>

        <div className="ml-auto flex flex-wrap items-center gap-1.5">
          {chips.map((c) => (
            <button
              key={c.f}
              type="button"
              disabled={!saved}
              onClick={() => {
                setFilter(c.f)
                setQuery('')
                setOpen(true)
              }}
              className="flex items-center gap-1.5 rounded-full border border-line-strong bg-card px-2.5 py-1.5 text-xs font-bold whitespace-nowrap"
            >
              <span className="size-[7px] rounded-full" style={{ background: c.dot }} />
              {c.n} {c.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
