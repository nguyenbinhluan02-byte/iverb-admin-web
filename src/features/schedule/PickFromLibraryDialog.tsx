import { CircleCheck, Clock, EyeOff, History, Layers, Search, Type, User } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router'
import { toast } from 'sonner'
import { FilterDropdown, type FilterOption } from '@/components/FilterDropdown'
import { Modal, ModalClose, ModalTitle } from '@/components/Modal'
import { TypeIcon } from '@/components/TypeIcon'
import { GREEN_TINT, sourceOptions, typeOptions } from '@/features/library/filterOptions'
import { todayUTC } from '@/lib/dates'
import { errorMessage } from '@/lib/errors'
import { dayLabel, displayText, isUserSubmitted, TYPE_LABELS } from '@/lib/question'
import { useQuestions, useScheduleQuestion } from '@/services/questions'
import {
  countPool,
  DEFAULT_PICK,
  filterPool,
  pickPool,
  pickWhen,
  type PickFilters,
  type PickSort,
  type PickStatus,
} from './pickModel'
import { relativeDay } from './scheduleModel'

// Design: "Choose from library" modal (Schedule → empty day → From library).
export function PickFromLibraryDialog({
  date,
  onClose,
}: {
  date: string | null
  onClose: () => void
}) {
  return (
    <Modal open={!!date} onClose={onClose} maxWidth={640} maxHeight={720}>
      {date && <Picker key={date} date={date} onClose={onClose} />}
    </Modal>
  )
}

