import { Badge } from '@/components/Badge'
import { USE_STATUS } from '@/components/badgeStyles'
import { Modal, ModalClose, ModalTitle } from '@/components/Modal'
import { dayLabel, displayText } from '@/lib/question'
import { useQuestionHistory, type Question } from '@/services/questions'
import { groupByYear, historySummary, plural } from './history'

// Design: "Usage history" modal (Library → History / View → History).
export function HistoryDialog({
  question,
  onClose,
}: {
  question: Question | null
  onClose: () => void
}) {
  const { data: uses, isPending, isError } = useQuestionHistory(question?.id ?? null)

  return (
    <Modal open={!!question} onClose={onClose} maxWidth={480} maxHeight={640}>
      {question && (
        <>
          <div className="flex items-start gap-3 border-b border-line px-[22px] pt-5 pb-4">
            <div className="min-w-0 flex-1">
              <div className="text-xs font-extrabold tracking-[.06em] text-muted uppercase">
                Usage history
              </div>
              <ModalTitle className="mt-1.5 text-[15px] leading-[1.4] font-bold text-pretty">
                {displayText(question)}
              </ModalTitle>
              {uses && (
                <div className="mt-1.5 text-[13px] font-semibold text-muted">
                  {historySummary(uses)}
                </div>
              )}
            </div>
            <ModalClose />
          </div>

          <div className="flex min-h-0 flex-1 flex-col gap-3.5 overflow-y-auto px-[22px] pt-2 pb-[18px]">
            {isPending && <Empty>Loading…</Empty>}
            {isError && <Empty>Could not load the history.</Empty>}
            {uses?.length === 0 && <Empty>This question hasn't been used yet.</Empty>}
            {uses &&
              groupByYear(uses).map(([year, items]) => (
                <div key={year} className="flex flex-col gap-1">
                  <div className="sticky top-0 flex items-baseline justify-between border-b border-line bg-card pt-2.5 pb-1.5">
                    <span className="text-lg font-extrabold">{year}</span>
                    <span className="text-xs font-bold text-muted">{plural(items.length)}</span>
                  </div>
                  {items.map((u) => {
                    const s = USE_STATUS[u.status]
                    return (
                      <div
                        key={`${u.date}-${u.question_id}`}
                        className="flex items-center gap-3 py-2"
                      >
                        <span
                          className="size-2 shrink-0 rounded-full"
                          style={{ background: s.dot }}
                        />
                        <span className="flex-1 text-sm font-bold">{dayLabel(u.date)}</span>
                        <Badge tone={s.tone}>{s.label}</Badge>
                      </div>
                    )
                  })}
                </div>
              ))}
          </div>
        </>
      )}
    </Modal>
  )
}

function Empty({ children }: { children: string }) {
  return <div className="py-8 text-center text-sm font-semibold text-muted">{children}</div>
}
