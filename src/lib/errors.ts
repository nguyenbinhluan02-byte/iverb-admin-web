// Error codes raised by the RPCs (`raise exception '<code>'`).
const MESSAGES: Record<string, string> = {
  not_authenticated: 'Your session has expired. Please sign in again.',
  not_admin: 'This account does not have admin access.',
  not_found: 'Not found.',
  read_only: 'This question was already shown and can no longer be changed.',
  invalid_date: 'Pick a day from tomorrow on.',
  live_must_publish: "Today's question has to stay published.",
  day_taken: 'That day already has a question. Pick an empty day.',
  has_answers: 'Users already answered this question, so its answers can no longer change.',
  'Invalid login credentials': 'Wrong email or password.',
}

export function errorMessage(error: unknown): string {
  const message =
    error instanceof Error
      ? error.message
      : String((error as { message?: unknown })?.message ?? error)
  if (message.startsWith('invalid_question:'))
    return `Invalid question — ${message.slice(18).trim()}.`
  return MESSAGES[message] ?? message ?? 'Something went wrong.'
}
