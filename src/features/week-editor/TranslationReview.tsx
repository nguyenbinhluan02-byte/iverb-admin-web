import { Loader2 } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { errorMessage } from '@/lib/errors'
import type { GrammarContent } from '@/services/lessons'
import {
  localeName,
  useSaveCardTranslation,
  useSaveWordTranslation,
  useSetTranslationStatus,
  type TranslationItem,
} from '@/services/translations'
import { getAt, grammarRows, ITEM_STATE, itemState, setAt } from './translationModel'

// Review screen for one card in one language (design changes since v1 §5):
// English above each translated field; editing a field (on blur) saves it as
// Reviewed; locked parts stay in English.

function Field({
  label,
  source,
  value,
  onCommit,
  disabled,
}: {
  label: string
  source: string
  value: string
  onCommit: (value: string) => void
  disabled: boolean
}) {
  const [text, setText] = useState(value)
  return (
    <div className="grid grid-cols-[140px_minmax(0,1fr)] items-start gap-3">
      <span className="pt-0.5 text-[13px] font-bold">{label}</span>
      <div className="flex min-w-0 flex-col gap-1.5">
        <span className="text-xs leading-[1.4] text-subtle">
          <b className="font-extrabold">EN</b> · {source}
        </span>
        <textarea
          rows={2}
          value={text}
          disabled={disabled}
          placeholder="Translation"
          onChange={(e) => setText(e.target.value)}
          onBlur={() => text !== value && onCommit(text)}
          className="w-full resize-y rounded-[9px] border border-line-strong bg-card px-[11px] py-[9px] text-sm leading-[1.45] disabled:bg-page"
        />
      </div>
    </div>
  )
}

export function TranslationReview({
  item,
  locale,
  index,
  busy,
  onTranslate,
  readOnly,
}: {
  /** undefined: the card is not saved yet. */
  item: TranslationItem | undefined
  locale: string
  index: number
  busy: boolean
  onTranslate: () => void
  readOnly: boolean
}) {
  const saveCard = useSaveCardTranslation()
  const saveWord = useSaveWordTranslation()
  const setStatus = useSetTranslationStatus()
  const name = localeName(locale)
  const state = itemState(item, busy)
  const style = ITEM_STATE[state]
  const saving = saveCard.isPending || saveWord.isPending

  const fail = (e: unknown) => toast.error(errorMessage(e).replace(/^invalid_translation:\s*/, 'Translation: '))

  const title = item?.kind === 'word' ? `Word ${index + 1} · ${item.source.word}` : `Card ${index + 1}`

  const body = () => {
    if (!item) {
      return <div className="py-8 text-center text-sm text-muted">Save the lesson to translate this card.</div>
    }
    if (busy) {
      return (
        <div className="flex flex-col items-center gap-2.5 py-10 text-muted">
          <Loader2 size={26} className="animate-spin text-brand" />
          <span className="text-sm font-bold">Translating into {name}…</span>
        </div>
      )
    }
    if (!item.translation) {
      return (
        <div className="flex flex-col items-center gap-2 py-8 text-center">
          <span className="text-[15px] font-extrabold">Not translated yet</span>
          <span className="max-w-[360px] text-[13px] text-muted">
            Save the lesson to translate every language, or translate {name} now.
          </span>
          {!readOnly && (
            <button
              type="button"
              onClick={onTranslate}
              className="mt-1.5 rounded-[10px] bg-ink px-4 py-[9px] text-[13px] font-extrabold text-white"
            >
              Translate {name}
            </button>
          )}
        </div>
      )
    }

    if (item.kind === 'word') {
      const tr = item.translation
      const commit = (patch: Partial<typeof tr>) =>
        saveWord.mutate(
          { wordId: item.id, locale, meaning: patch.meaning ?? tr.meaning, example: patch.example ?? tr.example },
          { onError: fail },
        )
      return (
        <div className="flex flex-col gap-3">
          <div className="grid grid-cols-[140px_minmax(0,1fr)] gap-3">
            <span className="text-[13px] leading-[1.45] text-muted">{item.source.word}</span>
          </div>
          <Field
            key={`m-${item.id}-${tr.meaning}`}
            label="Meaning"
            source={item.source.meaning}
            value={tr.meaning}
            disabled={readOnly || saving}
            onCommit={(meaning) => meaning.trim() && commit({ meaning })}
          />
          <Field
            key={`e-${item.id}-${tr.example}`}
            label="Example translation"
            source={item.source.example.replace(/\*/g, '')}
            value={tr.example ?? ''}
            disabled={readOnly || saving}
            onCommit={(example) => commit({ example })}
          />
        </div>
      )
    }

    const tr = item.translation as GrammarContent
    return (
      <div className="flex flex-col gap-3">
        {grammarRows(item.source).map((row, i) => {
          if (row.kind === 'section') {
            return (
              <div
                key={i}
                className="mt-1 border-t border-page pt-3 text-[11px] font-extrabold tracking-[.05em] text-brand-deep uppercase"
              >
                {row.title}
              </div>
            )
          }
          if (row.kind === 'locked') {
            return (
              <div key={i} className="grid grid-cols-[140px_minmax(0,1fr)] items-start gap-3">
                <span className="text-xs font-bold text-subtle">Locked</span>
                <span className="text-[13px] leading-[1.45] text-muted">{row.text}</span>
              </div>
            )
          }
          const value = getAt(tr, row.path)
          return (
            <Field
              key={`${row.path.join('.')}-${value}`}
              label={row.label}
              source={row.source}
              value={value}
              disabled={readOnly || saving}
              onCommit={(v) =>
                saveCard.mutate({ cardId: item.id, locale, content: setAt(tr, row.path, v) }, { onError: fail })
              }
            />
          )
        })}
        <span className="text-xs text-subtle">Locked parts stay in English. They're what users are learning.</span>
      </div>
    )
  }

  const reviewed = state === 'reviewed'
  const canToggle = !readOnly && !!item?.translation && !busy

  return (
    <div className="flex flex-col gap-3.5 rounded-[18px] border border-line bg-card px-5 py-[18px]">
      <div className="flex flex-wrap items-center justify-between gap-2.5">
        <div className="flex flex-wrap items-center gap-2.5">
          <span className="text-[15px] font-extrabold">{title}</span>
          <span
            className="rounded-md px-2 py-[3px] text-[11px] font-extrabold tracking-[.04em] uppercase"
            style={{ background: style.bg, color: style.fg }}
          >
            {style.label}
          </span>
          {saving && <Loader2 size={14} className="animate-spin text-muted" />}
        </div>
        {canToggle && (
          <button
            type="button"
            disabled={setStatus.isPending}
            onClick={() =>
              setStatus.mutate(
                { kind: item!.kind, id: item!.id, locale, status: reviewed ? 'machine' : 'reviewed' },
                { onError: fail },
              )
            }
            className="rounded-[9px] px-3.5 py-2 text-[13px] font-extrabold whitespace-nowrap"
            style={{
              background: reviewed ? '#F2F2F3' : '#1FA971',
              color: reviewed ? '#17171A' : '#fff',
            }}
          >
            {reviewed ? 'Mark as machine' : 'Mark reviewed'}
          </button>
        )}
      </div>
      {state === 'outdated' && (
        <div className="rounded-[10px] bg-[rgba(245,51,63,0.07)] px-3.5 py-2.5 text-[13px] font-semibold text-red-text">
          The English card changed after this was translated. Save to re-translate, or update it here.
        </div>
      )}
      {body()}
    </div>
  )
}
