import { ChevronDown, ChevronUp, Loader2, Music, Play, Trash2 } from 'lucide-react'
import { useRef, useState } from 'react'
import { toast } from 'sonner'
import { audioDuration } from '@/services/audio'
import { speakWord, uploadLessonMedia } from '@/services/lessons'
import { BlockEditor } from './BlockEditor'
import {
  audioStatus,
  BLOCK_NAMES,
  BLOCKS_MAX,
  BLOCKS_WARN,
  CARD_LABELS,
  newBlock,
  PARTS_OF_SPEECH,
  VOICES,
  type BlockType,
  type CardForm,
  type GrammarCardForm,
  type VocabCardForm,
} from './editorModel'
import { ImageDrop } from './ImageDrop'
import { Chip, FieldLabel, IconButton, inputCls } from './ui'

// Card editor of the Lesson tab (design "editor": card header, grammar
// label / heading / blocks, vocab word form with image and pronunciation).

const MAX_WORD_AUDIO_SECONDS = 5

function play(url: string) {
  new Audio(url).play().catch(() => toast.error('Could not play the audio.'))
}

function Pronunciation({
  card,
  onChange,
  readOnly,
}: {
  card: VocabCardForm
  onChange: (card: VocabCardForm) => void
  readOnly: boolean
}) {
  const input = useRef<HTMLInputElement>(null)
  const [busy, setBusy] = useState<'upload' | 'tts' | null>(null)
  const status = audioStatus(card)
  const isFile = card.audioSource === 'file'

  const playGenerated = async () => {
    if (status === 'ready' && card.ttsUrl) return play(card.ttsUrl)
    if (!card.word.trim()) return
    // Not generated yet: make it now (kept for the save).
    setBusy('tts')
    try {
      const url = await speakWord(card.word.trim(), card.voice)
      onChange({ ...card, ttsUrl: url, ttsText: card.word.trim(), ttsVoice: card.voice })
      play(url)
    } catch (e) {
      toast.error(e instanceof Error ? e.message : String(e))
    } finally {
      setBusy(null)
    }
  }

  const upload = async (file: File | undefined) => {
    if (!file) return
    setBusy('upload')
    try {
      const local = URL.createObjectURL(file)
      const seconds = await audioDuration(local).finally(() => URL.revokeObjectURL(local))
      if (seconds > MAX_WORD_AUDIO_SECONDS + 0.2) {
        toast.error(`The recording is ${seconds.toFixed(1)} s. Keep it under ${MAX_WORD_AUDIO_SECONDS} seconds.`)
        return
      }
      const res = await uploadLessonMedia(file)
      onChange({ ...card, audioSource: 'file', fileUrl: res.url, fileName: res.file_name })
    } catch (e) {
      toast.error(e instanceof Error ? e.message : String(e))
    } finally {
      setBusy(null)
    }
  }

  const badge =
    status === 'no-word'
      ? { label: 'No word yet', bg: '#F2F2F3', fg: '#6E6E73' }
      : status === 'ready'
        ? { label: 'Ready', bg: 'rgba(31,169,113,0.12)', fg: '#137A51' }
        : { label: 'Generates on save', bg: '#F2F2F3', fg: '#6E6E73' }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <FieldLabel>
          Pronunciation ·{' '}
          {isFile ? 'your recording replaces the generated audio' : 'generated from the word when you save'}
        </FieldLabel>
        <div className="flex gap-[3px] rounded-[9px] bg-page p-[3px]">
          {(['tts', 'file'] as const).map((src) => {
            const on = card.audioSource === src
            return (
              <button
                key={src}
                type="button"
                disabled={readOnly}
                onClick={() => onChange({ ...card, audioSource: src })}
                className="rounded-[7px] px-2.5 py-[5px] text-xs font-extrabold whitespace-nowrap"
                style={{
                  background: on ? '#fff' : 'transparent',
                  color: on ? '#17171A' : '#6E6E73',
                  boxShadow: on ? '0 1px 2px rgba(0,0,0,0.08)' : 'none',
                }}
              >
                {src === 'tts' ? 'Generate' : 'Upload file'}
              </button>
            )
          })}
        </div>
      </div>

      {isFile ? (
        <label
          className={`flex items-center gap-3 rounded-xl border-[1.5px] border-dashed border-line-strong bg-card px-3 py-2.5 ${
            readOnly ? 'cursor-not-allowed' : 'cursor-pointer'
          }`}
        >
          <input
            ref={input}
            type="file"
            accept="audio/mpeg,audio/mp4,audio/x-m4a,audio/wav"
            className="hidden"
            disabled={readOnly || !!busy}
            onChange={(e) => {
              upload(e.target.files?.[0])
              e.target.value = ''
            }}
          />
          <span className="flex size-[34px] flex-none items-center justify-center rounded-[9px] bg-page">
            {busy === 'upload' ? <Loader2 size={16} className="animate-spin" /> : <Music size={16} />}
          </span>
          <span className="flex min-w-0 flex-1 flex-col gap-0.5">
            <span className="truncate text-[13px] font-bold">{card.fileName ?? 'Choose an audio file'}</span>
            <span className="text-xs text-muted">MP3, M4A or WAV · up to 5 seconds</span>
          </span>
          {card.fileUrl && (
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault()
                play(card.fileUrl!)
              }}
              className="flex h-8 items-center gap-1.5 rounded-[9px] bg-ink px-3 text-[13px] font-extrabold whitespace-nowrap text-white"
            >
              <Play size={12} fill="currentColor" />
              Play
            </button>
          )}
          <span className="flex-none rounded-[9px] border border-line-strong px-3 py-[7px] text-[13px] font-bold whitespace-nowrap">
            {card.fileUrl ? 'Replace' : 'Browse'}
          </span>
        </label>
      ) : (
        <div className="flex flex-wrap items-center gap-2.5 rounded-xl border border-line bg-card px-3 py-2.5">
          <button
            type="button"
            disabled={!card.word.trim() || !!busy}
            onClick={playGenerated}
            className="flex h-[34px] items-center gap-1.5 rounded-[9px] px-3 text-[13px] font-extrabold whitespace-nowrap disabled:opacity-50"
            style={{
              background: card.word.trim() ? '#17171A' : '#F2F2F3',
              color: card.word.trim() ? '#fff' : '#8E8E93',
            }}
          >
            {busy === 'tts' ? <Loader2 size={13} className="animate-spin" /> : <Play size={13} fill="currentColor" />}
            Play
          </button>
          <div className="flex min-w-0 flex-1 flex-wrap gap-1.5">
            {VOICES.map((v) => {
              const on = card.voice === v.id
              return (
                <button
                  key={v.id}
                  type="button"
                  disabled={readOnly}
                  onClick={() => onChange({ ...card, voice: v.id })}
                  className="rounded-full border-[1.5px] px-2.5 py-[5px] text-xs font-bold whitespace-nowrap"
                  style={{
                    borderColor: on ? '#F2711C' : '#E4E4E7',
                    background: on ? 'rgba(242,113,28,0.08)' : '#fff',
                    color: on ? '#C25A14' : '#17171A',
                  }}
                >
                  {v.label}
                </button>
              )
            })}
          </div>
          <span
            className="rounded-md px-2 py-[3px] text-[11px] font-extrabold tracking-[.04em] whitespace-nowrap uppercase"
            style={{ background: badge.bg, color: badge.fg }}
          >
            {badge.label}
          </span>
        </div>
      )}
    </div>
  )
}

