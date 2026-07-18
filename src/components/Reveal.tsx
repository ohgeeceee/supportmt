import { useEffect, useRef, type ReactNode } from 'react'
import { gsap } from '@/lib/motion'

type RevealProps = {
  children: ReactNode
  delay?: number
  className?: string
}

/**
 * Scroll-driven line reveal: content slides up inside an overflow-hidden
 * mask when it enters the viewport. Plays once, then leaves the DOM clean.
 */
export default function Reveal({ children, delay = 0, className = '' }: RevealProps) {
  const outerRef = useRef<HTMLSpanElement>(null)
  const innerRef = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        innerRef.current,
        { yPercent: 115 },
        {
          yPercent: 0,
          duration: 1.1,
          delay,
          ease: 'power4.out',
          scrollTrigger: { trigger: outerRef.current, start: 'top 88%', once: true },
        },
      )
    }, outerRef)
    return () => ctx.revert()
  }, [delay])

  return (
    <span ref={outerRef} className={`block overflow-hidden ${className}`}>
      <span ref={innerRef} className="block will-change-transform">
        {children}
      </span>
    </span>
  )
}
