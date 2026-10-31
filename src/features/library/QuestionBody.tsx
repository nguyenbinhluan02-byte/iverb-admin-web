import { Check, Pause, Play } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { isListening, LETTERS, orderedWords } from '@/lib/question'
import type { Question, Voice } from '@/services/questions'

const VOICE_LABELS: Record<Voice, string> = {
  'us-f': 'US · Female',
  'us-m': 'US · Male',
  'uk-f': 'UK · Female',
  'uk-m': 'UK · Male',
}

/** Correct answer per type (View modal, Today for fill / order), audio first. */
export function QuestionBody({ question: q }: { question: Question }) {
  if (!isListening(q)) return <Answer question={q} />
  return (
    <div className="flex flex-col gap-4">
      <AudioBlock question={q} />
      {q.type !== 'dictation' && <Answer question={q} />}
    </div>
  )
}

// Design: View modal block before the options.
function AudioBlock({ question: q }: { question: Question }) {
  const meta = q.content.audio_meta
  const audio = useRef<HTMLAudioElement | null>(null)
  const [playing, setPlaying] = useState(false)
  useEffect(() => () => audio.current?.pause(), [])

  const toggle = () => {
    if (playing) {
      audio.current?.pause()
      return setPlaying(false)
    }
    if (!q.content.audio_url) return
    audio.current ??= new Audio(q.content.audio_url)
    audio.current.currentTime = 0
    audio.current.onended = () => setPlaying(false)
    setPlaying(true)
    audio.current.play().catch(() => setPlaying(false))
  }

  const kicker =
    q.type === 'dictation'
      ? 'Sentence to write'
      : meta?.source === 'tts' && meta.voice
        ? `Transcript · ${VOICE_LABELS[meta.voice]}`
        : `Audio file${meta?.file_name ? ` · ${meta.file_name}` : ''}`
  const text = q.type === 'dictation' ? q.answer_key?.sentence : q.answer_key?.transcript

  return (
    <div className="flex items-center gap-3 rounded-xl bg-page p-3.5">
      <button
        type="button"
        onClick={toggle}
        disabled={!q.content.audio_url}
        title={playing ? 'Stop' : 'Play audio'}
        className="flex size-[38px] shrink-0 items-center justify-center rounded-full bg-brand text-white disabled:opacity-50"
      >
        {playing ? (
          <Pause size={15} fill="currentColor" strokeWidth={0} />
        ) : (
          <Play size={15} fill="currentColor" strokeWidth={0} className="ml-0.5" />
        )}
      </button>
      <span className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span className="text-xs font-extrabold tracking-[.06em] text-muted uppercase">
          {kicker}
        </span>
        <span className="text-[15px] font-semibold text-pretty">{text || '—'}</span>
      </span>
    </div>
  )
}

function Answer({ question: q }: { question: Question }) {
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
