import {
  Check,
  CircleDot,
  Copy,
  Lock,
  NotebookPen,
  PenLine,
  Plus,
  Shuffle,
  SquareCheck,
  X,
  type LucideIcon,
} from 'lucide-react'
import { useMemo, useState } from 'react'
import { useFieldArray, useForm, useWatch } from 'react-hook-form'
import { Link, useLocation, useNavigate, useParams, useSearchParams } from 'react-router'
import { toast } from 'sonner'
import { useAuth } from '@/auth/useAuth'
import { Button } from '@/components/Button'
import { PageHeader } from '@/components/PageHeader'
import { nextDays, todayUTC } from '@/lib/dates'
import { errorMessage } from '@/lib/errors'
import { dayLabel, LETTERS, TYPE_LABELS } from '@/lib/question'
import { generateSpeech, uploadAudio } from '@/services/audio'
import {
  useQuestions,
  useSaveQuestion,
  type AudioMeta,
  type Question,
  type QType,
} from '@/services/questions'
import { AppPreview } from './AppPreview'
import { ListeningCard } from './ListeningCard'
import {
  BLANK,
  buildPayload,
  canPublish,
  canSaveDraft,
  emptyForm,
  fromQuestion,
  hasListening,
  MAX_OPTIONS,
  MIN_OPTIONS,
  switchType,
  ttsKey,
  ttsUpToDate,
  words,
  type FormValues,
} from './formModel'
import { findSimilar, whenLabel } from './similar'

const TYPE_CARDS: { type: QType; desc: string; icon: LucideIcon }[] = [
  { type: 'single', desc: 'One correct option', icon: CircleDot },
  { type: 'multi', desc: 'Several correct options', icon: SquareCheck },
  { type: 'fill', desc: 'Type the missing word', icon: PenLine },
  { type: 'order', desc: 'Build the sentence', icon: Shuffle },
  { type: 'dictation', desc: 'Write what you hear', icon: NotebookPen },
]

const PLACEHOLDERS: Record<QType, string> = {
  single: 'e.g. What is the past simple of "catch"?',
  multi: 'e.g. Which of these verbs are irregular?',
  fill: 'e.g. Complete the sentence with the correct verb form.',
  order: 'e.g. Put the words in the correct order.',
  dictation: 'e.g. Listen and write the sentence you hear.',
}

const field =
  'w-full rounded-[11px] border border-line-strong bg-card px-3.5 py-3 text-[15px] text-ink disabled:bg-page disabled:text-muted'
const label = 'text-[13px] font-extrabold'
const labelNote = 'font-semibold text-muted'

const DAYS_AHEAD = 14

/**
 * Routes:
 *   /questions/new?date=YYYY-MM-DD&from=<id>   new question (from = reuse a copy)
 *   /questions/:id/edit                         edit
 */
export function QuestionFormPage() {
  const { id } = useParams()
  const [params] = useSearchParams()
  const { data: questions, isPending, isError, error } = useQuestions()

  if (isPending) return <Notice>Loading…</Notice>
  if (isError) return <Notice>{errorMessage(error)}</Notice>

  const editing = id ? (questions.find((q) => q.id === Number(id)) ?? null) : null
  if (id && !editing) return <Notice>This question does not exist.</Notice>
  if (editing?.status === 'published') {
    return <Notice>This question was already shown and can no longer be changed.</Notice>
  }
  const fromId = params.get('from')
  const source = fromId ? (questions.find((q) => q.id === Number(fromId)) ?? null) : null

  return (
    <QuestionForm
      // Re-create the form state when switching between questions.
      key={`${id ?? 'new'}-${fromId ?? ''}`}
      questions={questions}
      editing={editing}
      source={source}
      requestedDate={params.get('date')}
    />
  )
}

