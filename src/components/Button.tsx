import type { ButtonHTMLAttributes } from 'react'

type Variant = 'primary' | 'secondary'

const VARIANTS: Record<Variant, string> = {
  primary:
    'bg-brand text-white font-extrabold hover:bg-brand-hover disabled:bg-line-strong disabled:text-subtle',
  secondary:
    'bg-card text-ink font-bold border border-line-strong hover:bg-hover disabled:text-subtle',
}

export function Button({
  variant = 'primary',
  className = '',
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }) {
  return (
    <button
      {...props}
      className={`inline-flex items-center justify-center gap-2 rounded-[11px] px-[18px] py-[11px] text-sm ${VARIANTS[variant]} ${className}`}
    />
  )
}
