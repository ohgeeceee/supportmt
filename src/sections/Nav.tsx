import SwapButton from '@/components/SwapButton'
import { scrollToId, scrollToTop } from '@/lib/lenis'

const LINKS = [
  { label: 'Mission', id: 'mission' },
  { label: 'Programs', id: 'programs' },
  { label: 'Impact', id: 'impact' },
  { label: 'Story', id: 'story' },
]

export default function Nav() {
  return (
    <header className="sticky top-0 z-50 border-b border-ink bg-paper">
      <div className="flex h-16 items-center justify-between px-5 md:h-[72px] md:px-12">
        <a
          href="#top"
          onClick={(e) => {
            e.preventDefault()
            scrollToTop()
          }}
          className="font-display text-[22px] font-light leading-none tracking-[-0.02em] md:text-2xl"
        >
          SupportMT
        </a>

        <nav className="hidden items-center gap-9 md:flex" aria-label="Primary">
          {LINKS.map((link) => (
            <a
              key={link.id}
              href={`#${link.id}`}
              onClick={(e) => {
                e.preventDefault()
                scrollToId(link.id)
              }}
              className="u-link font-sans text-[11px] font-semibold uppercase tracking-[0.15em] text-ink/75 transition-colors hover:text-ink"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <SwapButton
          label="Donate"
          size="sm"
          href="#donate"
          onClick={(e) => {
            e.preventDefault()
            scrollToId('donate')
          }}
        />
      </div>
    </header>
  )
}