function Picker({ date, onClose }: { date: string; onClose: () => void }) {
  const navigate = useNavigate()
  const { data: questions = [] } = useQuestions()
  const schedule = useScheduleQuestion()
  const [filters, setFilters] = useState<PickFilters>(DEFAULT_PICK)
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const set = (patch: Partial<PickFilters>) => setFilters((f) => ({ ...f, ...patch }))

  const pool = useMemo(() => pickPool(questions), [questions])
  const rows = useMemo(() => filterPool(pool, filters), [pool, filters])
  const counts = countPool(pool, filters.source)
  const selected = pool.find((q) => q.id === selectedId) ?? null

  const statusOptions: FilterOption<PickStatus>[] = [
    { value: 'all', label: 'All', icon: Layers, count: counts.all },
    {
      value: 'published',
      label: 'Published',
      icon: CircleCheck,
      count: counts.published,
      ...GREEN_TINT,
    },
    { value: 'unpublished', label: 'Not published', icon: EyeOff, count: counts.unpublished },
  ]
  const sortOptions: FilterOption<PickSort>[] = [
    { value: 'oldest', label: 'Shown longest ago', icon: History },
    { value: 'recent', label: 'Shown most recently', icon: Clock },
  ]

  const confirm = async () => {
    if (!selected) return
    try {
      const saved = await schedule.mutateAsync({ id: selected.id, date })
      toast.success(
        `${saved.status === 'draft' ? 'Draft moved' : 'Scheduled'} for ${dayLabel(date)}`,
      )
      onClose()
    } catch (e) {
      toast.error(errorMessage(e))
    }
  }

  // Published → a new copy in the form; drafts / unscheduled → edit that question.
  const editFirst = () => {
    if (!selected) return
    const state = { from: '/schedule' }
    if (selected.status === 'published')
      navigate(`/questions/new?from=${selected.id}&date=${date}`, { state })
    else navigate(`/questions/${selected.id}/edit?date=${date}`, { state })
  }

  return (
    <>
      <div className="flex flex-col gap-2.5 border-b border-line px-5 pt-[18px] pb-3.5">
        <div className="flex items-start gap-3">
          <div className="min-w-0 flex-1">
            <div className="text-xs font-extrabold tracking-[.06em] text-muted uppercase">
              For {relativeDay(date, todayUTC())}
              {dayLabel(date)}
            </div>
            <ModalTitle className="mt-1 text-xl font-extrabold">Choose from library</ModalTitle>
          </div>
          <ModalClose />
        </div>
        <div className="flex h-10 items-center gap-2 rounded-[10px] bg-page px-3">
          <Search size={16} strokeWidth={2.2} className="text-muted" />
          <input
            value={filters.query}
            onChange={(e) => set({ query: e.target.value })}
            placeholder="Search question or verb"
            className="min-w-0 flex-1 border-none bg-transparent text-sm focus:shadow-none!"
          />
        </div>
        <div className="flex flex-wrap gap-1.5">
          <FilterDropdown
            label="Status"
            icon={CircleCheck}
            value={filters.status}
            options={statusOptions}
            onChange={(status) => set({ status })}
          />
          <FilterDropdown
            label="Added by"
            icon={User}
            value={filters.source}
            options={sourceOptions()}
            onChange={(source) => set({ source })}
          />
          <FilterDropdown
            label="Type"
            icon={Type}
            value={filters.type}
            options={typeOptions()}
            onChange={(type) => set({ type })}
          />
          <FilterDropdown
            label="Sort"
            icon={History}
            value={filters.sort}
            options={sortOptions}
            onChange={(sort) => set({ sort })}
          />
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-x-hidden overflow-y-auto px-3 py-2" role="radiogroup">
        {rows.map((q) => {
          const on = q.id === selectedId
          return (
            <button
              key={q.id}
              type="button"
              role="radio"
              aria-checked={on}
              onClick={() => setSelectedId(q.id)}
              className={`mb-1.5 grid w-full grid-cols-[20px_minmax(0,1fr)] items-start gap-3 rounded-xl border-[1.5px] p-3 text-left text-ink ${
                on ? 'border-brand bg-brand-tint-2' : 'border-line bg-card'
              }`}
            >
              <span
                className={`mt-0.5 flex size-[18px] items-center justify-center rounded-full border-2 ${
                  on ? 'border-brand' : 'border-disabled'
                }`}
              >
                <span className={`size-2 rounded-full ${on ? 'bg-brand' : ''}`} />
              </span>
              <span className="flex min-w-0 flex-col gap-[5px]">
                <span className="text-sm leading-[1.4] font-bold text-pretty">
                  {displayText(q)}
                </span>
                <span className="flex flex-wrap gap-x-2.5 gap-y-1.5 text-xs font-semibold text-muted">
                  <span className="flex items-center gap-[5px] rounded-md bg-[rgba(242,113,28,.1)] px-2 py-0.5 font-bold text-brand-deep">
                    <TypeIcon type={q.type} size={12} />
                    {TYPE_LABELS[q.type]}
                  </span>
                  {isUserSubmitted(q) && (
                    <span className="rounded-md bg-[rgba(91,108,240,.12)] px-2 py-0.5 font-bold text-blue-text">
                      User submitted
                    </span>
                  )}
                  <span>{pickWhen(q)}</span>
                </span>
              </span>
            </button>
          )
        })}
        {rows.length === 0 && (
          <div className="px-4 py-10 text-center text-sm font-semibold text-muted">
            No questions match these filters.
          </div>
        )}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2.5 border-t border-line px-6 py-3.5">
        <span className="text-[13px] font-semibold text-muted">
          {rows.length} question{rows.length === 1 ? '' : 's'}
        </span>
        <div className="flex gap-2">
          <button
            type="button"
            disabled={!selected}
            onClick={editFirst}
            className="rounded-[10px] border border-line-strong bg-card px-4 py-2.5 text-sm font-extrabold whitespace-nowrap disabled:text-subtle"
          >
            Edit first
          </button>
          <button
            type="button"
            disabled={!selected || schedule.isPending}
            onClick={confirm}
            className="rounded-[10px] bg-brand px-4 py-2.5 text-sm font-extrabold whitespace-nowrap text-white hover:bg-brand-hover disabled:bg-line-strong disabled:text-subtle"
          >
            Schedule
          </button>
        </div>
      </div>
    </>
  )
}
