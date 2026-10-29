import { Check } from 'lucide-react'
import { Avatar } from '@/components/Avatar'
import { StatusBadge, TypeBadge, UserSubmittedBadge } from '@/components/Badge'
import { Modal, ModalClose, ModalTitle } from '@/components/Modal'
import { authorName, isUserSubmitted, LETTERS, orderedWords } from '@/lib/question'
import type { Question } from '@/services/questions'

const footerButton = 'rounded-[10px] px-4 py-2.5 text-sm font-extrabold whitespace-nowrap'

// Design: "View question" modal (Library & Schedule → View).
export function QuestionViewDialog({
  question: q,
  onClose,
  onHistory,
  onEdit,
  onReuse,
}: {
  question: Question | null
  onClose: () => void
  onHistory: (q: Question) => void
  onEdit: (q: Question) => void
  onReuse?: (q: Question) => void
}) {
  return (
    <Modal open={!!q} onClose={onClose} maxWidth={520} maxHeight={720}>
      {q && (
        <>
          <div className="flex items-start gap-3 border-b border-line px-[22px] pt-5 pb-3.5">
            <div className="flex min-w-0 flex-1 flex-wrap gap-1.5">
              <TypeBadge type={q.type} withIcon />
              <StatusBadge status={q.status} />
              {isUserSubmitted(q) && <UserSubmittedBadge />}
            </div>
            <ModalClose />
          </div>

          <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto px-[22px] py-[18px]">
            <ModalTitle className="text-lg leading-[1.4] font-extrabold text-pretty">
              {q.prompt}
            </ModalTitle>
            <QuestionBody question={q} />
            <div className="flex items-center gap-2 text-[13px] text-muted">
              <Avatar name={authorName(q)} size={24} />
              <span>
                By <b className="text-ink">{authorName(q)}</b>
              </span>
            </div>
          </div>

          <div className="flex flex-wrap justify-end gap-2 border-t border-line px-[22px] py-3.5">
            <button
              type="button"
              onClick={() => onHistory(q)}
              className={`${footerButton} border border-line-strong bg-card hover:bg-page`}
            >
              History · {q.usage_count}
            </button>
            {q.status === 'published' ? (
              <button
                type="button"
                onClick={() => onReuse?.(q)}
                disabled={!onReuse}
                title={onReuse ? undefined : 'Coming soon'}
                className={`${footerButton} bg-brand text-white hover:bg-brand-hover disabled:bg-line-strong disabled:text-subtle`}
              >
                Reuse
              </button>
            ) : (
              <button
                type="button"
                onClick={() => onEdit(q)}
                className={`${footerButton} border border-line-strong bg-card hover:bg-page`}
              >
                Edit
              </button>
            )}
          </div>
        </>
      )}
    </Modal>
  )
}

function QuestionBody({ question: q }: { question: Question }) {
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
