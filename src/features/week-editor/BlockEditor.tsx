import { ChevronDown, ChevronUp, X } from 'lucide-react'
import { BLOCK_NAMES, type EditorBlock } from './editorModel'
import { LinkButton, smallInputCls } from './ui'

// One block of a grammar card (design "edBlocks").

const TONE_COLOR = { accent: '#F2711C', green: '#1FA971' } as const

function RemoveRow({ title, onClick, disabled }: { title: string; onClick: () => void; disabled?: boolean }) {
  return (
    <button
      type="button"
      title={title}
      aria-label={title}
      disabled={disabled}
      onClick={onClick}
      className="flex size-7 items-center justify-center text-subtle disabled:opacity-30"
    >
      <X size={13} strokeWidth={2.6} />
    </button>
  )
}

export function BlockEditor({
  block,
  onChange,
  onUp,
  onDown,
  onRemove,
  first,
  last,
  readOnly,
}: {
  block: EditorBlock
  onChange: (block: EditorBlock) => void
  onUp: () => void
  onDown: () => void
  onRemove: () => void
  first: boolean
  last: boolean
  readOnly: boolean
}) {
  const ro = readOnly

  const body = () => {
    switch (block.type) {
      case 'text':
      case 'tip':
        return (
          <textarea
            rows={3}
            disabled={ro}
            value={block.text}
            placeholder={block.type === 'tip' ? 'A short tip' : 'Write a short explanation'}
            onChange={(e) => onChange({ ...block, text: e.target.value })}
            className={`${smallInputCls} resize-y text-sm leading-normal`}
          />
        )

      case 'formula':
        return (
          <>
            {block.rows.map((row, i) => (
              <div key={i} className="grid grid-cols-[150px_minmax(0,1fr)_28px] items-center gap-2">
                <input
                  disabled={ro}
                  value={row.label}
                  placeholder="Row label"
                  onChange={(e) =>
                    onChange({ ...block, rows: block.rows.map((r, j) => (j === i ? { ...r, label: e.target.value } : r)) })
                  }
                  className={`${smallInputCls} font-bold`}
                />
                <input
                  disabled={ro}
                  value={row.text}
                  placeholder="S + have / has + V3 + …"
                  onChange={(e) =>
                    onChange({ ...block, rows: block.rows.map((r, j) => (j === i ? { ...r, text: e.target.value } : r)) })
                  }
                  className={`${smallInputCls} font-mono`}
                />
                <RemoveRow
                  title="Remove row"
                  disabled={ro || block.rows.length <= 1}
                  onClick={() => onChange({ ...block, rows: block.rows.filter((_, j) => j !== i) })}
                />
              </div>
            ))}
            {!ro && block.rows.length < 4 && (
              <LinkButton onClick={() => onChange({ ...block, rows: [...block.rows, { label: '', text: '' }] })}>
                + Add row
              </LinkButton>
            )}
            <span className="text-xs text-subtle">
              Separate parts with “+”. The first part is the subject; “…” shows as a muted ending.
            </span>
          </>
        )

      case 'examples':
        return (
          <>
            {block.items.map((item, i) => (
              <div
                key={i}
                className="grid grid-cols-[140px_minmax(0,1fr)_28px] items-center gap-2 rounded-xl border border-page bg-[#FAFAFA] p-2.5"
              >
                <input
                  disabled={ro}
                  value={item.tag}
                  placeholder="Context tag"
                  onChange={(e) =>
                    onChange({ ...block, items: block.items.map((x, j) => (j === i ? { ...x, tag: e.target.value } : x)) })
                  }
                  className={smallInputCls}
                />
                <input
                  disabled={ro}
                  value={item.sentence}
                  placeholder="I *went* to Huế last year."
                  onChange={(e) =>
                    onChange({
                      ...block,
                      items: block.items.map((x, j) => (j === i ? { ...x, sentence: e.target.value } : x)),
                    })
                  }
                  className={`${smallInputCls} text-sm`}
                />
                <RemoveRow
                  title="Remove example"
                  disabled={ro || block.items.length <= 1}
                  onClick={() => onChange({ ...block, items: block.items.filter((_, j) => j !== i) })}
                />
              </div>
            ))}
            {!ro && block.items.length < 4 && (
              <LinkButton onClick={() => onChange({ ...block, items: [...block.items, { tag: '', sentence: '' }] })}>
                + Add example
              </LinkButton>
            )}
            <span className="text-xs text-subtle">Wrap the key words in *stars* to highlight them.</span>
          </>
        )

      case 'compare':
        return (
          <div className="grid grid-cols-2 gap-2.5">
            {block.cols.map((col, i) => (
              <div key={i} className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    title="Switch color"
                    disabled={ro}
                    onClick={() =>
                      onChange({
                        ...block,
                        cols: block.cols.map((c, j) =>
                          j === i ? { ...c, tone: c.tone === 'accent' ? 'green' : 'accent' } : c,
                        ),
                      })
                    }
                    className="size-2.5 flex-none rounded-full"
                    style={{ background: TONE_COLOR[col.tone] }}
                  />
                  <input
                    disabled={ro}
                    value={col.title}
                    placeholder="Column title"
                    onChange={(e) =>
                      onChange({ ...block, cols: block.cols.map((c, j) => (j === i ? { ...c, title: e.target.value } : c)) })
                    }
                    className={`${smallInputCls} font-bold`}
                  />
                </div>
                <textarea
                  rows={4}
                  disabled={ro}
                  value={col.lines}
                  placeholder="One line per row"
                  onChange={(e) =>
                    onChange({ ...block, cols: block.cols.map((c, j) => (j === i ? { ...c, lines: e.target.value } : c)) })
                  }
                  className={`${smallInputCls} resize-y leading-normal`}
                />
              </div>
            ))}
          </div>
        )

      case 'signals':
        return (
          <>
            {block.groups.map((g, i) => (
              <div key={i} className="grid grid-cols-[28px_150px_minmax(0,1fr)_28px] items-center gap-2">
                <button
                  type="button"
                  title="Switch color"
                  disabled={ro}
                  onClick={() =>
                    onChange({
                      ...block,
                      groups: block.groups.map((x, j) =>
                        j === i ? { ...x, tone: x.tone === 'accent' ? 'green' : 'accent' } : x,
                      ),
                    })
                  }
                  className="flex size-7 items-center justify-center rounded-lg border border-line-strong bg-card"
                >
                  <span className="size-3 rounded-full" style={{ background: TONE_COLOR[g.tone] }} />
                </button>
                <input
                  disabled={ro}
                  value={g.title}
                  placeholder="Group title"
                  onChange={(e) =>
                    onChange({ ...block, groups: block.groups.map((x, j) => (j === i ? { ...x, title: e.target.value } : x)) })
                  }
                  className={`${smallInputCls} font-bold`}
                />
                <input
                  disabled={ro}
                  value={g.words}
                  placeholder="ever, never, already, yet"
                  onChange={(e) =>
                    onChange({ ...block, groups: block.groups.map((x, j) => (j === i ? { ...x, words: e.target.value } : x)) })
                  }
                  className={smallInputCls}
                />
                <RemoveRow
                  title="Remove group"
                  disabled={ro || block.groups.length <= 1}
                  onClick={() => onChange({ ...block, groups: block.groups.filter((_, j) => j !== i) })}
                />
              </div>
            ))}
            {!ro && block.groups.length < 3 && (
              <LinkButton
                onClick={() =>
                  onChange({ ...block, groups: [...block.groups, { title: '', tone: 'green', words: '' }] })
                }
              >
                + Add group
              </LinkButton>
            )}
          </>
        )

      case 'mistake':
        return (
          <>
            <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,200px),1fr))] gap-2.5">
              <label className="flex flex-col gap-1.5">
                <span className="text-xs font-bold text-[#D42A35]">Wrong</span>
                <input
                  disabled={ro}
                  value={block.wrong}
                  placeholder="I have seen him yesterday."
                  onChange={(e) => onChange({ ...block, wrong: e.target.value })}
                  className={`${smallInputCls} text-sm`}
                />
              </label>
              <label className="flex flex-col gap-1.5">
                <span className="text-xs font-bold text-[#138A5B]">Right</span>
                <input
                  disabled={ro}
                  value={block.right}
                  placeholder="I saw him yesterday."
                  onChange={(e) => onChange({ ...block, right: e.target.value })}
                  className={`${smallInputCls} text-sm`}
                />
              </label>
            </div>
            <label className="flex flex-col gap-1.5">
              <span className="text-xs font-bold text-muted">Why (optional)</span>
              <input
                disabled={ro}
                value={block.why}
                placeholder="Short reason"
                onChange={(e) => onChange({ ...block, why: e.target.value })}
                className={smallInputCls}
              />
            </label>
          </>
        )

      case 'check':
        return (
          <>
            <input
              disabled={ro}
              value={block.question}
              placeholder="Question"
              onChange={(e) => onChange({ ...block, question: e.target.value })}
              className={`${smallInputCls} text-sm font-bold`}
            />
            {block.options.map((opt, i) => (
              <div key={i} className="grid grid-cols-[28px_minmax(0,1fr)_28px] items-center gap-2">
                <button
                  type="button"
                  title="Mark as correct"
                  disabled={ro}
                  onClick={() => onChange({ ...block, correct: i })}
                  className="flex size-[22px] items-center justify-center rounded-full border-2"
                  style={{ borderColor: block.correct === i ? '#1FA971' : '#D4D4D8' }}
                >
                  {block.correct === i && <span className="size-2.5 rounded-full bg-green" />}
                </button>
                <input
                  disabled={ro}
                  value={opt}
                  placeholder="Option"
                  onChange={(e) =>
                    onChange({ ...block, options: block.options.map((o, j) => (j === i ? e.target.value : o)) })
                  }
                  className={`${smallInputCls} text-sm`}
                />
                <RemoveRow
                  title="Remove option"
                  disabled={ro || block.options.length <= 2}
                  onClick={() =>
                    onChange({
                      ...block,
                      options: block.options.filter((_, j) => j !== i),
                      correct: block.correct === i ? 0 : block.correct > i ? block.correct - 1 : block.correct,
                    })
                  }
                />
              </div>
            ))}
            {!ro && block.options.length < 4 && (
              <LinkButton onClick={() => onChange({ ...block, options: [...block.options, ''] })}>+ Add option</LinkButton>
            )}
            <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,200px),1fr))] gap-2.5">
              <label className="flex flex-col gap-1.5">
                <span className="text-xs font-bold text-[#138A5B]">If right</span>
                <input
                  disabled={ro}
                  value={block.ok}
                  onChange={(e) => onChange({ ...block, ok: e.target.value })}
                  className={smallInputCls}
                />
              </label>
              <label className="flex flex-col gap-1.5">
                <span className="text-xs font-bold text-[#D42A35]">If wrong</span>
                <input
                  disabled={ro}
                  value={block.bad}
                  onChange={(e) => onChange({ ...block, bad: e.target.value })}
                  className={smallInputCls}
                />
              </label>
            </div>
          </>
        )
    }
  }

  const tool = 'flex size-7 items-center justify-center rounded-[7px] bg-page disabled:opacity-30'

  return (
    <div className="flex flex-col rounded-2xl border border-line bg-card">
      <div className="flex items-center gap-2 border-b border-page py-2.5 pr-3 pl-4">
        <span className="rounded-full bg-[rgba(242,113,28,0.1)] px-2 py-1 text-[11px] font-extrabold tracking-[.05em] text-brand-deep uppercase">
          {BLOCK_NAMES[block.type]}
        </span>
        <span className="flex-1" />
        {!ro && (
          <>
            <button type="button" title="Move up" aria-label="Move up" disabled={first} onClick={onUp} className={tool}>
              <ChevronUp size={13} strokeWidth={2.6} />
            </button>
            <button type="button" title="Move down" aria-label="Move down" disabled={last} onClick={onDown} className={tool}>
              <ChevronDown size={13} strokeWidth={2.6} />
            </button>
            <button type="button" title="Remove block" aria-label="Remove block" onClick={onRemove} className={`${tool} text-red`}>
              <X size={13} strokeWidth={2.6} />
            </button>
          </>
        )}
      </div>
      <div className="flex flex-col gap-2.5 px-4 pt-3.5 pb-4">{body()}</div>
    </div>
  )
}
