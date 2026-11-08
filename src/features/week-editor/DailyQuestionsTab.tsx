import { useQueryClient } from '@tanstack/react-query'
import { format, parseISO } from 'date-fns'
import { Library, PenLine } from 'lucide-react'
import { useState } from 'react'
import { useLocation } from 'react-router'
import { toast } from 'sonner'
import { TypeBadge } from '@/components/Badge'
import { Button } from '@/components/Button'
import { QuestionBody } from '@/features/library/QuestionBody'
import { EmbeddedQuestionForm } from '@/features/question-form/QuestionFormPage'
import { PickFromLibraryDialog } from '@/features/schedule/PickFromLibraryDialog'
import { plusDays, todayUTC } from '@/lib/dates'
import { errorMessage } from '@/lib/errors'
import { isListening, typeLabel } from '@/lib/question'
import type { LessonDetail } from '@/services/lessons'
import { useSetQuestionCard } from '@/services/lessons'
import { useQuestions, useSaveQuestion, type Question } from '@/services/questions'
import { weekKeys } from '@/services/weeks'
import { FieldLabel } from './ui'

// Week editor · Daily questions (design changes since v1 §4.2): the 7 days on
// the left; the selected day's question, an empty day's actions, or the
// question form (the v1 Add/Edit form, embedded).

type Mode = { kind: 'view' } | { kind: 'write' } | { kind: 'edit'; id: number }

function cardOption(card: LessonDetail['cards'][number], i: number) {
  const name =
    card.kind === 'grammar' ? `${card.content.label} — ${card.content.heading}` : card.word.word
  return `${i + 1} · ${name}`
}

