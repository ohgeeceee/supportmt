import MicroLabel from '@/components/MicroLabel'
import Reveal from '@/components/Reveal'

export default function Mission() {
  return (
    <section id="mission" className="border-t border-ink px-5 py-[50px] md:px-12 md:py-[100px]">
      <MicroLabel>01 — MISSION</MicroLabel>

      <h2 className="mt-10 max-w-5xl font-display text-[clamp(1.85rem,4vw,3.5rem)] font-light leading-[1.14] tracking-[-0.02em]">
        <Reveal>
          When a neighbor is in trouble, <span className="hl">Montana shows up.</span>
        </Reveal>
        <Reveal delay={0.12}>
          We move money, crews, and supplies across all <span className="hl">56 counties</span> —
          fast, local, and without red tape.
        </Reveal>
      </h2>

      <Reveal delay={0.2} className="mt-12 max-w-xl">
        <p className="text-base leading-relaxed text-ink/70 md:text-lg">
          SupportMT is a community-resilience fund. We fund wildfire relief and recovery, stand
          behind rural families, keep food on tables, and keep roofs over heads — raised here, spent
          here.
        </p>
      </Reveal>
    </section>
  )
}
