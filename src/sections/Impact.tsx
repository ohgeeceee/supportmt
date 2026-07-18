import { useEffect, useRef } from 'react'
import MicroLabel from '@/components/MicroLabel'
import { gsap } from '@/lib/motion'

const money = (n: number) => `$${n.toFixed(1)}M`
const whole = (n: number) => `${Math.round(n)}`
const cents = (n: number) => `${Math.round(n)}¢`
const thousands = (n: number) => Math.round(n).toLocaleString('en-US')

function Stat({
  value,
  format,
  label,
}: {
  value: number
  format: (n: number) => string
  label: string
}) {
  const wrapRef = useRef<HTMLDivElement>(null)
  const numRef = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      const counter = { n: 0 }
      gsap.to(counter, {
        n: value,
        duration: 1.8,
        ease: 'power3.out',
        scrollTrigger: { trigger: wrapRef.current, start: 'top 85%', once: true },
        onUpdate: () => {
          if (numRef.current) numRef.current.textContent = format(counter.n)
        },
      })
    }, wrapRef)
    return () => ctx.revert()
  }, [value, format])

  return (
    <div ref={wrapRef} className="px-6 py-10 md:py-14">
      <span
        ref={numRef}
        className="font-display text-5xl font-light tracking-[-0.02em] md:text-[3.4rem]"
      >
        {format(0)}
      </span>
      <p className="mt-4 text-[11px] font-semibold uppercase tracking-[0.15em] text-ink/60">
        {label}
      </p>
    </div>
  )
}

export default function Impact() {
  return (
    <section id="impact" className="px-5 py-[50px] md:px-12 md:py-[100px]">
      <MicroLabel>03 — IMPACT</MicroLabel>

      <div className="mt-10 grid grid-cols-1 divide-y divide-ink border-y border-ink md:grid-cols-4 md:divide-x md:divide-y-0">
        <Stat value={1.2} format={money} label="Distributed to 3,400 Montana households" />
        <Stat value={56} format={whole} label="Counties served" />
        <Stat value={92} format={cents} label="Of every $1 goes to programs" />
        <Stat value={1850} format={thousands} label="Volunteers on call" />
      </div>
    </section>
  )
}
