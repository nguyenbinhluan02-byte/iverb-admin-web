import type { AppConfig, AppConfigKey } from '@/services/appConfig'

// Design v3 "App config". The lesson ad counts lesson opens, like the app
// does. App versions (hidden until app 3.2.0 used them, TASK-045): one
// version for iOS and Android (user decision 2026-11-18).

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

/** On / off switch stored as 0 / 1 (an int rule 0–1 on the server). */
export interface ToggleField extends FieldBase {
  kind: 'toggle'
  note: (on: boolean) => string
}

/** Semver 'x.y.z' text, monospace (design v3 "App versions"). */
export interface VersionField extends FieldBase {
  kind: 'version'
  placeholder: string
}

export type ConfigField = NumberField | UrlField | ToggleField | VersionField

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
    title: 'Ads',
    sub: 'Ads shown to free users. Premium users never see them. Set 0 to turn off.',
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
        key: 'question_interstitial_every',
        label: 'On question stories',
        help: 'Shown when the user opens a past day or a saved question.',
        min: 0,
        max: 20,
        unit: plural('story', 'stories'),
        note: adNote((n) =>
          n === 1 ? 'Ad on every story opened' : `Ad on every ${ordinal(n)} story opened`,
        ),
      },
      {
        kind: 'number',
        key: 'lesson_native_ad_every',
        label: 'Inside lessons',
        help: 'An ad card between lesson cards. It does not count toward lesson progress.',
        min: 0,
        max: 20,
        unit: plural('card', 'cards'),
        note: (n) =>
          n === 0
            ? 'Off · no ad cards'
            : n === 1
              ? 'Ad card after every lesson card'
              : `Ad card after every ${n} lesson cards`,
      },
      {
        kind: 'number',
        key: 'story_native_ad_every',
        label: 'Inside question stories',
        help: 'An ad card between questions in the past-day and saved-question stories.',
        min: 0,
        max: 20,
        unit: plural('question', 'questions'),
        note: (n) =>
          n === 0
            ? 'Off · no ad cards'
            : n === 1
              ? 'Ad card after every question'
              : `Ad card after every ${n} questions`,
      },
      {
        kind: 'toggle',
        key: 'day_story_banner',
        label: 'Banner in past-day story',
        help: 'The banner under the date when a past day is opened from the week strip.',
        note: (on) => (on ? 'Shown' : 'Hidden'),
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
        kind: 'toggle',
        key: 'free_can_answer',
        label: 'Free users can answer',
        help: 'Signed-in users without premium answer daily questions like in the answer trial: answer and explanation. Ads stay.',
        note: (on) => (on ? 'On · everyone signed in' : 'Off · premium and trial only'),
      },
      {
        kind: 'toggle',
        key: 'free_can_reply',
        label: 'Free users can reply',
        help: 'Signed-in users without premium reply to answers in Community. Apps before 3.2.0 show Reply but get an error when it is off.',
        note: (on) => (on ? 'On · everyone signed in' : 'Off · premium and trial only'),
      },
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
        help: 'Cards users without premium (guests included) can open. 0 = every card, lessons open to everyone.',
        min: 0,
        max: 20,
        unit: plural('card', 'cards'),
        note: (n) =>
          n === 0
            ? 'Off · lessons open to everyone'
            : `First ${n} ${n === 1 ? 'card' : 'cards'} free, then Unlock`,
      },
    ],
  },
  {
    title: 'Notifications',
    sub: 'Pushes the server sends to one user.',
    fields: [
      {
        kind: 'number',
        key: 'reply_push_window_minutes',
        label: 'Reply push window',
        help: 'After a reply push, later replies to the same answer send no push for this long. 0 = a push for every reply.',
        min: 0,
        max: 1440,
        unit: plural('minute', 'minutes'),
        note: (n) =>
          n === 0
            ? 'A push for every reply'
            : `At most one push per answer every ${n} ${n === 1 ? 'minute' : 'minutes'}`,
      },
    ],
  },
  {
    title: 'App versions',
    sub: 'Users below the minimum version must update before using the app. One version for iOS and Android: change it when both stores have the new build.',
    fields: [
      {
        kind: 'version',
        key: 'latest_version',
        label: 'Latest version',
        help: 'Users below this see an optional “Update available” prompt, once per version. 0.0.0 = off.',
        placeholder: '3.2.0',
      },
      {
        kind: 'version',
        key: 'min_supported_version',
        label: 'Minimum version',
        help: 'Users below this must update: the app is blocked until they do. 0.0.0 = off.',
        placeholder: '3.0.0',
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

const SEMVER = /^\d{1,6}\.\d{1,6}\.\d{1,6}$/

/** -1 / 0 / 1, both 'x.y.z'. */
export const compareVersions = (a: string, b: string) => {
  const pa = a.split('.').map(Number)
  const pb = b.split('.').map(Number)
  for (let i = 0; i < 3; i++) {
    if (pa[i] !== pb[i]) return pa[i] < pb[i] ? -1 : 1
  }
  return 0
}

/** '' when valid. Same rules as the server (admin_save_app_config), which
 * also checks min ≤ latest (needs the other values). */
export function fieldError(
  field: ConfigField,
  value: AppConfig[AppConfigKey] | undefined,
  values?: Partial<AppConfig>,
): string {
  if (field.kind === 'toggle') return value === 0 || value === 1 ? '' : 'Must be on or off'
  if (field.kind === 'version') {
    if (typeof value !== 'string' || !SEMVER.test(value)) return 'Use a version like 3.2.0'
    const latest = values?.latest_version
    if (
      field.key === 'min_supported_version' &&
      typeof latest === 'string' &&
      SEMVER.test(latest) &&
      compareVersions(value, latest) > 0
    )
      return "Can't be higher than the latest version"
    return ''
  }
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
