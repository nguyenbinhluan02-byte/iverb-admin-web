import type { ReactNode } from 'react'
import { typeLabel } from '@/lib/question'
import type { QType, QuestionStatus } from '@/services/questions'
import { TONES, type Tone } from './badgeStyles'
import { TypeIcon } from './TypeIcon'

export function Badge({ tone, children }: { tone: Tone; children: ReactNode }) {
  return (
    <span
      className={`inline-flex items-center gap-[5px] rounded-full px-[9px] py-[3px] text-[11px] font-extrabold whitespace-nowrap ${TONES[tone]}`}
    >
      {children}
    </span>
  )
}

export function TypeBadge({
  type,
  listening,
  withIcon,
}: {
  type: QType
  listening?: boolean
  withIcon?: boolean
}) {
  return (
    <Badge tone="brand">
      {withIcon && <TypeIcon type={type} listening={listening} size={12} />}
      {typeLabel(type, listening)}
    </Badge>
  )
}

const STATUS: Record<QuestionStatus, [string, Tone]> = {
  published: ['Published', 'grey'],
  live: ['Live today', 'brand'],
  scheduled: ['Scheduled', 'green'],
  draft: ['Draft', 'grey'],
  unscheduled: ['Not scheduled', 'grey'],
}

export function StatusBadge({ status }: { status: QuestionStatus }) {
  const [label, tone] = STATUS[status]
  return <Badge tone={tone}>{label}</Badge>
}

export function UserSubmittedBadge() {
  return <Badge tone="blue">User submitted</Badge>
}
