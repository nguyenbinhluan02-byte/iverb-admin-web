import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Navigate, useLocation } from 'react-router'
import { z } from 'zod'
import { useAuth } from '@/auth/useAuth'
import { Button } from '@/components/Button'
import { errorMessage } from '@/lib/errors'

const schema = z.object({
  email: z.email('Enter a valid email.'),
  password: z.string().min(1, 'Enter your password.'),
})
type Values = z.infer<typeof schema>

const fieldClass =
  'h-11 w-full rounded-xl border border-line-strong bg-card px-3.5 text-[15px] font-semibold'

export function LoginPage() {
  const { status, error: meError, retry, signIn, signOut } = useAuth()
  const location = useLocation()
  const [error, setError] = useState<string | null>(null)
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<Values>({ resolver: zodResolver(schema) })

  if (status === 'admin') {
    const from = (location.state as { from?: string } | null)?.from
    return <Navigate to={from && from !== '/login' ? from : '/today'} replace />
  }

  const onSubmit = handleSubmit(async ({ email, password }) => {
    setError(null)
    try {
      await signIn(email, password)
    } catch (e) {
      setError(errorMessage(e))
    }
  })

  return (
    <div className="flex min-h-screen items-center justify-center bg-page p-4">
      <div className="w-full max-w-[380px] rounded-[18px] border border-line bg-card p-8">
        <div className="flex items-center gap-2.5">
          <span className="flex size-8 items-center justify-center rounded-[9px] bg-brand text-[15px] font-extrabold text-white">
            Q
          </span>
          <span className="flex flex-col leading-[1.2]">
            <span className="text-[15px] font-extrabold">IVerbs Admin</span>
            <span className="text-xs text-muted">English daily quiz</span>
          </span>
        </div>
        <h1 className="mt-7 text-xl font-extrabold">Sign in</h1>

        {status === 'error' ? (
          <div className="mt-4 flex flex-col gap-4">
            <p
              role="alert"
              className="rounded-xl bg-[rgba(245,51,63,.1)] px-3.5 py-3 text-sm font-semibold text-red-text"
            >
              Signed in, but your profile could not be loaded: {errorMessage(meError)}
            </p>
            <Button onClick={retry}>Try again</Button>
            <Button variant="secondary" onClick={signOut}>
              Use another account
            </Button>
          </div>
        ) : status === 'not-admin' ? (
          <div className="mt-4 flex flex-col gap-4">
            <p className="rounded-xl bg-[rgba(245,51,63,.1)] px-3.5 py-3 text-sm font-semibold text-red-text">
              {errorMessage(new Error('not_admin'))}
            </p>
            <Button variant="secondary" onClick={signOut}>
              Use another account
            </Button>
          </div>
        ) : (
          <form onSubmit={onSubmit} className="mt-4 flex flex-col gap-3.5" noValidate>
            <label className="flex flex-col gap-1.5">
              <span className="text-[13px] font-bold">Email</span>
              <input
                type="email"
                autoComplete="email"
                className={fieldClass}
                {...register('email')}
              />
              {errors.email && (
                <span className="text-xs font-semibold text-red-text">{errors.email.message}</span>
              )}
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="text-[13px] font-bold">Password</span>
              <input
                type="password"
                autoComplete="current-password"
                className={fieldClass}
                {...register('password')}
              />
              {errors.password && (
                <span className="text-xs font-semibold text-red-text">
                  {errors.password.message}
                </span>
              )}
            </label>
            {error && <p className="text-sm font-semibold text-red-text">{error}</p>}
            <Button type="submit" disabled={isSubmitting || status === 'loading'} className="mt-1">
              {isSubmitting ? 'Signing in…' : 'Sign in'}
            </Button>
          </form>
        )}
      </div>
    </div>
  )
}
