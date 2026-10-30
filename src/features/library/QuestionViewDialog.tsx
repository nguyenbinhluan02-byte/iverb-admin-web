import { Avatar } from '@/components/Avatar'
import { StatusBadge, TypeBadge, UserSubmittedBadge } from '@/components/Badge'
import { Modal, ModalClose, ModalTitle } from '@/components/Modal'
import { authorName, isUserSubmitted } from '@/lib/question'
import type { Question } from '@/services/questions'
import { QuestionBody } from './QuestionBody'

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
            {q.explanation && (
              <div className="flex flex-col gap-1 rounded-xl bg-brand-tint-2 px-4 py-3.5">
                <span className="text-xs font-extrabold tracking-[.06em] text-brand-deep uppercase">
                  Explanation
                </span>
                <span className="text-sm leading-normal">{q.explanation}</span>
              </div>
            )}
            <div className="flex items-center gap-2 text-[13px] text-muted">
              <Avatar name={authorName(q)} src={q.author?.avatar_url} size={24} />
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
