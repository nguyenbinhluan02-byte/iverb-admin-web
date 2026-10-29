import { X } from 'lucide-react'
import { Dialog } from 'radix-ui'
import type { ReactNode } from 'react'

// Design: Modals — overlay rgba(23,23,26,.45), white card radius 18.
export function Modal({
  open,
  onClose,
  maxWidth,
  maxHeight,
  children,
}: {
  open: boolean
  onClose: () => void
  maxWidth: number
  maxHeight?: number
  children: ReactNode
}) {
  return (
    <Dialog.Root open={open} onOpenChange={(next) => !next && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(23,23,26,.45)] p-6">
          <Dialog.Content
            aria-describedby={undefined}
            className="flex w-full flex-col overflow-hidden rounded-[18px] bg-card shadow-modal outline-none"
            style={{ maxWidth, maxHeight: maxHeight ? `min(${maxHeight}px, 100%)` : undefined }}
          >
            {children}
          </Dialog.Content>
        </Dialog.Overlay>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

export const ModalTitle = Dialog.Title

export function ModalClose() {
  return (
    <Dialog.Close
      title="Close"
      className="flex size-[34px] shrink-0 items-center justify-center rounded-[9px] bg-page text-ink"
    >
      <X size={16} strokeWidth={2.4} />
    </Dialog.Close>
  )
}