function VocabFields({
  card,
  onChange,
  readOnly,
}: {
  card: VocabCardForm
  onChange: (card: VocabCardForm) => void
  readOnly: boolean
}) {
  const field = (key: 'word' | 'ipa' | 'meaning' | 'example') => ({
    value: card[key],
    disabled: readOnly,
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => onChange({ ...card, [key]: e.target.value }),
  })
  return (
    <>
      <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,180px),1fr))] gap-3">
        <label className="flex flex-col gap-1.5">
          <FieldLabel>Word</FieldLabel>
          <input placeholder="board" {...field('word')} className={`${inputCls} text-[15px] font-bold`} />
        </label>
        <label className="flex flex-col gap-1.5">
          <FieldLabel>IPA</FieldLabel>
          <input placeholder="/bɔːd/" {...field('ipa')} className={inputCls} />
        </label>
        <label className="flex flex-col gap-1.5">
          <FieldLabel>Meaning (English)</FieldLabel>
          <input placeholder="to get on a plane, train or ship" {...field('meaning')} className={inputCls} />
        </label>
      </div>
      <div className="flex flex-col gap-1.5">
        <FieldLabel>Part of speech</FieldLabel>
        <div className="flex flex-wrap gap-1.5">
          {PARTS_OF_SPEECH.map((pos) => (
            <Chip key={pos} on={card.pos === pos} disabled={readOnly} onClick={() => onChange({ ...card, pos })}>
              {pos}
            </Chip>
          ))}
        </div>
      </div>
      <label className="flex flex-col gap-1.5">
        <FieldLabel>Example · wrap the word in *stars* to highlight it</FieldLabel>
        <input placeholder="Passengers can *board* the plane at gate 12." {...field('example')} className={inputCls} />
      </label>
      <div className="flex flex-col gap-1.5">
        <FieldLabel>Image · optional · landscape 16:10, at least 800×500</FieldLabel>
        <ImageDrop
          url={card.imageUrl}
          onChange={(imageUrl) => onChange({ ...card, imageUrl })}
          placeholder="Drop or click to add"
          disabled={readOnly}
          className="aspect-[16/10] w-60 max-w-full"
        />
        <span className="text-xs text-subtle">Shown at the top of the flashcard.</span>
      </div>
      <Pronunciation card={card} onChange={onChange} readOnly={readOnly} />
    </>
  )
}

