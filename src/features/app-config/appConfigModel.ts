import type { AppConfig, AppConfigKey } from '@/services/appConfig'

// Design v3 "App config". Decided with the user (2026-11-09): the App versions
// group is hidden (the app does not use those keys yet); the lesson ad counts
// lesson opens, like the app does.

interface FieldBase {
  key: AppConfigKey
  label: string
  help: string
}

export interface NumberField extends FieldBase {
  kind: 'number'
  min: number
  max: number
  unit: (n: number) => string
  note: (n: number) => string
}

export interface UrlField extends FieldBase {
  kind: 'url'
  placeholder: string
}

export type ConfigField = NumberField | UrlField

export interface ConfigGroup {
  title: string
  sub: string
  fields: ConfigField[]
}

export const ordinal = (n: number) => {
  const tens = n % 100
  if (tens >= 11 && tens <= 13) return `${n}th`
  return `${n}${({ 1: 'st', 2: 'nd', 3: 'rd' } as Record<number, string>)[n % 10] ?? 'th'}`
}

const plural = (one: string, many: string) => (n: number) => (n === 1 ? one : many)

const adNote = (every: (n: number) => string) => (n: number) =>
  n === 0 ? 'Off · no full-screen ads' : every(n)

export const GROUPS: ConfigGroup[] = [
  {
    title: 'Full-screen ads',
    sub: 'Interstitial ads shown to free users. Premium users never see them. Set 0 to turn off.',
    fields: [
      {
        kind: 'number',
        key: 'lesson_interstitial_every',
        label: 'On lessons',
        help: 'Shown when the user opens a lesson.',
        min: 0,
        max: 20,
        unit: plural('lesson', 'lessons'),
        note: adNote((n) =>
          n === 1 ? 'Ad on every lesson opened' : `Ad on every ${ordinal(n)} lesson opened`,
        ),
      },
      {
        kind: 'number',
        key: 'verb_detail_interstitial_every',
        label: 'After verb details',
        help: 'Shown when the user closes a verb detail screen.',
        min: 0,
        max: 50,
        unit: plural('verb', 'verbs'),
        note: adNote((n) =>
          n === 1 ? 'Ad after every verb detail' : `Ad after every ${ordinal(n)} verb detail`,
        ),
      },
    ],
  },
  {
    title: 'Free trial & preview',
    sub: 'What new and free users can access before upgrading.',
    fields: [
      {
        kind: 'number',
        key: 'answer_trial_days',
        label: 'Answer trial',
        help: 'Days a new user can see answers and explanations for free.',
        min: 0,
        max: 365,
        unit: plural('day', 'days'),
        note: (n) => (n === 0 ? 'No trial' : `Ends ${n} ${n === 1 ? 'day' : 'days'} after sign-up`),
      },
      {
        kind: 'number',
        key: 'lesson_preview_cards',
        label: 'Lesson preview',
        help: 'Cards a free user can open in a locked lesson.',
        min: 0,
        max: 20,
        unit: plural('card', 'cards'),
        note: (n) =>
          n === 0 ? 'Lessons fully locked' : `First ${n} ${n === 1 ? 'card' : 'cards'} free`,
      },
    ],
  },
  {
    title: 'Legal links',
    sub: 'Opened from Settings and the sign-up screen.',
    fields: [
      {
        kind: 'url',
        key: 'privacy_url',
        label: 'Privacy policy',
        help: 'Public page with the privacy policy.',
        placeholder: 'https://',
      },
      {
        kind: 'url',
        key: 'terms_url',
        label: 'Terms of use',
        help: 'Public page with the terms of use.',
        placeholder: 'https://',
      },
    ],
  },
]

export const FIELDS: ConfigField[] = GROUPS.flatMap((g) => g.fields)

export const clamp = (n: number, min: number, max: number) => Math.max(min, Math.min(max, n))

/** Design: typing keeps digits only, empty → 0, then clamps to the range. */
export const parseNumberInput = (text: string, field: NumberField) => {
  const n = parseInt(text.replace(/\D/g, ''), 10)
  return clamp(Number.isNaN(n) ? 0 : n, field.min, field.max)
}

/** '' when valid. Same rule as the server (admin_save_app_config). */
export function fieldError(field: ConfigField, value: AppConfig[AppConfigKey] | undefined): string {
  if (field.kind === 'url')
    return typeof value === 'string' && /^https:\/\/\S+\.\S+$/.test(value)
      ? ''
      : 'Must be a full https:// link'
  return typeof value === 'number' &&
    Number.isInteger(value) &&
    value >= field.min &&
    value <= field.max
    ? ''
    : `Use a number from ${field.min} to ${field.max}`
}

export function saveLabel(changed: number, hasErrors: boolean) {
  if (!changed) return 'Saved'
  if (hasErrors) return 'Fix errors to save'
  return `Save ${changed} ${changed === 1 ? 'change' : 'changes'}`
}
