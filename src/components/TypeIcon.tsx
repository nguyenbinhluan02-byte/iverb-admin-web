import type { LucideProps } from 'lucide-react'
import type { QType } from '@/services/questions'
import { TYPE_ICONS } from './typeIcons'

export function TypeIcon({ type, ...props }: { type: QType } & LucideProps) {
  const Icon = TYPE_ICONS[type]
  return <Icon strokeWidth={2.4} {...props} />
}