function GrammarBlocks({
  card,
  onChange,
  readOnly,
}: {
  card: GrammarCardForm
  onChange: (card: GrammarCardForm) => void
  readOnly: boolean
}) {
  const blocks = card.blocks
  const setBlocks = (next: typeof blocks) => onChange({ ...card, blocks: next })
  const move = (i: number, d: -1 | 1) => {
    const next = [...blocks]
    ;[next[i], next[i + d]] = [next[i + d], next[i]]
    setBlocks(next)
  }

  return (
    <div className="flex flex-col gap-3">
      {blocks.map((b, i) => (
        <BlockEditor
          key={i}
          block={b}
          first={i === 0}
          last={i === blocks.length - 1}
          readOnly={readOnly}
          onChange={(nb) => setBlocks(blocks.map((x, j) => (j === i ? nb : x)))}
          onUp={() => move(i, -1)}
          onDown={() => move(i, 1)}
          onRemove={() => setBlocks(blocks.filter((_, j) => j !== i))}
        />
      ))}
      {blocks.length > BLOCKS_WARN && (
        <div className="rounded-xl bg-brand-tint px-3.5 py-2.5 text-[13px] font-semibold text-brand-deeper">
          This card has more than {BLOCKS_WARN} blocks. Consider splitting it so it stays readable in about 30 seconds.
        </div>
      )}
      {!readOnly && blocks.length < BLOCKS_MAX && (
        <div className="flex flex-col gap-2 rounded-2xl border-[1.5px] border-dashed border-line-strong bg-card px-4 py-3.5">
          <span className="text-xs font-extrabold tracking-[.05em] text-subtle uppercase">Add block</span>
          <div className="flex flex-wrap gap-1.5">
            {(Object.keys(BLOCK_NAMES) as BlockType[]).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setBlocks([...blocks, newBlock(t)])}
                className="rounded-[9px] border border-line-strong bg-card px-3 py-[7px] text-[13px] font-bold"
              >
                + {BLOCK_NAMES[t]}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export function CardEditor({
  card,
  index,
  count,
  onChange,
  onMove,
  onDelete,
  readOnly,
}: {
  card: CardForm
  index: number
  count: number
  onChange: (card: CardForm) => void
  onMove: (delta: -1 | 1) => void
  onDelete: () => void
  readOnly: boolean
}) {
  const title = card.kind === 'grammar' ? `Card ${index + 1}` : `Word ${index + 1}`
  return (
    <>
      <div className="flex flex-col gap-3.5 rounded-[18px] border border-line bg-card px-5 py-[18px]">
        <div className="flex items-center justify-between gap-2.5">
          <span className="text-[15px] font-extrabold">{title}</span>
          {!readOnly && (
            <div className="flex gap-1.5">
              <IconButton title="Move up" disabled={index === 0} onClick={() => onMove(-1)}>
                <ChevronUp size={14} strokeWidth={2.4} />
              </IconButton>
              <IconButton title="Move down" disabled={index === count - 1} onClick={() => onMove(1)}>
                <ChevronDown size={14} strokeWidth={2.4} />
              </IconButton>
              <IconButton title="Delete" danger onClick={onDelete}>
                <Trash2 size={14} strokeWidth={2.2} />
              </IconButton>
            </div>
          )}
        </div>

        {card.kind === 'grammar' ? (
          <div className="flex flex-col gap-3">
            <div className="flex flex-col gap-1.5">
              <FieldLabel>Card label</FieldLabel>
              <div className="flex flex-wrap gap-1.5">
                {CARD_LABELS.map((l) => (
                  <Chip key={l} on={card.label === l} disabled={readOnly} onClick={() => onChange({ ...card, label: l })}>
                    {l}
                  </Chip>
                ))}
              </div>
            </div>
            <label className="flex flex-col gap-1.5">
              <FieldLabel>Heading</FieldLabel>
              <input
                value={card.heading}
                disabled={readOnly}
                placeholder="One idea per card"
                onChange={(e) => onChange({ ...card, heading: e.target.value })}
                className={`${inputCls} text-[15px] font-bold`}
              />
            </label>
          </div>
        ) : (
          <VocabFields card={card} onChange={onChange} readOnly={readOnly} />
        )}
      </div>
      {card.kind === 'grammar' && <GrammarBlocks card={card} onChange={onChange} readOnly={readOnly} />}
    </>
  )
}
