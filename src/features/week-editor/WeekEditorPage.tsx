import { Check, ChevronLeft, Loader2, Plus } from 'lucide-react'
import { useState } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router'
import { toast } from 'sonner'
import { errorMessage } from '@/lib/errors'
import { WEEK_STATUS, weekRange } from '@/lib/weeks'
import {
  speakWord,
  translateLesson,
  useSaveWeekLesson,
  useWeekLesson,
  type LessonDetail,
} from '@/services/lessons'
import {
  localeName,
  useInvalidateTranslations,
  useLessonTranslation,
  useLessonTranslations,
  useMarkLocaleReviewed,
  type TranslationItem,
} from '@/services/translations'
import { CardEditor } from './CardEditor'
import { DailyQuestionsTab } from './DailyQuestionsTab'
import { LanguagesCard } from './LanguagesCard'
import { TranslationReview } from './TranslationReview'
import { ITEM_STATE, itemState } from './translationModel'
import {
  cardsOf,
  fromLesson,
  lessonReady,
  needsSpeech,
  newGrammarCard,
  newVocabCard,
  toPayload,
  type CardForm,
  type LessonForm,
  type VocabCardForm,
} from './editorModel'
import { ImageDrop } from './ImageDrop'
import { PhonePreview } from './PhonePreview'
import { FieldLabel, inputCls } from './ui'

// Week editor (design Weekly Lessons.dc.html "WEEK EDITOR", changes since v1
// §4): header with checks + Save & translate, notice, Lesson / Daily questions
// tabs. Daily questions: DailyQuestionsTab (TASK-026). Languages (§5):
// LanguagesCard + TranslationReview (TASK-027).

const TYPES = [
  { id: 'grammar', label: 'Grammar', desc: 'Cards built from blocks' },
  { id: 'vocab', label: 'Vocabulary by topic', desc: 'Word flashcards' },
] as const

export function WeekEditorPage() {
  const { weekStart = '' } = useParams()
  const { data, isLoading, error } = useWeekLesson(weekStart)

  if (!/^\d{4}-\d{2}-\d{2}$/.test(weekStart)) return <div className="p-8 text-sm text-red-text">Invalid week.</div>
  if (isLoading) return <div className="p-8 text-sm text-muted">Loading…</div>
  if (error || !data) return <div className="p-8 text-sm text-red-text">{errorMessage(error)}</div>

  // Re-create the form when the saved lesson changes (key).
  return (
    <Editor
      key={`${weekStart}-${data.lesson?.id ?? 'new'}`}
      weekStart={weekStart}
      initial={fromLesson(data.lesson)}
      lesson={data.lesson}
      status={data.week?.status ?? 'empty'}
      questionsCount={data.week?.question_days.filter(Boolean).length ?? 0}
    />
  )
}