export function DailyQuestionsTab({
  weekStart,
  lesson,
  readOnly,
}: {
  weekStart: string
  lesson: LessonDetail | null
  readOnly: boolean
}) {
  const location = useLocation()
  const queryClient = useQueryClient()
  const today = todayUTC()
  const { data: questions, isPending } = useQuestions()
  const save = useSaveQuestion()
  const setCard = useSetQuestionCard()

  const days = Array.from({ length: 7 }, (_, i) => plusDays(weekStart, i))
  const byDay = new Map<string, Question>()
  for (const q of questions ?? []) if (q.date && days.includes(q.date)) byDay.set(q.date, q)

  const [selected, setSelected] = useState(() => (days.includes(today) ? today : days[0]))
  const [mode, setMode] = useState<Mode>({ kind: 'view' })
  const [picking, setPicking] = useState<string | null>(null)

  const question = byDay.get(selected) ?? null
  const future = selected > today
  const dayName = format(parseISO(selected), 'EEEE')
  const refreshWeek = () => queryClient.invalidateQueries({ queryKey: weekKeys.all })
  const testedCard = question
    ? (lesson?.questions.find((q) => q.id === question.id)?.lesson_card_id ?? null)
    : null

  const select = (d: string) => {
    setSelected(d)
    setMode({ kind: 'view' })
  }

  const onFormDone = (saved: Question | null) => {
    setMode({ kind: 'view' })
    if (saved) refreshWeek()
  }

  // Back to the library (kept, not deleted). Only before anyone answered.
  const remove = async (q: Question) => {
    try {
      await save.mutateAsync({
        id: q.id,
        type: q.type,
        prompt: q.prompt,
        content: q.content,
        answer_key: q.answer_key,
        explanation: q.explanation ?? '',
        author_name: q.author_name ?? '',
        date: null,
        publish: !!q.answer_key,
      })
      refreshWeek()
      toast.success(`Removed from ${dayName} · still in the library`)
    } catch (e) {
      toast.error(errorMessage(e))
    }
  }

  const panel = () => {
    if (mode.kind !== 'view') {
      return (
        <EmbeddedQuestionForm
          questionId={mode.kind === 'edit' ? mode.id : null}
          date={selected}
          onDone={onFormDone}
        />
      )
    }

    if (!question) {
      return (
        <div className="flex flex-col items-center gap-2.5 rounded-[18px] border-[1.5px] border-dashed border-line-strong bg-card px-5 py-10 text-center">
          <span className="text-base font-extrabold">No question for {dayName}</span>
          {readOnly || !future ? (
            <span className="text-sm text-muted">
              {selected === today ? "Today's question can no longer be added." : 'This day is over.'}
            </span>
          ) : (
            <>
              <span className="text-sm text-muted">Write a new question, or reuse one from the library.</span>
              <div className="mt-1.5 flex flex-wrap justify-center gap-2.5">
                <Button type="button" onClick={() => setMode({ kind: 'write' })}>
                  <PenLine size={15} />
                  Write question
                </Button>
                <Button type="button" variant="secondary" onClick={() => setPicking(selected)}>
                  <Library size={15} />
                  Choose from library
                </Button>
              </div>
            </>
          )}
        </div>
      )
    }

    const editable = !readOnly && question.status !== 'published'
    const removable = !readOnly && future && !question.has_answers
    return (
      <div className="flex flex-col gap-4 rounded-[18px] border border-line bg-card px-5 py-[18px]">
        <div className="flex flex-wrap items-center justify-between gap-2.5">
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="text-[15px] font-extrabold">
              {dayName} · {format(parseISO(selected), 'MMM d')}
            </span>
            <TypeBadge type={question.type} listening={isListening(question)} withIcon />
            {selected === today && <span className="text-xs font-bold text-brand">Live today</span>}
          </div>
          <div className="flex gap-2">
            {removable && (
              <Button type="button" variant="secondary" disabled={save.isPending} onClick={() => remove(question)}>
                Remove question
              </Button>
            )}
            {editable && (
              <Button type="button" onClick={() => setMode({ kind: 'edit', id: question.id })}>
                Edit
              </Button>
            )}
          </div>
        </div>
        <h3 className="m-0 text-base leading-[1.4] font-bold">{question.prompt}</h3>
        <QuestionBody question={question} />
        {question.explanation && (
          <div className="rounded-xl bg-[rgba(242,113,28,0.08)] px-3.5 py-3 text-sm leading-normal">
            {question.explanation}
          </div>
        )}
        <div className="flex flex-wrap items-center gap-3 border-t border-line pt-3.5">
          <label className="flex min-w-[260px] flex-1 flex-col gap-1.5">
            <FieldLabel>Tests lesson card · optional, helps spot weak cards</FieldLabel>
            <select
              value={testedCard ?? ''}
              disabled={readOnly || !lesson?.cards.length || setCard.isPending}
              onChange={(e) =>
                setCard.mutate(
                  { questionId: question.id, cardId: e.target.value ? Number(e.target.value) : null },
                  { onError: (err) => toast.error(errorMessage(err)) },
                )
              }
              className="rounded-[10px] border border-line-strong bg-card px-3 py-2.5 text-sm"
            >
              <option value="">{lesson?.cards.length ? 'None' : 'Save the lesson first'}</option>
              {lesson?.cards.map((c, i) => (
                <option key={c.id} value={c.id}>
                  {cardOption(c, i)}
                </option>
              ))}
            </select>
          </label>
          <span className="text-xs text-muted">
            By {question.author_name ?? question.author?.name ?? 'Irregular Verbs team'}
            {question.has_answers ? ' · has answers' : ''}
          </span>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-wrap items-start gap-[18px]">
      <div className="flex flex-[0_0_260px] flex-col gap-1 rounded-[18px] border border-line bg-card p-3">
        {isPending && <span className="p-2 text-sm text-muted">Loading…</span>}
        {days.map((d) => {
          const q = byDay.get(d)
          const on = d === selected
          return (
            <button
              key={d}
              type="button"
              onClick={() => select(d)}
              className="flex w-full items-start gap-2.5 rounded-[10px] border p-2.5 text-left"
              style={{ borderColor: on ? '#F2711C' : 'transparent', background: on ? 'rgba(242,113,28,0.06)' : '#fff' }}
            >
              <span className="flex w-11 flex-none flex-col leading-[1.3]">
                <span className={`text-[13px] font-extrabold ${d === today ? 'text-brand' : ''}`}>
                  {format(parseISO(d), 'EEE')}
                </span>
                <span className="text-xs text-subtle">{format(parseISO(d), 'MMM d')}</span>
              </span>
              <span className="flex min-w-0 flex-1 flex-col gap-px">
                <span className={`truncate text-[13px] font-bold ${q ? '' : 'text-subtle'}`}>
                  {q ? q.prompt : 'No question'}
                </span>
                {q && <span className="text-xs text-muted">{typeLabel(q.type, isListening(q))}</span>}
              </span>
              <span className="mt-1 size-2 flex-none rounded-full" style={{ background: q ? '#1FA971' : '#E4E4E7' }} />
            </button>
          )
        })}
      </div>

      <div className="flex min-w-0 flex-[1_1_520px] flex-col gap-3.5">{panel()}</div>

      <PickFromLibraryDialog
        date={picking}
        from={`${location.pathname}?tab=questions`}
        onClose={() => {
          setPicking(null)
          refreshWeek()
        }}
      />
    </div>
  )
}
