import { Lightbulb, Volume2 } from 'lucide-react'
import type { GrammarBlock, Tone } from '@/services/lessons'
import { splitStarred, toGrammarBlock, type CardForm } from './editorModel'

// "App preview" phone (design: 320 × 650, sticky). Shows the current card the
// way the app draws it (i_verbs_v2 src/screens/Lesson).

const ACCENT = '#F2711C'
const GREEN = '#1FA971'
const RED = '#F5333F'
const TONE: Record<Tone, { fg: string; bg: string; line: string }> = {
  accent: { fg: ACCENT, bg: 'rgba(242,113,28,0.1)', line: 'rgba(242,113,28,0.2)' },
  green: { fg: GREEN, bg: 'rgba(31,169,113,0.1)', line: 'rgba(31,169,113,0.2)' },
}

function Starred({ text, className }: { text: string; className?: string }) {
  return (
    <span className={className}>
      {splitStarred(text).map((p, i) =>
        p.marked ? (
          <b key={i} style={{ color: ACCENT }}>
            {p.text}
          </b>
        ) : (
          <span key={i}>{p.text}</span>
        ),
      )}
    </span>
  )
}

function Block({ block }: { block: GrammarBlock }) {
  switch (block.type) {
    case 'text':
      return <p className="m-0 text-sm leading-[1.55]">{block.text || '…'}</p>
    case 'tip':
      return (
        <div className="flex items-start gap-2 rounded-xl px-3 py-2.5" style={{ background: 'rgba(242,113,28,0.08)' }}>
          <Lightbulb size={16} color={ACCENT} className="mt-px flex-none" />
          <span className="text-[13px] leading-normal">{block.text || '…'}</span>
        </div>
      )
    case 'formula':
      return (
        <div className="flex flex-col gap-2.5 rounded-xl bg-page px-3.5 py-3">
          {block.rows.map((r, i) => (
            <div key={i} className="flex flex-col gap-[5px]">
              <span className="text-[10px] font-extrabold tracking-[.05em] text-subtle uppercase">{r.label}</span>
              <div className="flex flex-wrap items-center gap-[5px]">
                {r.parts.map((p, j) => {
                  const muted = p === '…' || p === '…?'
                  return (
                    <span key={j} className="contents">
                      {j > 0 && <span className="text-xs font-bold text-subtle">+</span>}
                      <span
                        className="rounded-lg px-2 py-[5px] text-[13px] font-bold"
                        style={{
                          background: muted ? 'transparent' : j === 0 ? '#fff' : 'rgba(242,113,28,0.12)',
                          color: muted ? '#8E8E93' : j === 0 ? '#17171A' : ACCENT,
                        }}
                      >
                        {p}
                      </span>
                    </span>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      )
    case 'examples':
      return (
        <>
          {block.items.map((ex, i) => (
            <div key={i} className="flex flex-col gap-[3px] rounded-xl bg-page px-3.5 py-3">
              {ex.tag && <span className="text-[11px] font-bold text-subtle">{ex.tag}</span>}
              <Starred text={ex.sentence} className="text-sm leading-[1.45]" />
              {ex.translation && <span className="text-xs text-subtle">{ex.translation}</span>}
            </div>
          ))}
        </>
      )
    case 'compare':
      return (
        <div className="grid grid-cols-2 gap-1.5">
          {block.cols.map((c, i) => (
            <div key={i} className="flex flex-col gap-1.5 rounded-xl p-2.5" style={{ background: TONE[c.tone].bg }}>
              <span className="text-xs font-extrabold" style={{ color: TONE[c.tone].fg }}>
                {c.title}
              </span>
              {c.lines.map((l, j) => (
                <span key={j} className="border-t pt-1.5 text-xs leading-[1.4]" style={{ borderColor: TONE[c.tone].line }}>
                  {l}
                </span>
              ))}
            </div>
          ))}
        </div>
      )
    case 'signals':
      return (
        <>
          {block.groups.map((g, i) => (
            <div key={i} className="flex flex-col gap-1.5">
              <span className="text-xs font-bold" style={{ color: TONE[g.tone].fg }}>
                {g.title}
              </span>
              <div className="flex flex-wrap gap-[5px]">
                {g.words.map((w, j) => (
                  <span key={j} className="rounded-full px-2.5 py-[5px] text-[13px] font-semibold" style={{ background: TONE[g.tone].bg }}>
                    {w}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </>
      )
    case 'mistake':
      return (
        <div className="flex flex-col gap-2 rounded-xl px-3.5 py-3" style={{ background: 'rgba(245,51,63,0.07)' }}>
          <div className="flex items-start gap-2">
            <span className="flex size-[18px] flex-none items-center justify-center rounded-full text-[10px] font-extrabold text-white" style={{ background: RED }}>
              ✕
            </span>
            <span className="text-[13px] text-subtle line-through">{block.wrong}</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="flex size-[18px] flex-none items-center justify-center rounded-full text-[10px] font-extrabold text-white" style={{ background: GREEN }}>
              ✓
            </span>
            <span className="text-sm font-bold">{block.right}</span>
          </div>
          {block.why && (
            <span className="border-t pt-2 text-xs text-subtle" style={{ borderColor: 'rgba(245,51,63,0.15)' }}>
              {block.why}
            </span>
          )}
        </div>
      )
    case 'check':
      return (
        <div className="flex flex-col gap-2 rounded-xl border-[1.5px] border-dashed border-line-strong p-3">
          <span className="text-[10px] font-extrabold tracking-[.05em] uppercase" style={{ color: ACCENT }}>
            Quick check · not graded
          </span>
          <span className="text-sm font-bold">{block.question}</span>
          <div className="flex flex-wrap gap-1.5">
            {block.options.map((o, i) => (
              <span key={i} className="min-w-[90px] flex-1 rounded-[10px] border-[1.5px] border-line-strong py-2 text-center text-[13px] font-bold">
                {o || '…'}
              </span>
            ))}
          </div>
        </div>
      )
  }
}

export function PhonePreview({
  card,
  index,
  count,
  lessonTitle,
  locale,
}: {
  card: CardForm | null
  index: number
  count: number
  lessonTitle: string
  locale: string
}) {
  const last = index === count - 1
  const isVocab = card?.kind === 'vocab'
  const label = card ? (card.kind === 'grammar' ? card.label : lessonTitle || 'Vocabulary') : ''
  const labelColor = card?.kind === 'grammar' && card.label === 'Common mistake' ? RED : ACCENT

  return (
    <div className="sticky top-5 flex flex-[0_0_320px] flex-col items-center gap-2.5">
      <span className="text-xs font-extrabold tracking-[.05em] text-subtle uppercase">App preview · {locale}</span>
      <div className="h-[650px] w-80 rounded-[44px] bg-[#1B1B1D] p-[9px]">
        <div className="flex size-full flex-col overflow-hidden rounded-[36px] bg-white text-ink">
          <div className="flex flex-none items-center gap-2.5 px-4 pt-[34px] pb-2">
            <div className="flex flex-1 gap-[3px]">
              {Array.from({ length: Math.max(count, 1) }, (_, i) => (
                <span key={i} className="h-1 flex-1 rounded-sm" style={{ background: i <= index ? ACCENT : '#E4E4E7' }} />
              ))}
            </div>
            <span className="text-xs font-bold text-subtle tabular-nums">
              {count ? index + 1 : 0}/{count}
            </span>
          </div>

          <div className="flex flex-auto flex-col gap-3.5 overflow-y-auto px-[18px] pt-2.5 pb-3.5">
            {!card ? (
              <span className="mt-10 text-center text-sm text-subtle">No content yet</span>
            ) : (
              <>
                <span className="text-[11px] font-extrabold tracking-[.05em] uppercase" style={{ color: labelColor }}>
                  {label}
                </span>
                {card.kind === 'grammar' ? (
                  <div className="flex flex-col gap-3.5">
                    <h2 className="m-0 text-[21px] leading-[1.25] font-extrabold tracking-[-0.01em]">
                      {card.heading || 'Heading'}
                    </h2>
                    {card.blocks.map((b, i) => (
                      <div key={i} className="flex flex-col gap-2">
                        <Block block={toGrammarBlock(b)} />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col gap-3 rounded-[20px] border border-line px-[18px] py-5 shadow-[0_8px_24px_rgba(0,0,0,0.07)]">
                    {card.imageUrl && (
                      <div className="-mx-1.5 -mt-2.5 aspect-[16/10] overflow-hidden rounded-xl bg-line-strong">
                        <img src={card.imageUrl} alt="" className="size-full object-cover" />
                      </div>
                    )}
                    <div className="flex items-start justify-between gap-2.5">
                      <div className="flex min-w-0 flex-col gap-1">
                        <span className="text-[28px] font-extrabold tracking-[-0.02em]">{card.word || 'word'}</span>
                        <span className="text-[13px] text-subtle">{[card.ipa, card.pos].filter(Boolean).join(' · ')}</span>
                      </div>
                      <span className="flex size-10 flex-none items-center justify-center rounded-full" style={{ background: 'rgba(242,113,28,0.1)', color: ACCENT }}>
                        <Volume2 size={18} />
                      </span>
                    </div>
                    <span className="text-[15px] font-bold">{card.meaning || 'Meaning'}</span>
                    <Starred text={card.example || 'Example with the *word*.'} className="border-t border-line pt-2.5 text-[13px] leading-normal" />
                  </div>
                )}
              </>
            )}
          </div>

          <div className="flex flex-none gap-2 px-4 pt-2.5 pb-6">
            {isVocab ? (
              <span className="flex h-11 flex-1 items-center justify-center rounded-xl border-[1.5px] border-line-strong text-[13px] font-bold">
                Still learning
              </span>
            ) : (
              index > 0 && (
                <span className="flex h-11 w-20 items-center justify-center rounded-xl border-[1.5px] border-line-strong text-[13px] font-bold">
                  Back
                </span>
              )
            )}
            <span className="flex h-11 flex-1 items-center justify-center rounded-xl text-[13px] font-bold text-white" style={{ background: ACCENT }}>
              {last ? 'Finish' : isVocab ? 'Got it' : 'Next'}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

