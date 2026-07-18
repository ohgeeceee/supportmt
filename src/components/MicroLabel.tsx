import type { ReactNode } from 'react'

type MicroLabelProps = {
  children: ReactNode
  tone?: 'ink' | 'paper'
  className?: string
}

/** Uppercase editorial micro-label — "01 — MISSION" style section metadata. */
export default function MicroLabel({ children, tone = 'ink', className = '' }: MicroLabelProps) {
  return (
    <p
      className={`font-sans text-[11px] font-semibold uppercase tracking-[0.15em] ${
        tone === 'paper' ? 'text-paper/60' : 'text-ink/60'
      } ${className}`}
    >
      {children}
    </p>
  )
}
