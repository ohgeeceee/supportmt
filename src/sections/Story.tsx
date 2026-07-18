import Contour from '@/components/Contour'
import MicroLabel from '@/components/MicroLabel'
import Reveal from '@/components/Reveal'

export default function Story() {
  return (
    <section
      id="story"
      className="relative overflow-hidden bg-ink px-5 py-[50px] text-paper md:px-12 md:py-[100px]"
    >
      <Contour
        className="pointer-events-none absolute inset-0 h-full w-full text-paper opacity-[0.08]"
        rings={7}
        animated={false}
        seed={5}
      />

      <div className="relative z-10 max-w-4xl">
        <MicroLabel tone="paper">05 — STORY</MicroLabel>

        <div className="mt-10 border-t border-paper/30 pt-10">
          <Reveal>
            <blockquote className="font-display text-[clamp(1.8rem,4vw,3.4rem)] font-light leading-[1.15] tracking-[-0.02em]">
              “When the fire took the barn, SupportMT had a crew here before the smoke cleared.”
            </blockquote>
          </Reveal>
          <p className="mt-8 text-[11px] font-semibold uppercase tracking-[0.15em] text-paper/60">
            — THE NOOK FAMILY, PARADISE VALLEY
          </p>
          <p className="mt-6 max-w-xl leading-relaxed text-paper/70">
            The Nooks lost a barn, two miles of fence line, and forty acres of grazing grass in the
            Porcupine Fire. A SupportMT rapid-response grant covered lumber and crew wages within
            the week — and neighbors framed the new barn in nine days.
          </p>
        </div>
      </div>
    </section>
  )
}
