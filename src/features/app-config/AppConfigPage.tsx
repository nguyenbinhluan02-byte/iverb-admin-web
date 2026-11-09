import { ExternalLink } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/Button'
import { PageHeader } from '@/components/PageHeader'
import { errorMessage } from '@/lib/errors'
import { type AppConfig, useAppConfig, useSaveAppConfig } from '@/services/appConfig'
import {
  type ConfigField,
  type NumberField,
  type UrlField,
  FIELDS,
  GROUPS,
  clamp,
  fieldError,
  parseNumberInput,
  saveLabel,
} from './appConfigModel'
import { appConfigDraft, useAppConfigDraft } from './draftStore'

// Design v3 "App config": edits private.app_config; the app reads it on next launch.
export function AppConfigPage() {
  const { data: saved, isLoading, error } = useAppConfig()
  const draft = useAppConfigDraft()
  const save = useSaveAppConfig()

  if (isLoading) return <div className="p-8 text-sm text-muted">Loading…</div>
  if (error || !saved) return <div className="p-8 text-sm text-muted">{errorMessage(error)}</div>

  const values: AppConfig = { ...saved, ...draft }
  const changed = FIELDS.filter((f) => f.key in draft)
  const hasErrors = FIELDS.some((f) => fieldError(f, values[f.key]))
  const canSave = changed.length > 0 && !hasErrors && !save.isPending

  const onSave = async () => {
    if (!canSave) return
    try {
      await save.mutateAsync(draft)
      appConfigDraft.clear()
      toast.success('App config saved')
    } catch (e) {
      toast.error(errorMessage(e))
    }
  }

  return (
    <div className="mx-auto flex max-w-[880px] flex-col gap-5">
      <PageHeader
        kicker="Applies to all users on next app launch"
        title="App config"
        actions={
          <div className="flex items-center gap-2">
            {changed.length > 0 && (
              <Button variant="secondary" onClick={appConfigDraft.clear} disabled={save.isPending}>
                Discard
              </Button>
            )}
            <Button onClick={onSave} disabled={!canSave}>
              {save.isPending ? 'Saving…' : saveLabel(changed.length, hasErrors)}
            </Button>
          </div>
        }
      />

      {GROUPS.map((group) => (
        <section
          key={group.title}
          className="overflow-hidden rounded-2xl border border-line bg-card"
        >
          <div className="flex flex-col gap-0.5 border-b border-line px-5 py-4">
            <h2 className="text-base font-extrabold">{group.title}</h2>
            <p className="text-[13px] text-pretty text-muted">{group.sub}</p>
          </div>
          {group.fields.map((field, i) => (
            <FieldRow
              key={field.key}
              field={field}
              value={values[field.key]}
              savedValue={saved[field.key]}
              edited={field.key in draft}
              first={i === 0}
              onChange={(v) => appConfigDraft.set(field.key, v as never, saved)}
            />
          ))}
        </section>
      ))}
    </div>
  )
}

function FieldRow({
  field,
  value,
  savedValue,
  edited,
  first,
  onChange,
}: {
  field: ConfigField
  value: number | string
  savedValue: number | string
  edited: boolean
  first: boolean
  onChange: (value: number | string) => void
}) {
  return (
    <div
      className={`flex flex-wrap items-center justify-between gap-x-6 gap-y-3 px-5 py-4 ${
        first ? '' : 'border-t border-line'
      } ${edited ? 'bg-brand/[0.04]' : ''}`}
    >
      <div className="flex min-w-0 flex-[1_1_280px] flex-col gap-[3px]">
        <span className="flex flex-wrap items-center gap-2">
          <label htmlFor={field.key} className="text-sm font-extrabold">
            {field.label}
          </label>
          {edited && (
            <span className="rounded-full bg-brand-tint px-2 py-0.5 text-[11px] font-extrabold text-brand-deeper">
              Edited · was {String(savedValue)}
            </span>
          )}
        </span>
        <span className="text-[13px] text-pretty text-muted">{field.help}</span>
        <span className="font-mono text-[11px] text-subtle">{field.key}</span>
      </div>
      {field.kind === 'number' ? (
        <NumberControl field={field} value={Number(value)} onChange={onChange} />
      ) : (
        <UrlControl field={field} value={String(value ?? '')} onChange={onChange} />
      )}
    </div>
  )
}

function NumberControl({
  field,
  value,
  onChange,
}: {
  field: NumberField
  value: number
  onChange: (value: number) => void
}) {
  const step = (d: number) => onChange(clamp(value + d, field.min, field.max))
  return (
    <div className="flex flex-col items-end gap-1.5">
      <div className="flex items-center gap-2.5">
        <div className="flex items-center overflow-hidden rounded-[10px] border border-line-strong bg-card">
          <button
            type="button"
            aria-label={`Decrease ${field.label}`}
            onClick={() => step(-1)}
            disabled={value <= field.min}
            className="size-10 text-lg font-bold text-ink disabled:text-disabled"
          >
            −
          </button>
          <input
            id={field.key}
            inputMode="numeric"
            value={String(value)}
            onChange={(e) => onChange(parseNumberInput(e.target.value, field))}
            className="h-10 w-[52px] border-x border-line bg-transparent text-center text-[15px] font-extrabold"
          />
          <button
            type="button"
            aria-label={`Increase ${field.label}`}
            onClick={() => step(1)}
            disabled={value >= field.max}
            className="size-10 text-lg font-bold text-ink disabled:text-disabled"
          >
            +
          </button>
        </div>
        <span className="min-w-[58px] text-[13px] font-bold text-muted">{field.unit(value)}</span>
      </div>
      <span className={`text-xs font-bold ${value === 0 ? 'text-brand-deeper' : 'text-muted'}`}>
        {field.note(value)}
      </span>
    </div>
  )
}

function UrlControl({
  field,
  value,
  onChange,
}: {
  field: UrlField
  value: string
  onChange: (value: string) => void
}) {
  const error = fieldError(field, value)
  return (
    <div className="flex max-w-[420px] flex-[1_1_300px] flex-col gap-1.5">
      <div className="flex items-center gap-2">
        <input
          id={field.key}
          value={value}
          placeholder={field.placeholder}
          onChange={(e) => onChange(e.target.value.trim())}
          aria-invalid={!!error}
          className={`h-10 min-w-0 flex-1 rounded-[10px] border-[1.5px] bg-card px-3 text-sm ${
            error ? 'border-red' : 'border-line-strong'
          }`}
        />
        {!error && (
          <a
            href={value}
            target="_blank"
            rel="noopener noreferrer"
            title="Open link"
            aria-label={`Open ${field.label}`}
            className="flex size-10 flex-none items-center justify-center rounded-[10px] border border-line-strong text-muted hover:bg-hover hover:text-ink"
          >
            <ExternalLink size={16} />
          </a>
        )}
      </div>
      {error && <span className="text-xs font-bold text-red-text">{error}</span>}
    </div>
  )
}
