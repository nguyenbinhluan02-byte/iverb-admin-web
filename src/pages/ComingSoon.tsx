import { PageHeader } from '@/components/PageHeader'

// Placeholder until the screen's task is done (see docs/tasks).
export function ComingSoon({
  kicker,
  title,
  task,
}: {
  kicker: string
  title: string
  task: string
}) {
  return (
    <div className="mx-auto max-w-[1040px]">
      <PageHeader kicker={kicker} title={title} />
      <div className="mt-6 rounded-2xl border border-line bg-card px-5 py-10 text-center text-sm font-semibold text-muted">
        Coming in {task}.
      </div>
    </div>
  )
}
