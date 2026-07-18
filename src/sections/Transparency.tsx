import MicroLabel from '@/components/MicroLabel'

const SEGMENTS = [
  { count: 92, className: 'bg-gold', label: '92¢ — Programs' },
  { count: 5, className: 'bg-pine', label: '5¢ — Operations' },
  { count: 3, className: 'bg-blush', label: '3¢ — Fundraising' },
]

export default function Transparency() {
  return (
    <section className="px-5 py-[50px] md:px-12 md:py-[100px]">
      <MicroLabel>06 — TRANSPARENCY</MicroLabel>

      <div className="mt-10 flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
        <h2 className="font-display text-3xl font-light leading-[1.08] tracking-[-0.02em] md:text-5xl">
          Where every dollar goes.
        </h2>
        <p className="max-w-sm text-sm leading-relaxed text-ink/70">
          We pledge radical transparency: audited financials published every spring, and no
          executive earns more than 3× our lowest-paid staff.
        </p>
      </div>

      {/* 100-unit segmented bar */}
      <div className="mt-12 flex h-10 w-full gap-[3px] md:h-12" role="img" aria-label="Spending breakdown: 92 cents programs, 5 cents operations, 3 cents fundraising">
        {SEGMENTS.flatMap((seg) =>
          Array.from({ length: seg.count }, (_, i) => (
            <div key={`${seg.label}-${i}`} className={`h-full flex-1 ${seg.className}`} />
          )),
        )}
      </div>

      <div className="mt-6 flex flex-wrap gap-x-10 gap-y-3">
        {SEGMENTS.map((seg) => (
          <span key={seg.label} className="flex items-center gap-3">
            <span className={`inline-block h-3 w-3 ${seg.className}`} aria-hidden="true" />
            <span className="text-[11px] font-semibold uppercase tracking-[0.15em] text-ink/70">
              {seg.label}
            </span>
          </span>
        ))}
      </div>
    </section>
  )
}
