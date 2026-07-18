import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import Contour from '@/components/Contour'
import MicroLabel from '@/components/MicroLabel'
import { gsap } from '@/lib/motion'

const WORDS = ['WILDFIRE RELIEF', 'RURAL FAMILIES', 'FOOD SECURITY', 'MONTANA']
const CYCLE_MS = 2800

export default function Hero() {
  const [index, setIndex] = useState(0)
  const [prev, setPrev] = useState<number | null>(null)
  const rootRef = useRef<HTMLElement>(null)

  // word cycler — swap every ~2.8s
  useEffect(() => {
    const id = window.setInterval(() => {
      setPrev(index)
      setIndex((index + 1) % WORDS.length)
    }, CYCLE_MS)
    return () => window.clearInterval(id)
  }, [index])

  // entrance: headline line slides up in its mask, metadata fades in after
  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        '[data-hero-line]',
        { yPercent: 115 },
        { yPercent: 0, duration: 1.25, stagger: 0.14, ease: 'power4.out', delay: 0.2 },
      )
      gsap.fromTo(
        '[data-hero-fade]',
        { opacity: 0 },
        { opacity: 1, duration: 1.1, stagger: 0.12, ease: 'power2.out', delay: 0.75 },
      )
    }, rootRef)
    return () => ctx.revert()
  }, [])

  return (
    <section ref={rootRef} className="relative flex min-h-svh flex-col overflow-hidden">
      <Contour
        className="pointer-events-none absolute inset-0 h-full w-full text-ink opacity-[0.12]"
        rings={6}
        drift
        seed={2}
      />

      <div className="relative z-10 flex flex-1 flex-col justify-center px-5 pb-28 pt-20 md:px-12">
        <div data-hero-fade>
          <MicroLabel>A MONTANA COMMUNITY FUND · EST. 2026</MicroLabel>
        </div>

        <h1 className="mt-8 font-display font-light leading-[0.98] tracking-[-0.02em]">
          <span className="block overflow-hidden">
            <span data-hero-line className="block text-[clamp(2.8rem,9vw,8rem)]">
              WE SUPPORT
            </span>
          </span>

          {/* cycling word — vertical slide inside an overflow-hidden mask */}
          <span className="relative block overflow-hidden pb-[0.1em] text-[clamp(2rem,8vw,7.25rem)]">
            {prev !== null && (
              <span
                key={`out-${index}`}
                aria-hidden="true"
                className="cycle-out absolute left-0 top-0 block whitespace-nowrap"
              >
                {WORDS[prev]}
              </span>
            )}
            <span key={`in-${index}`} className="cycle-in relative block whitespace-nowrap">
              <span className="relative inline-block">
                <span
                  aria-hidden="true"
                  className="marker-swipe absolute inset-x-[-0.04em] inset-y-[0.06em] bg-gold"
                />
                <span className="relative">{WORDS[index]}</span>
              </span>
            </span>
          </span>
        </h1>

        <p data-hero-fade className="mt-10 max-w-md text-base leading-relaxed text-ink/75 md:text-lg">
          A community-resilience fund moving money, crews, and supplies to Montana neighbors facing
          wildfire, hardship, and hunger — in all 56 counties.
        </p>
      </div>

      <div
        data-hero-fade
        className="absolute bottom-8 left-5 z-10 flex flex-col items-start gap-3 md:left-12"
      >
        <MicroLabel>SCROLL</MicroLabel>
        <span className="scroll-cue-line block h-14 w-px bg-ink" />
      </div>
    </section>
  )
}