function Editor({
  weekStart,
  initial,
  lesson,
  status,
  questionsCount,
}: {
  weekStart: string
  initial: LessonForm
  lesson: LessonDetail | null
  status: keyof typeof WEEK_STATUS
  questionsCount: number
}) {
  const navigate = useNavigate()
  const [params, setParams] = useSearchParams()
  const tab = params.get('tab') === 'questions' ? 'questions' : 'lesson'
  const save = useSaveWeekLesson(weekStart)
  const [form, setForm] = useState<LessonForm>(initial)
  const [current, setCurrent] = useState(0)
  const [busy, setBusy] = useState<string | null>(null)
  const readOnly = status === 'ended'
  // Languages (TASK-027): null = English source.
  const [locale, setLocale] = useState<string | null>(null)
  const [busyLocales, setBusyLocales] = useState<Set<string>>(new Set())
  const invalidateTranslations = useInvalidateTranslations()
  const { data: trSummary } = useLessonTranslations(lesson?.id ?? null)
  const { data: trItems } = useLessonTranslation(lesson?.id ?? null, locale)
  const markAll = useMarkLocaleReviewed()

  const cards = cardsOf(form)
  const card = cards[Math.min(current, cards.length - 1)] ?? null
  const ready = lessonReady(form)
  const st = WEEK_STATUS[status]

  const setCards = (next: CardForm[]) =>
    setForm((f) =>
      f.type === 'grammar'
        ? { ...f, grammar: next as LessonForm['grammar'] }
        : { ...f, vocab: next as LessonForm['vocab'] },
    )

  // Translation item of a form card (cards: card id; words: the word's id).
  const itemOf = (c: CardForm | null): TranslationItem | undefined => {
    if (!c?.id || !trItems) return undefined
    if (c.kind === 'grammar') return trItems.find((t) => t.kind === 'card' && t.id === c.id)
    const wordId = lesson?.cards.find((x) => x.id === c.id && x.kind === 'vocab')
    const id = wordId?.kind === 'vocab' ? wordId.word.id : null
    return trItems.find((t) => t.kind === 'word' && t.id === id)
  }

  const runTranslate = async (loc: string, force: boolean) => {
    if (!lesson) return
    if (force && trItems?.length && trItems.every((t) => t.status === 'reviewed' && t.fresh)) {
      toast(`All ${localeName(loc)} cards are reviewed · nothing to re-translate`)
      return
    }
    setBusyLocales((b) => new Set(b).add(loc))
    try {
      const r = await translateLesson(lesson.id, { locales: [loc], force })
      if (r.errors.length) toast.warning(`${localeName(loc)}: ${r.errors[0].error}`)
      else toast.success(`${localeName(loc)} translated`)
    } catch (e) {
      toast.error(errorMessage(e))
    } finally {
      setBusyLocales((b) => {
        const n = new Set(b)
        n.delete(loc)
        return n
      })
      invalidateTranslations()
    }
  }

  const addCard = () => {
    setCards([...cards, form.type === 'grammar' ? newGrammarCard() : newVocabCard()])
    setCurrent(cards.length)
  }

  const onSave = async () => {
    if (!form.title.trim()) return toast.error('Add a topic name first.')
    const missingFile = form.type === 'vocab' && form.vocab.find((c) => c.audioSource === 'file' && !c.fileUrl)
    if (missingFile) {
      return toast.error(`“${missingFile.word || 'New word'}”: upload a recording or switch to Generate.`)
    }
    let next = form
    try {
      // Pronunciation of new / changed words (design: on save, TTS for every
      // word whose audio is not Ready).
      if (form.type === 'vocab') {
        const todo = form.vocab.filter(needsSpeech)
        if (todo.length) {
          setBusy(`Generating audio (${todo.length})…`)
          const made = new Map<string, Partial<VocabCardForm>>()
          await Promise.all(
            todo.map(async (c) => {
              const url = await speakWord(c.word.trim(), c.voice)
              made.set(c.key, { ttsUrl: url, ttsText: c.word.trim(), ttsVoice: c.voice })
            }),
          )
          next = { ...form, vocab: form.vocab.map((c) => ({ ...c, ...made.get(c.key) })) }
          setForm(next)
        }
      }

      setBusy('Saving…')
      const saved = await save.mutateAsync(toPayload(next))
      // New cards / words get their ids: keep editing the saved version, or
      // the next save would replace them (and lose progress / translations).
      setForm(fromLesson(saved))
      toast.success('Saved. Translating…')

      setBusy('Translating…')
      setBusyLocales(new Set(['*']))
      const result = await translateLesson(saved.id).finally(() => {
        setBusyLocales(new Set())
        invalidateTranslations()
      })
      if (result.errors.length) {
        toast.warning(`Translations updated with ${result.errors.length} problem(s) · review them in Languages`)
      } else {
        toast.success('Translations updated · review them in Languages')
      }
    } catch (e) {
      toast.error(errorMessage(e).replace(/^invalid_lesson:\s*/, 'Check the lesson: '))
    } finally {
      setBusy(null)
    }
  }

  const checks = [
    { ok: ready, label: ready ? 'Lesson ready' : 'Lesson incomplete' },
    { ok: questionsCount === 7, label: `${questionsCount}/7 questions` },
  ]

  return (
    <div className="mx-auto flex max-w-[1320px] flex-col gap-[18px]">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex flex-col gap-1.5">
          <button
            type="button"
            onClick={() => navigate('/weeks')}
            className="flex items-center gap-1 self-start text-[13px] font-bold text-muted"
          >
            <ChevronLeft size={14} strokeWidth={2.4} />
            Weeks
          </button>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="m-0 text-[28px] font-extrabold tracking-[-0.01em]">{weekRange(weekStart)}</h1>
            <span className="rounded-full px-2.5 py-1 text-xs font-extrabold" style={{ background: st.bg, color: st.fg }}>
              {st.label}
            </span>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <span className="flex items-center gap-3.5 text-[13px] font-bold">
            {checks.map((c) => (
              <span key={c.label} className="flex items-center gap-1.5" style={{ color: c.ok ? '#138A5B' : '#B4500F' }}>
                <Check size={14} strokeWidth={3} />
                {c.label}
              </span>
            ))}
          </span>
          {!readOnly && (
            <button
              type="button"
              disabled={!!busy}
              onClick={onSave}
              className="flex items-center gap-2 rounded-[10px] bg-brand px-[18px] py-2.5 text-sm font-extrabold whitespace-nowrap text-white disabled:opacity-60"
            >
              {busy && <Loader2 size={14} className="animate-spin" />}
              {busy ?? 'Save & translate'}
            </button>
          )}
        </div>
      </div>

      {(status === 'live' || status === 'ended') && (
        <div
          className="rounded-xl px-4 py-3 text-[13px] font-semibold"
          style={{
            background: status === 'live' ? '#FFF4EC' : '#F2F2F3',
            color: status === 'live' ? '#B4500F' : '#6E6E73',
          }}
        >
          {status === 'live'
            ? 'This week is live. Changes reach users right away.'
            : 'This week has ended. Users can still review it in the Last week tab.'}
        </div>
      )}

      <div className="flex gap-1 border-b border-line-strong">
        {(
          [
            ['lesson', `Lesson · ${cards.length} ${form.type === 'grammar' ? 'cards' : 'words'}`],
            ['questions', `Daily questions · ${questionsCount}/7`],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            onClick={() => setParams(id === 'questions' ? { tab: 'questions' } : {}, { replace: true })}
            className="-mb-px border-b-2 px-3.5 py-2.5 text-sm font-extrabold whitespace-nowrap"
            style={{ color: tab === id ? '#17171A' : '#8E8E93', borderColor: tab === id ? '#F2711C' : 'transparent' }}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === 'questions' ? (
        <DailyQuestionsTab weekStart={weekStart} lesson={lesson} readOnly={readOnly} />
      ) : (
        <div className="flex flex-col gap-[18px]">
          <div className="flex flex-wrap items-start gap-5 rounded-[18px] border border-line bg-card px-5 py-[18px]">
            <div className="flex min-w-0 flex-[1_1_420px] flex-col gap-3.5">
              <div className="flex flex-col gap-1.5">
                <FieldLabel>Lesson type</FieldLabel>
                <div className="grid grid-cols-[repeat(auto-fill,minmax(min(100%,220px),260px))] gap-2.5">
                  {TYPES.map((t) => {
                    const on = form.type === t.id
                    return (
                      <button
                        key={t.id}
                        type="button"
                        disabled={readOnly}
                        onClick={() => {
                          setForm((f) => ({ ...f, type: t.id }))
                          setCurrent(0)
                        }}
                        className="flex items-center gap-3 rounded-xl border-[1.5px] px-3.5 py-3 text-left disabled:cursor-not-allowed"
                        style={{ background: on ? 'rgba(242,113,28,0.06)' : '#fff', borderColor: on ? '#F2711C' : '#E4E4E7' }}
                      >
                        <span
                          className="flex size-5 flex-none items-center justify-center rounded-full border-2"
                          style={{ borderColor: on ? '#F2711C' : '#D4D4D8' }}
                        >
                          <span className="size-2.5 rounded-full" style={{ background: on ? '#F2711C' : 'transparent' }} />
                        </span>
                        <span className="flex min-w-0 flex-col gap-0.5">
                          <span className="text-sm font-extrabold">{t.label}</span>
                          <span className="text-xs text-muted">{t.desc}</span>
                        </span>
                      </button>
                    )
                  })}
                </div>
              </div>
              <label className="flex flex-col gap-1.5">
                <FieldLabel>Topic name · shown on the lesson card, max 2 lines</FieldLabel>
                <input
                  value={form.title}
                  disabled={readOnly}
                  maxLength={120}
                  placeholder="e.g. Past simple vs. Present perfect"
                  onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                  className={`${inputCls} py-[11px] text-base font-bold`}
                />
              </label>
            </div>
            <div className="flex flex-[0_0_220px] flex-col gap-1.5">
              <FieldLabel>Cover image · optional</FieldLabel>
              <ImageDrop
                url={form.coverUrl}
                onChange={(coverUrl) => setForm((f) => ({ ...f, coverUrl }))}
                placeholder="Drop cover image"
                disabled={readOnly}
                className="h-[110px] w-[220px]"
              />
            </div>
          </div>

          <LanguagesCard
            summary={trSummary}
            saved={!!lesson}
            locale={locale}
            onLocale={setLocale}
            busy={busyLocales}
            hasMachine={!!trItems?.some((t) => t.translation && t.status === 'machine')}
            onRetranslate={(loc) => runTranslate(loc, true)}
            onMarkAll={(loc) =>
              lesson &&
              markAll.mutate(
                { lessonId: lesson.id, locale: loc },
                {
                  onSuccess: (n) => toast.success(`${n} ${localeName(loc)} translation(s) marked reviewed`),
                  onError: (e) => toast.error(errorMessage(e)),
                },
              )
            }
          />

          <div className="flex flex-wrap items-start gap-[18px]">
            <div className="flex flex-[0_0_240px] flex-col gap-1 rounded-[18px] border border-line bg-card p-3">
              <div className="flex items-center justify-between px-1.5 pt-1 pb-2">
                <span className="text-xs font-extrabold tracking-[.05em] text-subtle uppercase">
                  {form.type === 'grammar' ? 'Cards' : 'Words'}
                </span>
                <span className="text-xs text-subtle">Recommended 5–8</span>
              </div>
              {cards.map((c, i) => {
                const on = card?.key === c.key
                return (
                  <button
                    key={c.key}
                    type="button"
                    onClick={() => setCurrent(i)}
                    className="flex w-full items-start gap-2.5 rounded-[10px] border p-2.5 text-left"
                    style={{ borderColor: on ? '#F2711C' : 'transparent', background: on ? 'rgba(242,113,28,0.06)' : '#fff' }}
                  >
                    <span className="flex size-[22px] flex-none items-center justify-center rounded-md bg-page text-[11px] font-extrabold text-muted">
                      {i + 1}
                    </span>
                    <span className="flex min-w-0 flex-1 flex-col gap-px">
                      <span className="truncate text-[13px] font-extrabold">
                        {c.kind === 'grammar' ? c.label || 'Card' : c.word || 'New word'}
                      </span>
                      <span className="truncate text-xs text-muted">
                        {c.kind === 'grammar' ? c.heading || 'No heading' : c.meaning || '—'}
                      </span>
                      {locale && (() => {
                        const st = ITEM_STATE[itemState(itemOf(c), busyLocales.has(locale) || busyLocales.has('*'))]
                        return (
                          <span
                            className="mt-1 self-start rounded-[5px] px-1.5 py-0.5 text-[10px] font-extrabold tracking-[.04em] uppercase"
                            style={{ background: st.bg, color: st.fg }}
                          >
                            {st.label}
                          </span>
                        )
                      })()}
                    </span>
                  </button>
                )
              })}
              {!readOnly && cards.length < 30 && (
                <button
                  type="button"
                  onClick={addCard}
                  className="mt-1 flex items-center justify-center gap-1.5 rounded-[10px] border-[1.5px] border-dashed border-line-strong bg-card p-2.5 text-[13px] font-bold text-muted"
                >
                  <Plus size={14} strokeWidth={2.6} />
                  {form.type === 'grammar' ? 'Add card' : 'Add word'}
                </button>
              )}
            </div>

            <div className="flex min-w-0 flex-[1_1_440px] flex-col gap-3.5">
              {card && locale ? (
                <TranslationReview
                  key={`${locale}-${card.key}`}
                  item={itemOf(card)}
                  locale={locale}
                  index={cards.indexOf(card)}
                  busy={busyLocales.has(locale) || busyLocales.has('*')}
                  onTranslate={() => runTranslate(locale, false)}
                  readOnly={readOnly}
                />
              ) : card ? (
                <CardEditor
                  card={card}
                  index={cards.indexOf(card)}
                  count={cards.length}
                  readOnly={readOnly}
                  onChange={(c) => setCards(cards.map((x) => (x.key === c.key ? c : x)))}
                  onMove={(d) => {
                    const i = cards.indexOf(card)
                    const next = [...cards]
                    ;[next[i], next[i + d]] = [next[i + d], next[i]]
                    setCards(next)
                    setCurrent(i + d)
                  }}
                  onDelete={() => {
                    setCards(cards.filter((x) => x.key !== card.key))
                    setCurrent(Math.max(0, cards.indexOf(card) - 1))
                  }}
                />
              ) : (
                <div className="flex flex-col items-center gap-2.5 rounded-[18px] border-[1.5px] border-dashed border-line-strong bg-card px-5 py-10 text-center">
                  <span className="text-base font-extrabold">No content yet</span>
                  <span className="text-sm text-muted">
                    {form.type === 'grammar'
                      ? 'Add the first card: one idea, 1–2 blocks, readable in about 30 seconds.'
                      : 'Add the first word of this topic.'}
                  </span>
                  {!readOnly && (
                    <button
                      type="button"
                      onClick={addCard}
                      className="mt-1.5 rounded-[10px] bg-ink px-4 py-2.5 text-sm font-bold text-white"
                    >
                      {form.type === 'grammar' ? 'Add card' : 'Add word'}
                    </button>
                  )}
                </div>
              )}
            </div>

            <PhonePreview
              card={card}
              index={card ? cards.indexOf(card) : 0}
              count={cards.length}
              lessonTitle={form.title}
              locale={locale ? localeName(locale) : 'English'}
              translated={(() => {
                const it = locale ? itemOf(card) : undefined
                if (!it?.translation) return undefined
                return it.kind === 'card'
                  ? { grammar: it.translation }
                  : { meaning: it.translation.meaning, exampleTranslation: it.translation.example }
              })()}
            />
          </div>
        </div>
      )}
      {lesson == null && !readOnly && (
        <span className="text-xs text-subtle">Nothing is saved for this week yet.</span>
      )}
    </div>
  )
}