function QuestionForm({
  questions,
  editing,
  source,
  requestedDate,
}: {
  questions: Question[]
  editing: Question | null
  source: Question | null
  requestedDate: string | null
}) {
  const navigate = useNavigate()
  const location = useLocation()
  const backTo = (location.state as { from?: string } | null)?.from ?? '/schedule'
  const { me } = useAuth()
  const save = useSaveQuestion()

  const today = todayUTC()
  const days = useMemo(() => nextDays(today, DAYS_AHEAD), [today])
  // Day → question already there (other than the one being edited).
  const taken = useMemo(() => {
    const map = new Map<string, Question>()
    for (const q of questions) if (q.date && q.id !== editing?.id) map.set(q.date, q)
    return map
  }, [questions, editing])

  const live = editing?.status === 'live'
  const locked = !!editing?.has_answers

  const defaultDate = (): string | null => {
    // Schedule → "Edit first" moves a draft to the chosen empty day.
    if (editing)
      return requestedDate && requestedDate > today && editing.status !== 'live'
        ? requestedDate
        : editing.date
    if (requestedDate && requestedDate > today) return requestedDate
    return days.find((d) => !taken.has(d)) ?? days[0]
  }
  const { register, control, setValue, getValues } = useForm<FormValues>({
    defaultValues: editing
      ? fromQuestion(editing, defaultDate())
      : source
        ? {
            ...fromQuestion(source, defaultDate()),
            authorName: source.author?.name ?? me?.name ?? '',
          }
        : emptyForm(defaultDate(), me?.name ?? ''),
  })
  const options = useFieldArray({ control, name: 'options' })
  const set = <K extends keyof FormValues>(key: K, value: FormValues[K]) =>
    setValue(key, value as never, { shouldDirty: true })
  // voice|transcript of the saved / previewed TTS file (no new TTS call when unchanged).
  const [generatedFor, setGeneratedFor] = useState<string | null>(() => {
    const v = getValues()
    return v.audioMeta?.source === 'tts' && v.audioUrl ? ttsKey(v.voice, v.transcript) : null
  })
  const [preparing, setPreparing] = useState(false)
  const busy = preparing || save.isPending
  // Small form: re-render on every change keeps preview / duplicates / validity simple.
  const values = useWatch({ control }) as FormValues

  const similar = findSimilar(
    values,
    questions,
    [editing?.id, source?.id].filter((x): x is number => x != null),
  )

  const publishable = canPublish(values) && !!values.date
  const draftable = canSaveDraft(values) && !live
  const takenBy = values.date && !live ? taken.get(values.date) : undefined
  const blankMissing =
    values.type === 'fill' && !!values.sentence.trim() && !values.sentence.includes(BLANK)
  const wordCount = words(values.sentence).length

  // The audio file to save: TTS made (or reused) for the transcript, or the
  // picked file uploaded. Null when there is nothing to attach yet (draft).
  const resolveAudio = async (v: FormValues): Promise<{ url: string; meta: AudioMeta } | null> => {
    if (!hasListening(v)) return null
    if (v.audioSource === 'tts') {
      if (!v.transcript.trim()) return null
      if (ttsUpToDate(v, generatedFor) && v.audioMeta) return { url: v.audioUrl, meta: v.audioMeta }
      const r = await generateSpeech(v.transcript.trim(), v.voice)
      const meta: AudioMeta = { source: 'tts', voice: v.voice, duration_sec: r.duration_sec }
      set('audioUrl', r.audio_url)
      set('audioMeta', meta)
      setGeneratedFor(ttsKey(v.voice, v.transcript))
      return { url: r.audio_url, meta }
    }
    if (v.picked) {
      const r = await uploadAudio(v.picked.file)
      const meta: AudioMeta = {
        source: 'file',
        file_name: r.file_name,
        file_size: r.file_size,
        duration_sec: v.picked.durationSec,
      }
      set('audioUrl', r.audio_url)
      set('audioMeta', meta)
      set('picked', null)
      return { url: r.audio_url, meta }
    }
    return v.audioUrl && v.audioMeta?.source === 'file'
      ? { url: v.audioUrl, meta: v.audioMeta }
      : null
  }

  const submit = async (publish: boolean) => {
    const v = getValues()
    try {
      setPreparing(true)
      const audio = await resolveAudio(v).finally(() => setPreparing(false))
      const { content, answer_key } = buildPayload(v, editing, audio)
      const saved = await save.mutateAsync({
        id: editing?.id ?? null,
        type: v.type,
        prompt: v.prompt,
        content,
        answer_key,
        explanation: v.explanation,
        author_name: v.authorName,
        date: v.date,
        publish,
      })
      const when = saved.date ? ` for ${dayLabel(saved.date)}` : ''
      toast.success(`${publish ? (live ? 'Saved' : 'Scheduled') : 'Draft saved'}${when}`)
      navigate(backTo)
    } catch (e) {
      toast.error(errorMessage(e))
    }
  }

  const kicker = editing
    ? 'Editing'
    : source
      ? `Reusing · ${whenLabel(source).toLowerCase()}`
      : 'Add to schedule'
  const title = editing
    ? live
      ? "Edit today's question"
      : 'Edit question'
    : source
      ? 'Reuse question'
      : 'New question'

  return (
    <div className="mx-auto flex max-w-[1180px] flex-col gap-5">
      <PageHeader kicker={kicker} title={title} />

      <div className="flex flex-wrap items-start gap-[22px]">
        <div className="flex min-w-0 flex-[1_1_520px] flex-col gap-[26px] rounded-[18px] border border-line bg-card p-6">
          {locked && (
            <div className="flex items-center gap-2 rounded-xl bg-page px-3.5 py-3 text-[13px] font-semibold text-muted">
              <Lock size={15} strokeWidth={2.4} className="shrink-0" />
              Users already answered this question — only the wording, explanation and author can
              change.
            </div>
          )}

          <div className="flex flex-col gap-2.5">
            <span className={label}>Question type</span>
            <div className="grid grid-cols-[repeat(auto-fit,minmax(140px,1fr))] gap-2.5">
              {TYPE_CARDS.map(({ type, desc, icon: Icon }) => {
                const on = values.type === type
                return (
                  <button
                    key={type}
                    type="button"
                    disabled={locked}
                    onClick={() => {
                      const patch = switchType(getValues(), type)
                      for (const [k, v] of Object.entries(patch))
                        setValue(k as keyof FormValues, v as never)
                    }}
                    className={`flex flex-col items-start gap-2 rounded-xl border-[1.5px] p-3.5 text-left text-ink disabled:cursor-not-allowed ${
                      on ? 'border-brand bg-brand-tint' : 'border-line bg-card'
                    } ${locked && !on ? 'opacity-50' : ''}`}
                  >
                    <span
                      className={`flex size-[30px] items-center justify-center rounded-lg ${
                        on ? 'bg-brand text-white' : 'bg-page text-ink'
                      }`}
                    >
                      <Icon size={16} strokeWidth={2.4} />
                    </span>
                    <span className="text-sm font-extrabold">{TYPE_LABELS[type]}</span>
                    <span className="text-xs text-muted">{desc}</span>
                  </button>
                )
              })}
            </div>
          </div>

          <label className="flex flex-col gap-2">
            <span className={label}>Question</span>
            <textarea
              rows={2}
              placeholder={PLACEHOLDERS[values.type]}
              className={`${field} resize-y leading-[1.45]`}
              {...register('prompt')}
            />
          </label>

          <ListeningCard
            values={values}
            register={register}
            set={set}
            locked={locked}
            generatedFor={generatedFor}
            onGenerated={setGeneratedFor}
          />

          {(values.type === 'single' || values.type === 'multi') && (
            <div className="flex flex-col gap-2.5">
              <div className="flex items-baseline justify-between gap-2.5">
                <span className={label}>Options</span>
                <span className="text-xs text-muted">
                  {values.type === 'single'
                    ? 'Tap the circle to mark the one correct answer'
                    : 'Tick every correct answer'}
                </span>
              </div>
              {options.fields.map((f, i) => {
                const checked = values.options[i]?.correct
                return (
                  <div key={f.id} className="flex items-center gap-2.5">
                    <button
                      type="button"
                      title="Mark as correct"
                      disabled={locked}
                      onClick={() => {
                        const next = getValues('options').map((o, j) => ({
                          ...o,
                          correct:
                            values.type === 'single' ? j === i : j === i ? !o.correct : o.correct,
                        }))
                        setValue('options', next)
                      }}
                      className={`flex size-[26px] shrink-0 items-center justify-center border-2 p-0 text-white ${
                        values.type === 'single' ? 'rounded-full' : 'rounded-[7px]'
                      } ${checked ? 'border-green bg-green' : 'border-[#D4D4D8] bg-card'}`}
                    >
                      {checked && <Check size={14} strokeWidth={3.4} />}
                    </button>
                    <span className="w-[18px] text-[13px] font-extrabold text-muted">
                      {LETTERS[i]}
                    </span>
                    <input
                      placeholder="Option text"
                      disabled={locked}
                      className={`${field} min-w-0 flex-1 rounded-[10px] px-[13px] py-[11px] text-sm`}
                      {...register(`options.${i}.text`)}
                    />
                    <button
                      type="button"
                      title="Remove"
                      onClick={() => options.remove(i)}
                      disabled={locked || options.fields.length <= MIN_OPTIONS}
                      className="flex size-[34px] shrink-0 items-center justify-center rounded-[9px] bg-page text-muted disabled:opacity-40"
                    >
                      <X size={14} strokeWidth={2.6} />
                    </button>
                  </div>
                )
              })}
              {options.fields.length < MAX_OPTIONS && !locked && (
                <button
                  type="button"
                  onClick={() => options.append({ text: '', correct: false })}
                  className="flex items-center gap-1.5 self-start rounded-[9px] border-[1.5px] border-dashed border-line-strong bg-card px-3 py-2 text-[13px] font-bold whitespace-nowrap"
                >
                  <Plus size={14} strokeWidth={2.6} />
                  Add option
                </button>
              )}
            </div>
          )}

          {values.type === 'fill' && (
            <div className="flex flex-col gap-3.5">
              <label className="flex flex-col gap-2">
                <span className={label}>
                  Sentence <span className={labelNote}>— use ___ for the blank</span>
                </span>
                <input
                  placeholder="I have never ___ sushi before."
                  disabled={locked}
                  className={field}
                  {...register('sentence')}
                />
              </label>
              <div className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-3.5">
                <label className="flex flex-col gap-2">
                  <span className={label}>
                    Correct answer <span className={labelNote}>— separate variants with /</span>
                  </span>
                  <input
                    placeholder="eaten"
                    disabled={locked}
                    className={field}
                    {...register('answer')}
                  />
                </label>
                <label className="flex flex-col gap-2">
                  <span className={label}>
                    Hint <span className={labelNote}>— optional</span>
                  </span>
                  <input
                    placeholder="eat"
                    disabled={locked}
                    className={field}
                    {...register('hint')}
                  />
                </label>
              </div>
              {blankMissing && (
                <span className="text-xs font-bold text-[#D12530]">
                  Add ___ where the blank should go.
                </span>
              )}
            </div>
          )}

          {values.type === 'order' && (
            <div className="flex flex-col gap-2.5">
              <label className="flex flex-col gap-2">
                <span className={label}>
                  Correct sentence <span className={labelNote}>— words are shuffled for users</span>
                </span>
                <input
                  placeholder="She has never been to London"
                  disabled={locked}
                  className={field}
                  {...register('sentence')}
                />
              </label>
              <span className="text-xs text-muted">
                {wordCount ? `${wordCount} words` : 'At least 3 words'}
              </span>
            </div>
          )}

          {similar.length > 0 && (
            <div className="flex flex-col gap-2.5 rounded-xl border border-brand-tint-border bg-brand-tint px-4 py-3.5">
              <div className="flex items-center gap-2">
                <Copy size={16} strokeWidth={2.4} className="shrink-0 text-brand-deeper" />
                <span className="flex-1 text-[13px] font-extrabold text-brand-deeper">
                  Similar questions already exist
                </span>
              </div>
              {similar.map((m) => (
                <div
                  key={m.question.id}
                  className="flex items-center gap-3 rounded-[10px] bg-card px-3 py-2.5"
                >
                  <span className="flex min-w-0 flex-1 flex-col gap-[3px]">
                    <span className="truncate text-[13px] font-bold">{m.text}</span>
                    <span className="text-xs text-muted">
                      {m.when} · {m.typeLabel}
                    </span>
                  </span>
                  <span className="shrink-0 rounded-full bg-[rgba(242,113,28,.12)] px-2 py-[3px] text-[11px] font-extrabold whitespace-nowrap text-brand-deeper">
                    {m.pct}% match
                  </span>
                </div>
              ))}
            </div>
          )}

          <label className="flex flex-col gap-2">
            <span className={label}>
              Explanation <span className={labelNote}>— shown after users answer</span>
            </span>
            <textarea
              rows={3}
              placeholder="Why is this the correct answer?"
              className={`${field} resize-y text-sm leading-normal`}
              {...register('explanation')}
            />
          </label>

          <div className="flex flex-col gap-2.5">
            <div className="flex items-baseline justify-between gap-2.5">
              <span className={label}>Publish date</span>
              <span className="text-xs text-muted">
                {live ? 'Today · live now' : values.date ? dayLabel(values.date) : 'Not scheduled'}
              </span>
            </div>
            <div className="grid grid-cols-7 gap-1.5">
              {days.map((d) => {
                const on = values.date === d
                const has = taken.has(d)
                return (
                  <button
                    key={d}
                    type="button"
                    disabled={live}
                    title={has ? taken.get(d)!.prompt : undefined}
                    onClick={() => setValue('date', d)}
                    className={`flex flex-col items-center gap-0.5 rounded-[10px] border-[1.5px] py-2 disabled:cursor-not-allowed disabled:opacity-50 ${
                      on ? 'border-brand bg-brand text-white' : 'border-line bg-card text-ink'
                    }`}
                  >
                    <span className="text-[10px] font-extrabold tracking-[.04em] uppercase opacity-80">
                      {dayLabel(d).slice(0, 3)}
                    </span>
                    <span className="text-base font-extrabold">{Number(d.slice(8))}</span>
                    <span
                      className="size-[5px] rounded-full"
                      style={{ background: has ? (on ? '#fff' : '#D4D4D8') : 'transparent' }}
                    />
                  </button>
                )
              })}
            </div>
            {takenBy && (
              <span className="text-xs font-bold text-brand-deeper">
                This day already has a question — scheduling will replace it.
              </span>
            )}
          </div>

          <label className="flex max-w-[320px] flex-col gap-2">
            <span className={label}>Shown as author</span>
            <input
              placeholder="Name"
              maxLength={60}
              className={`${field} text-sm`}
              {...register('authorName')}
            />
          </label>

          <div className="flex flex-wrap justify-end gap-2.5 border-t border-line pt-[18px]">
            <Button variant="secondary" type="button" onClick={() => navigate(backTo)}>
              Cancel
            </Button>
            {!live && (
              <Button
                variant="secondary"
                type="button"
                disabled={!draftable || busy}
                onClick={() => submit(false)}
              >
                Save draft
              </Button>
            )}
            <Button
              type="button"
              disabled={!publishable || busy}
              onClick={() => submit(true)}
              className="px-[22px]"
            >
              {live ? 'Save changes' : 'Schedule'}
            </Button>
          </div>
        </div>

        <AppPreview values={values} />
      </div>
    </div>
  )
}

function Notice({ children }: { children: string }) {
  return (
    <div className="mx-auto max-w-[1180px] rounded-2xl border border-line bg-card px-5 py-10 text-center text-sm font-semibold text-muted">
      {children}{' '}
      <Link to="/library" className="font-bold">
        Back to library
      </Link>
    </div>
  )
}
