import { useMemo, type MouseEvent, type ReactNode } from 'react'
import MicroLabel from '@/components/MicroLabel'
import Reveal from '@/components/Reveal'
import { useInView } from '@/hooks/useInView'
import { scrollToId } from '@/lib/lenis'

type Pt = [number, number]

/** One wavy ridge line across the scene — sampled sines smoothed by Catmull-Rom. */
function ridge(y0: number, amp: number, phase: number, seed: number): string {
  const N = 36
  const pts: Pt[] = []
  for (let i = 0; i <= N; i++) {
    const x = (i / N) * 800
    const y =
      y0 - Math.abs(Math.sin(i * 0.5 + phase)) * amp - Math.sin(i * 0.83 + seed) * amp * 0.22
    pts.push([x, y])
  }
  let d = `M ${pts[0][0].toFixed(1)} ${pts[0][1].toFixed(1)}`
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[Math.max(i - 1, 0)]
    const p1 = pts[i]
    const p2 = pts[i + 1]
    const p3 = pts[Math.min(i + 2, pts.length - 1)]
    const c1x = p1[0] + (p2[0] - p0[0]) / 6
    const c1y = p1[1] + (p2[1] - p0[1]) / 6
    const c2x = p2[0] - (p3[0] - p1[0]) / 6
    const c2y = p2[1] - (p3[1] - p1[1]) / 6
    d += ` C ${c1x.toFixed(1)} ${c1y.toFixed(1)} ${c2x.toFixed(1)} ${c2y.toFixed(1)} ${p2[0].toFixed(1)} ${p2[1].toFixed(1)}`
  }
  return d
}

/** Featured-program scene: golden sun disc over drawn ridge lines. */
function RidgeScene() {
  const { ref, inView } = useInView<HTMLDivElement>(0.3)
  const ridges = useMemo(
    () => [
      ridge(295, 118, 0.4, 2),
      ridge(360, 100, 1.7, 5),
      ridge(422, 82, 3.1, 9),
      ridge(472, 58, 4.4, 13),
    ],
    [],
  )

  return (
    <div ref={ref} className="border border-ink">
      <svg viewBox="0 0 800 520" className="block h-auto w-full" fill="none" aria-hidden="true">
        <circle cx="596" cy="118" r="72" className="fill-gold" />
        {ridges.map((d, i) => (
          <path
            key={i}
            d={d}
            pathLength={1}
            strokeWidth="1"
            className={inView ? 'contour-anim stroke-ink' : 'stroke-ink opacity-0'}
            style={inView ? { animationDelay: `${0.15 + i * 0.18}s` } : undefined}
          />
        ))}
      </svg>
    </div>
  )
}

function SupportLink() {
  function handleClick(e: MouseEvent<HTMLAnchorElement>) {
    e.preventDefault()
    scrollToId('donate')
  }
  return (
    <a
      href="#donate"
      onClick={handleClick}
      className="u-link mt-6 inline-block text-[11px] font-semibold uppercase tracking-[0.15em] text-pine"
    >
      Support this program →
    </a>
  )
}

function ProgramEntry({
  label,
  title,
  desc,
  glyph,
}: {
  label: string
  title: string
  desc: string
  glyph: ReactNode
}) {
  return (
    <article className="border-t border-ink pt-6">
      <div className="flex items-start gap-5">
        <div className="mt-1 shrink-0">{glyph}</div>
        <div>
          <MicroLabel>{label}</MicroLabel>
          <h4 className="mt-2 font-display text-2xl font-light tracking-[-0.02em]">{title}</h4>
          <p className="mt-3 text-sm leading-relaxed text-ink/70">{desc}</p>
          <SupportLink />
        </div>
      </div>
    </article>
  )
}

/* --- small 1px-stroke pine glyphs, all code-drawn --- */

