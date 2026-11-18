import { ExternalLink } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/Button'
import { PageHeader } from '@/components/PageHeader'
import { errorMessage } from '@/lib/errors'
import { type AppConfig, useAppConfig, useSaveAppConfig } from '@/services/appConfig'
import {
  type ConfigField,
  type NumberField,
  type ToggleField,
  type UrlField,
  type VersionField,
  type LinesField,
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
  // Keys the server does not have yet (backend not deployed) are shown as
  // unavailable and never block saving the others.
  const hasErrors = FIELDS.some(
    (f) => saved[f.key] !== undefined && fieldError(f, values[f.key], values),
  )
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
              values={values}
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
  values,
  onChange,
}: {
  field: ConfigField
  value: number | string
  savedValue: number | string | undefined
  edited: boolean
  first: boolean
  values: AppConfig
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
      {savedValue === undefined ? (
        <span className="text-[13px] font-bold text-subtle">Not on the server yet</span>
      ) : field.kind === 'number' ? (
        <NumberControl field={field} value={Number(value)} onChange={onChange} />
      ) : field.kind === 'toggle' ? (
        <ToggleControl field={field} value={Number(value)} onChange={onChange} />
      ) : field.kind === 'lines' ? (
        <LinesControl
          field={field}
          value={String(value ?? '')}
          error={fieldError(field, value, values)}
          onChange={onChange}
        />
      ) : field.kind === 'version' ? (
        <VersionControl
          field={field}
          value={String(value ?? '')}
          error={fieldError(field, value, values)}
          onChange={onChange}
        />
      ) : (
        <UrlControl field={field} value={String(value ?? '')} onChange={onChange} />
      )}
    </div>
  )
}

function ToggleControl({
  field,
  value,
  onChange,
}: {
  field: ToggleField
  value: number
  onChange: (value: number) => void
}) {
  const on = value === 1
  return (
    <div className="flex items-center gap-2.5">
      <span className="min-w-[58px] text-right text-[13px] font-bold text-muted">
        {field.note(on)}
      </span>
      <button
        id={field.key}
        type="button"
        role="switch"
        aria-checked={on}
        aria-label={field.label}
        onClick={() => onChange(on ? 0 : 1)}
        className={`relative h-7 w-12 rounded-full transition-colors ${on ? 'bg-brand' : 'bg-line-strong'}`}
      >
        <span
          className={`absolute top-0.5 left-0 size-6 rounded-full bg-card shadow transition-transform ${
            on ? 'translate-x-[22px]' : 'translate-x-0.5'
          }`}
        />
      </button>
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

function LinesControl({
  field,
  value,
  error,
  onChange,
}: {
  field: LinesField
  value: string
  error: string
  onChange: (value: string) => void
}) {
  const count = value ? value.split('\n').length : 0
  return (
    <div className="flex max-w-[420px] flex-[1_1_300px] flex-col gap-1.5">
      <textarea
        id={field.key}
        value={value}
        rows={field.maxLines}
        placeholder={field.placeholder}
        onChange={(e) => onChange(e.target.value.replace(/\r/g, ''))}
        onBlur={() => onChange(value.split('\n').map((l) => l.trim()).filter(Boolean).join('\n'))}
        aria-invalid={!!error}
        className={`min-h-[120px] w-full resize-y rounded-[10px] border-[1.5px] bg-card px-3 py-2 text-sm leading-5 ${
          error ? 'border-red' : 'border-line-strong'
        }`}
      />
      <span className={`text-xs font-bold ${error ? 'text-red-text' : 'text-muted'}`}>
        {error || `${count}/${field.maxLines} lines · ${field.maxLength} characters each`}
      </span>
    </div>
  )
}

function VersionControl({
  field,
  value,
  error,
  onChange,
}: {
  field: VersionField
  value: string
  error: string
  onChange: (value: string) => void
}) {
  return (
    <div className="flex flex-col items-end gap-1.5">
      <input
        id={field.key}
        value={value}
        placeholder={field.placeholder}
        inputMode="decimal"
        onChange={(e) => onChange(e.target.value.trim())}
        aria-invalid={!!error}
        className={`h-10 w-[140px] rounded-[10px] border-[1.5px] bg-card px-3 text-right font-mono text-sm ${
          error ? 'border-red' : 'border-line-strong'
        }`}
      />
      {error ? (
        <span className="text-xs font-bold text-red-text">{error}</span>
      ) : (
        value === '0.0.0' && <span className="text-xs font-bold text-brand-deeper">Off</span>
      )}
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
