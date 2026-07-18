import type { MouseEvent } from 'react'

type Variant = 'light' | 'dark' | 'gold'

type SwapButtonProps = {
  label: string
  href?: string
  onClick?: (e: MouseEvent<HTMLElement>) => void
  variant?: Variant
  size?: 'sm' | 'lg'
  type?: 'button' | 'submit'
  disabled?: boolean
  className?: string
}

const VARIANTS: Record<Variant, string> = {
  light: 'bg-ink text-paper',
  dark: 'bg-paper text-ink',
  gold: 'bg-gold text-ink',
}

const SIZES = {
  sm: 'px-5 py-2.5 text-[11px]',
  lg: 'px-10 py-5 text-xs md:text-sm',
} as const

/**
 * Signature text-swap hover button: two stacked labels inside an
 * overflow-hidden mask; on hover the visible label slides up/out
 * while a duplicate slides in from below. Sharp corners, always.
 */
export default function SwapButton({
  label,
  href,
  onClick,
  variant = 'light',
  size = 'lg',
  type = 'button',
  disabled = false,
  className = '',
}: SwapButtonProps) {
  const classes = `group inline-flex items-center justify-center font-sans font-semibold uppercase tracking-[0.15em] ${VARIANTS[variant]} ${SIZES[size]} ${className} disabled:cursor-not-allowed disabled:opacity-70`

  const inner = (
    <span className="relative block overflow-hidden">
      <span className="swap-label block group-hover:-translate-y-[115%]">
        {label}
      </span>
      <span
        aria-hidden="true"
        className="swap-label absolute inset-0 block translate-y-[115%] group-hover:translate-y-0"
      >
        {label}
      </span>
    </span>
  )

  if (href) {
    return (
      <a href={href} onClick={onClick} className={classes}>
        {inner}
      </a>
    )
  }

  return (
    <button type={type} onClick={onClick} disabled={disabled} className={classes}>
      {inner}
    </button>
  )
}
