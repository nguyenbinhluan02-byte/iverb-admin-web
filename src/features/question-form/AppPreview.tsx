import { Avatar } from '@/components/Avatar'
import { LETTERS, TYPE_LABELS } from '@/lib/question'
import { BLANK, words, type FormValues } from './formModel'

// Same fixed shuffle as the design prototype, so the preview does not jump on every key press.
const previewShuffle = (ws: string[]) =>
  ws
    .map((w, i) => ({ w, k: (w.length * 7 + i * 13) % 11 }))
    .sort((a, b) => a.k - b.k)
    .map((x) => x.w)

// Design: right column "App preview" (mirrors the mobile card).
export function AppPreview({ values }: { values: FormValues }) {
  const author = values.authorName.trim() || 'Admin'
  const prompt = values.prompt.trim()
  const blank = values.sentence.indexOf(BLANK)
  const ws = words(values.sentence)

  return (
    <div className="sticky top-6 flex min-w-[300px] flex-[0_1_360px] flex-col gap-2.5">
      <span className="text-xs font-extrabold tracking-[.06em] text-muted uppercase">
        App preview
      </span>
      <div className="flex flex-col gap-4 rounded-[28px] border border-line bg-card p-[22px] shadow-preview">
        <div className="flex items-center justify-between gap-2.5">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[rgba(242,113,28,.1)] px-2.5 py-[5px] text-xs font-bold text-brand-deep">
            {TYPE_LABELS[values.type]}
          </span>
          <span className="flex min-w-0 items-center gap-1.5">
            <Avatar name={author} size={26} />
            <span className="flex min-w-0 flex-col leading-[1.25]">
              <span className="text-[11px] text-muted">By</span>
              <b className="max-w-[130px] truncate text-xs">{author}</b>
            </span>
          </span>
        </div>

        <h2
          className={`text-base leading-[1.4] font-bold text-pretty ${prompt ? 'text-ink' : 'text-subtle'}`}
        >
          {prompt || 'Your question appears here'}
        </h2>

        {(values.type === 'single' || values.type === 'multi') && (
          <div className="flex flex-col gap-2.5">
            {values.options.map((o, i) => (
              <div
                key={i}
                className={`flex items-center gap-3 rounded-[13px] border-[1.5px] border-line px-3.5 py-[13px] text-sm font-semibold ${
                  o.text.trim() ? 'text-ink' : 'text-subtle'
                }`}
              >
                <span
                  className={`size-5 shrink-0 border-2 border-[#D4D4D8] ${
                    values.type === 'single' ? 'rounded-full' : 'rounded-md'
                  }`}
                />
                {o.text.trim() || `Option ${LETTERS[i]}`}
              </div>
            ))}
          </div>
        )}

        {values.type === 'fill' && (
          <div className="flex flex-col gap-2.5">
            <div className="rounded-[13px] bg-page p-3.5 text-[15px] leading-[1.9] text-pretty">
              {blank >= 0
                ? values.sentence.slice(0, blank).trim()
                : values.sentence || 'Sentence with a'}{' '}
              <span className="inline-block min-w-[70px] border-b-2 border-brand">&nbsp;</span>{' '}
              {blank >= 0
                ? values.sentence.slice(blank + BLANK.length).trim()
                : values.sentence
                  ? ''
                  : 'blank.'}
            </div>
            <div className="rounded-xl border-[1.5px] border-line px-3.5 py-3 text-sm text-subtle">
              Type your answer
            </div>
            {values.hint.trim() && (
              <span className="text-[13px] text-muted">
                Hint: <b className="text-ink">{values.hint.trim()}</b>
              </span>
            )}
          </div>
        )}

        {values.type === 'order' && (
          <div className="flex flex-col gap-3.5">
            <div className="min-h-[70px] rounded-[13px] border-[1.5px] border-dashed border-line-strong p-3 text-[13px] text-subtle">
              Tap the words below to build the sentence
            </div>
            <div className="flex flex-wrap justify-center gap-2">
              {(ws.length ? previewShuffle(ws) : ['words', 'appear', 'here']).map((w, i) => (
                <span
                  key={i}
                  className="rounded-[10px] border-[1.5px] border-line bg-card px-[13px] py-[9px] text-sm font-bold shadow-[0_2px_0_var(--color-line)]"
                >
                  {w}
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="rounded-[14px] bg-line-strong p-3.5 text-center text-[15px] font-extrabold text-subtle">
          Submit
        </div>
      </div>
    </div>
  )
}