function BarnGlyph() {
  return (
    <svg viewBox="0 0 40 40" className="h-10 w-10" fill="none" stroke="#1D6151" strokeWidth="1.5" aria-hidden="true">
      <path d="M7 34 V17 L20 6 L33 17 V34" />
      <path d="M7 20 H33" />
      <path d="M16 34 V25 H24 V34" />
    </svg>
  )
}

function WheatGlyph() {
  return (
    <svg viewBox="0 0 40 40" className="h-10 w-10" fill="none" stroke="#1D6151" strokeWidth="1.5" aria-hidden="true">
      <path d="M20 36 V12" />
      <path d="M20 12 C15.5 10.5 13.5 7 13.5 3.5 C17.5 4.5 19.5 8 20 12" />
      <path d="M20 12 C24.5 10.5 26.5 7 26.5 3.5 C22.5 4.5 20.5 8 20 12" />
      <path d="M20 20 C15.5 18.5 13.5 15 13.5 11.5 C17.5 12.5 19.5 16 20 20" />
      <path d="M20 20 C24.5 18.5 26.5 15 26.5 11.5 C22.5 12.5 20.5 16 20 20" />
      <path d="M20 28 C15.5 26.5 13.5 23 13.5 19.5 C17.5 20.5 19.5 24 20 28" />
      <path d="M20 28 C24.5 26.5 26.5 23 26.5 19.5 C22.5 20.5 20.5 24 20 28" />
    </svg>
  )
}

function KeyGlyph() {
  return (
    <svg viewBox="0 0 40 40" className="h-10 w-10" fill="none" stroke="#1D6151" strokeWidth="1.5" aria-hidden="true">
      <circle cx="13.5" cy="13.5" r="7.5" />
      <path d="M19 19 L34 34" />
      <path d="M27 27 L32.5 21.5" />
      <path d="M31 31 L36 26" />
    </svg>
  )
}

export default function Programs() {
  return (
    <section id="programs" className="border-t border-ink px-5 py-[50px] md:px-12 md:py-[100px]">
      <MicroLabel>04 — PROGRAMS</MicroLabel>

      <h2 className="mt-10 max-w-3xl font-display text-[clamp(1.85rem,4vw,3.5rem)] font-light leading-[1.1] tracking-[-0.02em]">
        <Reveal>Four funds, one promise:</Reveal>
        <Reveal delay={0.1}>neighbors first.</Reveal>
      </h2>

      <div className="mt-14 grid gap-12 lg:grid-cols-12 lg:gap-16">
        {/* featured program — ~7 cols */}
        <article className="lg:col-span-7">
          <Reveal>
            <RidgeScene />
          </Reveal>
          <MicroLabel className="mt-8">FLAGSHIP PROGRAM</MicroLabel>
          <h3 className="mt-3 font-display text-3xl font-light tracking-[-0.02em] md:text-4xl">
            Wildfire Relief &amp; Recovery
          </h3>
          <p className="mt-4 max-w-lg leading-relaxed text-ink/70">
            When fire crosses a fence line, we move within hours — evacuation lodging, fuel cards,
            replacement tools, and rebuilding grants that keep ranch families on their land.
          </p>
          <SupportLink />
        </article>

        {/* three stacked smaller entries — ~5 cols */}
        <div className="flex flex-col gap-10 lg:col-span-5">
          <ProgramEntry
            label="DIRECT AID"
            title="Rural Family Fund"
            desc="Unrestricted cash grants for rural households facing a hard season — a medical bill, a propane tank, a blown transmission. No strings, no humiliation."
            glyph={<BarnGlyph />}
          />
          <ProgramEntry
            label="FOOD SECURITY"
            title="Food Security"
            desc="Stocking rural food pantries, funding weekend meal packs for schoolkids, and moving surplus ranch beef to families who need the protein."
            glyph={<WheatGlyph />}
          />
          <ProgramEntry
            label="HOUSING"
            title="Housing Stability"
            desc="Emergency rent, deposits, and critical repairs that keep Montanans housed through job loss, injury, or fire displacement."
            glyph={<KeyGlyph />}
          />
        </div>
      </div>
    </section>
  )
}
