import type { UseStatus } from '@/services/questions'

export type Tone = 'brand' | 'green' | 'grey' | 'blue' | 'pending' | 'red'

export const TONES: Record<Tone, string> = {
  brand: 'bg-[rgba(242,113,28,.1)] text-brand-deep',
  green: 'bg-[rgba(31,169,113,.12)] text-green-text',
  grey: 'bg-page text-muted',
  blue: 'bg-[rgba(91,108,240,.12)] text-blue-text',
  pending: 'bg-brand-tint text-brand-deeper',
  red: 'bg-[rgba(245,51,63,.1)] text-red-text',
}

export const USE_STATUS: Record<UseStatus, { label: string; tone: Tone; dot: string }> = {
  shown: { label: 'Shown', tone: 'grey', dot: 'var(--color-disabled)' },
  live: { label: 'Live today', tone: 'brand', dot: 'var(--color-ink)' },
  scheduled: { label: 'Scheduled', tone: 'green', dot: 'var(--color-brand)' },
  draft: { label: 'Draft', tone: 'grey', dot: 'var(--color-brand-light)' },
}
