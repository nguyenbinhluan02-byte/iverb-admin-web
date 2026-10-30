import { zodResolver } from '@hookform/resolvers/zod'
import { Bell, Send } from 'lucide-react'
import { useState, type ReactNode } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { toast } from 'sonner'
import { Badge } from '@/components/Badge'
import type { Tone } from '@/components/badgeStyles'
import { Button } from '@/components/Button'
import { Modal, ModalTitle } from '@/components/Modal'
import { PageHeader } from '@/components/PageHeader'
import { timeAgo } from '@/features/today/todayModel'
import { errorMessage } from '@/lib/errors'
import { usePushes, useSendPush, type Push, type PushStatus } from '@/services/pushes'
import {
  BODY_MAX,
  pushErrorMessage,
  pushSchema,
  TITLE_MAX,
  type PushValues,
} from './notificationsModel'

const field =
  'w-full rounded-[11px] border border-line-strong bg-card px-3.5 py-3 text-[15px] text-ink disabled:bg-page disabled:text-muted'
const label = 'text-[13px] font-extrabold'

const STATUS: Record<PushStatus, [string, Tone]> = {
  sent: ['Sent', 'green'],
  failed: ['Failed', 'red'],
  sending: ['Sending', 'grey'],
}

// No design: built from the existing cards / form fields (TASK-018).
export function NotificationsPage() {
  const send = useSendPush()
  const [confirming, setConfirming] = useState<{ title: string; body: string } | null>(null)
  const { register, control, handleSubmit, reset, formState } = useForm<PushValues>({
    resolver: zodResolver(pushSchema),
    mode: 'onChange',
    defaultValues: { title: '', body: '' },
  })
  const title = useWatch({ control, name: 'title' }) ?? ''
  const body = useWatch({ control, name: 'body' }) ?? ''

  const confirmSend = async () => {
    if (!confirming) return
    try {
      await send.mutateAsync(confirming)
      toast.success('Notification sent')
      setConfirming(null)
      reset()
    } catch (e) {
      toast.error(pushErrorMessage(e))
    }
  }

  return (
    <div className="mx-auto flex max-w-[1240px] flex-col gap-[22px]">
      <PageHeader kicker="To app users" title="Notifications" />

      <div className="grid grid-cols-[repeat(auto-fit,minmax(380px,1fr))] items-start gap-[18px]">
        <form
          onSubmit={handleSubmit((v) => setConfirming({ title: v.title, body: v.body }))}
          className="flex flex-col gap-5 rounded-[18px] border border-line bg-card px-6 py-[22px]"
        >
          <h2 className="text-base font-extrabold">New notification</h2>
          <label className="flex flex-col gap-2">
            <span className="flex items-center justify-between gap-2">
              <span className={label}>Title</span>
              <Counter value={title} max={TITLE_MAX} />
            </span>
            <input placeholder="New quiz is live!" className={field} {...register('title')} />
          </label>
          <label className="flex flex-col gap-2">
            <span className="flex items-center justify-between gap-2">
              <span className={label}>Message</span>
              <Counter value={body} max={BODY_MAX} />
            </span>
            <textarea
              rows={4}
              placeholder="Today's question is about past participles. Can you get it right?"
              className={`${field} resize-y leading-[1.45]`}
              {...register('body')}
            />
          </label>

          <div className="flex flex-col gap-2">
            <span className={label}>Preview</span>
            <PhonePreview title={title.trim()} body={body.trim()} />
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3">
            <span className="max-w-[340px] text-xs leading-normal text-muted">
              Goes to every Android device with the app that has not turned off News &amp;
              announcements.
            </span>
            <Button type="submit" disabled={!formState.isValid || send.isPending}>
              <Send size={16} />
              Send to all users
            </Button>
          </div>
        </form>

        <History />
      </div>

      <Modal
        open={!!confirming}
        onClose={() => !send.isPending && setConfirming(null)}
        maxWidth={440}
      >
        {confirming && (
          <div className="flex flex-col gap-4 p-6">
            <ModalTitle className="text-lg font-extrabold">Send to all users?</ModalTitle>
            <div className="flex flex-col gap-1 rounded-xl bg-hover px-3.5 py-3">
              <b className="text-sm break-words">{confirming.title}</b>
              <span className="text-sm leading-normal break-words whitespace-pre-line">
                {confirming.body}
              </span>
            </div>
            <span className="text-[13px] leading-normal text-muted">
              This will be sent to all app users (Android). It can&apos;t be undone.
            </span>
            <div className="flex justify-end gap-2.5">
              <Button
                variant="secondary"
                disabled={send.isPending}
                onClick={() => setConfirming(null)}
              >
                Cancel
              </Button>
              <Button disabled={send.isPending} onClick={confirmSend}>
                {send.isPending ? 'Sending…' : 'Send'}
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}

function Counter({ value, max }: { value: string; max: number }) {
  const length = value.trim().length
  return (
    <span className={`text-xs font-bold ${length > max ? 'text-red-text' : 'text-muted'}`}>
      {length} / {max}
    </span>
  )
}

function PhonePreview({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-2xl bg-page p-3.5">
      <div className="flex gap-3 rounded-[14px] bg-card px-3.5 py-3 shadow-menu">
        <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-brand text-white">
          <Bell size={16} />
        </span>
        <div className="flex min-w-0 flex-col gap-0.5">
          <span className="text-[11px] font-semibold text-muted">Irregular Verbs · now</span>
          <b className="truncate text-sm">{title || 'Title'}</b>
          <span className="line-clamp-2 text-[13px] leading-snug break-words text-muted">
            {body || 'Message'}
          </span>
        </div>
      </div>
    </div>
  )
}

function History() {
  const { data: pushes, isPending, isError, error } = usePushes()
  return (
    <div className="flex flex-col gap-4 rounded-[18px] border border-line bg-card px-6 py-[22px]">
      <h2 className="text-base font-extrabold">Sent</h2>
      {isPending && <Empty>Loading…</Empty>}
      {isError && <Empty>{errorMessage(error)}</Empty>}
      {pushes && pushes.length === 0 && <Empty>No notifications sent yet.</Empty>}
      {pushes && pushes.length > 0 && (
        <ul className="flex flex-col divide-y divide-line">
          {pushes.map((p) => (
            <PushItem key={p.id} push={p} />
          ))}
        </ul>
      )}
    </div>
  )
}

function PushItem({ push: p }: { push: Push }) {
  const [statusLabel, tone] = STATUS[p.status]
  return (
    <li className="flex flex-col gap-1.5 py-3.5 first:pt-0 last:pb-0">
      <div className="flex items-start justify-between gap-3">
        <b className="min-w-0 text-sm break-words">{p.title}</b>
        <span title={p.status === 'failed' && p.error ? p.error : undefined}>
          <Badge tone={tone}>{statusLabel}</Badge>
        </span>
      </div>
      <span className="text-[13px] leading-normal break-words whitespace-pre-line text-ink">
        {p.body}
      </span>
      {p.status === 'failed' && p.error && (
        <span className="text-xs break-words text-red-text">{p.error}</span>
      )}
      <span
        className="text-xs text-muted"
        title={`${new Date(p.created_at).toISOString().slice(0, 16).replace('T', ' ')} UTC`}
      >
        {timeAgo(p.created_at)} · by {p.sent_by?.name ?? 'Admin'}
      </span>
    </li>
  )
}

function Empty({ children }: { children: ReactNode }) {
  return <div className="py-8 text-center text-sm font-semibold text-muted">{children}</div>
}
