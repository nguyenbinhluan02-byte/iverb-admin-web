import { Check } from 'lucide-react'
import { LETTERS, orderedWords } from '@/lib/question'
import type { Question } from '@/services/questions'

/** Correct answer per type (View modal, Today for fill / order). */
export function QuestionBody({ question: q }: { question: Question }) {
  if (q.type === 'single' || q.type === 'multi') {
    const correct = new Set(q.answer_key?.correct ?? [])
    return (
      <div className="flex flex-col gap-2">
        {(q.content.options ?? []).map((o, i) => {
          const ok = correct.has(o.id)
          return (
            <div
              key={o.id}
              className={`flex items-center gap-3 rounded-xl border-[1.5px] px-3.5 py-[11px] ${
                ok ? 'border-green bg-[rgba(31,169,113,.06)]' : 'border-line bg-card'
              }`}
            >
              <span
                className={`flex size-6 shrink-0 items-center justify-center rounded-[7px] text-xs font-extrabold ${
                  ok ? 'bg-green text-white' : 'bg-page text-muted'
                }`}
              >
                {LETTERS[i]}
              </span>
              <span className="flex-1 text-[15px] font-bold">{o.text}</span>
              {ok && (
                <span className="flex items-center gap-1 text-xs font-extrabold text-green-text">
                  <Check size={14} strokeWidth={3} />
                  Correct
                </span>
              )}
            </div>
          )
        })}
      </div>
    )
  }

  if (q.type === 'fill') {
    const answers = q.answer_key?.accepted ?? []
    return (
      <div className="flex flex-col gap-2.5">
        <div className="rounded-xl bg-page px-4 py-3.5 text-base leading-normal font-bold">
          {q.content.before}
          <span className="mx-1 inline-block rounded-[7px] bg-[rgba(31,169,113,.14)] px-2.5 font-extrabold text-green-text">
            {answers.length ? answers.join(' / ') : '___'}
          </span>
          {q.content.after}
        </div>
        {q.content.hint && (
          <div className="text-[13px] font-semibold text-muted">
            Hint: <b className="text-ink">{q.content.hint}</b>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-2">
      <span className="text-xs font-extrabold tracking-[.06em] text-muted uppercase">
        Correct order
      </span>
      <div className="flex flex-wrap gap-1.5">
        {orderedWords(q).map((w, i) => (
          <span
            key={i}
            className="rounded-[9px] border border-line-strong bg-card px-3 py-[7px] text-sm font-bold"
          >
            {w}
          </span>
        ))}
      </div>
    </div>
  )
}
