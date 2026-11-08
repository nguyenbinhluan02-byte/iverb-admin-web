import { format, parseISO } from 'date-fns'
import { typeLabel } from '@/lib/question'
import { BLANK, acceptedAnswers, hasListening, words, type FormValues } from '@/features/question-form/formModel'

// Week editor · Daily questions: right column "App preview · after answering"
// (design Weekly Lessons §4.2). A phone with the day's question in its answered
// state: correct options in green, the answer filled in, the explanation.
// Used for both the saved question (fromQuestion) and the form being edited.

const GREEN = '#1FA971'
const GREEN_BG = 'rgba(31,169,113,0.08)'

export function DailyPhonePreview({ values, date }: { values: FormValues; date: string }) {
  const listening = hasListening(values)
  const prompt = values.prompt.trim()
  const explanation = values.explanation.trim()

  return (
    <div className="sticky top-5 flex flex-[0_0_280px] flex-col items-center gap-2.5">
      <span className="text-xs font-extrabold tracking-[.05em] text-subtle uppercase">
        App preview · after answering
      </span>
      <div className="h-[570px] w-[280px] rounded-[40px] bg-[#1B1B1D] p-[9px]">
        <div className="flex size-full flex-col gap-3 overflow-y-auto rounded-[32px] bg-page px-3 pt-9 pb-3.5 [scrollbar-width:none]">
          <div className="flex flex-col gap-3.5 rounded-[18px] bg-card p-4">
            <div className="flex items-center justify-between gap-2">
              <span className="text-[11px] font-extrabold tracking-[.05em] text-brand uppercase">
                Today&apos;s question
              </span>
              <span className="text-xs text-subtle">{format(parseISO(date), 'MMM d')}</span>
            </div>
            <span className="self-start rounded-full bg-page px-2 py-[3px] text-[11px] font-bold text-muted">
              {typeLabel(values.type, listening)}
            </span>
            {listening && (
              <div className="flex items-center gap-2.5 rounded-xl bg-[rgba(242,113,28,0.08)] px-3 py-2.5">
                <span className="flex size-8 flex-none items-center justify-center rounded-full bg-brand text-white">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M7 4v16l13-8z" />
                  </svg>
                </span>
                <span className="h-1 flex-1 rounded-sm bg-[rgba(242,113,28,0.25)]" />
                <span className="text-[11px] font-extrabold text-[#C25A14]">0.75×</span>
              </div>
            )}
            <span className={`text-[15px] leading-[1.4] font-bold text-pretty ${prompt ? 'text-ink' : 'text-subtle'}`}>
              {prompt || 'Your question'}
            </span>
            <Answer values={values} />
            {explanation && (
              <div className="flex flex-col gap-[5px] rounded-[14px] bg-[rgba(242,113,28,0.08)] px-3.5 py-3">
                <span className="text-[11px] font-extrabold tracking-[.04em] text-brand uppercase">Explanation</span>
                <p className="m-0 text-[13px] leading-normal text-pretty">{explanation}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function Answer({ values }: { values: FormValues }) {
  if (values.type === 'single' || values.type === 'multi') {
    const filled = values.options.filter((o) => o.text.trim())
    const options = filled.length ? filled : values.options
    return (
      <div className="flex flex-col gap-2">
        {options.map((o, i) => (
          <div
            key={i}
            className="flex items-center gap-2.5 rounded-xl border-[1.5px] p-3"
            style={{ borderColor: o.correct ? GREEN : '#E4E4E7', background: o.correct ? GREEN_BG : '#fff' }}
          >
            <span
              className="size-[18px] flex-none border-2"
              style={{
                borderRadius: values.type === 'multi' ? 5 : '50%',
                borderColor: o.correct ? GREEN : '#D4D4D8',
                background: o.correct ? GREEN : '#fff',
              }}
            />
            <span className={`text-sm ${o.correct ? 'font-bold' : 'font-medium'} ${o.text.trim() ? '' : 'text-subtle'}`}>
              {o.text.trim() || 'Option'}
            </span>
          </div>
        ))}
      </div>
    )
  }

  if (values.type === 'fill') {
    const at = values.sentence.indexOf(BLANK)
    const before = at >= 0 ? values.sentence.slice(0, at).trim() : values.sentence.trim()
    const after = at >= 0 ? values.sentence.slice(at + BLANK.length).trim() : ''
    const answer = acceptedAnswers(values.answer)[0] ?? 'answer'
    return (
      <div className="text-[15px] leading-[2]">
        {before}{' '}
        <span
          className="rounded-lg border-[1.5px] px-2.5 py-[3px] font-extrabold text-[#138A5B]"
          style={{ borderColor: GREEN, background: GREEN_BG }}
        >
          {answer}
        </span>{' '}
        {after} {values.hint.trim() && <span className="text-subtle">({values.hint.trim()})</span>}
      </div>
    )
  }

  if (values.type === 'order') {
    const ws = words(values.sentence)
    return (
      <div
        className="flex flex-wrap gap-1.5 rounded-xl border-[1.5px] p-2.5"
        style={{ borderColor: GREEN, background: GREEN_BG }}
      >
        {(ws.length ? ws : ['Correct', 'sentence']).map((w, i) => (
          <span key={i} className="rounded-lg bg-card px-2.5 py-1.5 text-[13px] font-bold">
            {w}
          </span>
        ))}
      </div>
    )
  }

  return (
    <div
      className="rounded-xl border-[1.5px] p-3 text-sm leading-normal font-bold"
      style={{ borderColor: GREEN, background: GREEN_BG }}
    >
      {values.transcript.trim() || 'Audio script'}
    </div>
  )
}
