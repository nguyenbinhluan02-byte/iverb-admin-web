import { ArrowUpDown, CircleDot, NotebookPen, SquareCheck, Type } from 'lucide-react'

export const TYPE_ICONS = {
  single: CircleDot,
  multi: SquareCheck,
  fill: Type,
  order: ArrowUpDown,
  dictation: NotebookPen,
} as const
