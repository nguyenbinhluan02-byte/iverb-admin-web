import { Headphones, Shield, Type, User, Users } from 'lucide-react'
import type { FilterOption } from '@/components/FilterDropdown'
import { TYPE_ICONS } from '@/components/typeIcons'
import { TYPE_LABELS } from '@/lib/question'
import type { QType } from '@/services/questions'
import type { SourceFilter, TypeFilter } from './filter'

// Option icon tints from the design (ICC / ICB).
export const GREEN_TINT = { iconColor: 'var(--color-green-text)', iconBg: 'rgba(31,169,113,.12)' }
export const ORANGE_TINT = { iconColor: 'var(--color-brand-deep)', iconBg: 'rgba(242,113,28,.12)' }
const TYPE_TINT = { iconColor: 'var(--color-brand-deep)', iconBg: 'rgba(242,113,28,.1)' }

export function sourceOptions(counts?: Record<SourceFilter, number>): FilterOption<SourceFilter>[] {
  return [
    { value: 'all', label: 'Anyone', icon: Users, count: counts?.all },
    {
      value: 'admin',
      label: 'Admins',
      icon: Shield,
      count: counts?.admin,
      iconColor: 'var(--color-ink)',
    },
    {
      value: 'user',
      label: 'Users',
      icon: User,
      count: counts?.user,
      iconColor: 'var(--color-blue-text)',
      iconBg: 'rgba(91,108,240,.12)',
    },
  ]
}

export function typeOptions(): FilterOption<TypeFilter>[] {
  return [
    { value: 'all', label: 'All', icon: Type },
    ...(Object.keys(TYPE_LABELS) as QType[]).map((t) => ({
      value: t,
      label: TYPE_LABELS[t],
      icon: TYPE_ICONS[t],
      ...TYPE_TINT,
    })),
    // design: any question with audio
    { value: 'listen', label: 'All listening', icon: Headphones, ...TYPE_TINT },
  ]
}
