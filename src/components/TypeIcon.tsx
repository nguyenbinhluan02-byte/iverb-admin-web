import { Headphones, type LucideProps } from 'lucide-react'
import type { QType } from '@/services/questions'
import { TYPE_ICONS } from './typeIcons'

/** Headphones for listening questions (design: everywhere a type is shown). */
export function TypeIcon({
  type,
  listening,
  ...props
}: { type: QType; listening?: boolean } & LucideProps) {
  const Icon = listening || type === 'dictation' ? Headphones : TYPE_ICONS[type]
  return <Icon strokeWidth={2.4} {...props} />
}
