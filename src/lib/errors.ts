// Error codes raised by the RPCs (`raise exception '<code>'`).
const MESSAGES: Record<string, string> = {
  not_authenticated: 'Your session has expired. Please sign in again.',
  not_admin: 'This account does not have admin access.',
  not_found: 'Not found.',
  'Invalid login credentials': 'Wrong email or password.',
}

export function errorMessage(error: unknown): string {
  const message =
    error instanceof Error
      ? error.message
      : String((error as { message?: unknown })?.message ?? error)
  return MESSAGES[message] ?? message ?? 'Something went wrong.'
}
