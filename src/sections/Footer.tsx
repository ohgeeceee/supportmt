import MicroLabel from '@/components/MicroLabel'
import { scrollToId } from '@/lib/lenis'

const NAV = [
  { label: 'Mission', id: 'mission' },
  { label: 'Programs', id: 'programs' },
  { label: 'Impact', id: 'impact' },
  { label: 'Story', id: 'story' },
  { label: 'Donate', id: 'donate' },
]

export default function Footer() {
  return (
    <footer className="overflow-hidden bg-ink px-5 pb-10 pt-[70px] text-paper md:px-12 md:pt-[110px]">
      <p
        aria-hidden="true"
        className="select-none whitespace-nowrap text-center font-display text-[clamp(3.5rem,16.5vw,19rem)] font-light leading-[0.85] tracking-[-0.02em]"
      >
        SUPPORTMT
      </p>

      <div className="mt-16 grid gap-10 border-t border-paper/20 pt-10 md:grid-cols-3">
        <div>
          <MicroLabel tone="paper">CONTACT</MicroLabel>
          <a href="mailto:hello@supportmt.com" className="u-link mt-4 inline-block text-sm">
            hello@supportmt.com
          </a>
          <p className="mt-2 text-sm text-paper/60">supportmt.com</p>
        </div>

        <div>
          <MicroLabel tone="paper">EXPLORE</MicroLabel>
          <nav className="mt-4 flex flex-col items-start gap-2" aria-label="Footer">
            {NAV.map((link) => (
              <a
                key={link.id}
                href={`#${link.id}`}
                onClick={(e) => {
                  e.preventDefault()
                  scrollToId(link.id)
                }}
                className="u-link text-sm text-paper/80 transition-colors hover:text-paper"
              >
                {link.label}
              </a>
            ))}
          </nav>
        </div>

        <div>
          <MicroLabel tone="paper">LEGAL</MicroLabel>
          <p className="mt-4 text-sm text-paper/60">© 2026 SupportMT — design preview.</p>
          <p className="mt-2 text-sm leading-relaxed text-paper/60">
            SupportMT is a community project currently in development.
          </p>
        </div>
      </div>

      <p className="mt-16 text-[10px] font-semibold uppercase tracking-[0.25em] text-paper/40">
        Made in Montana
      </p>
    </footer>
  )
}
