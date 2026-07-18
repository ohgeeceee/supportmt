import { useState, type FormEvent } from 'react'
import Checkmark from '@/components/Checkmark'
import MicroLabel from '@/components/MicroLabel'
import Reveal from '@/components/Reveal'
import SwapButton from '@/components/SwapButton'

type Frequency = 'once' | 'monthly'
type Amount = 25 | 50 | 100 | 250 | 'custom'

const AMOUNTS: Amount[] = [25, 50, 100, 250, 'custom']

const IMPACT: Record<string, string> = {
  '25': 'fills a gas tank so a ranch hand can get to work',
  '50': "puts a week of groceries on a family's table",
  '100': 'covers a night of emergency lodging after a wildfire evacuation',
  '250': 'helps rebuild a fence line burned in a fire',
}

const TRUST_ROWS = [
  { k: 'TRANSPARENCY', v: 'Every gift receipted and reported' },
  { k: 'SECURITY', v: 'Encrypted, secure checkout' },
  { k: 'FLEXIBILITY', v: 'Cancel a monthly gift anytime' },
]

function TickGlyph() {
  return (
    <svg
      viewBox="0 0 16 16"
      className="mt-[6px] h-4 w-4 shrink-0"
      fill="none"
      aria-hidden="true"
    >
      <path d="M2.5 8.5 L6.5 12.5 L13.5 3.5" stroke="#1D6151" strokeWidth="2.5" />
    </svg>
  )
}

function ThankYou({
  amount,
  monthly,
  onReset,
}: {
  amount: number | null
  monthly: boolean
  onReset: () => void
}) {
  const amountText = amount ? `$${amount.toLocaleString('en-US')}` : null
  const message = amountText
    ? monthly
      ? `Thank you — your ${amountText} monthly gift is pledged.`
      : `Thank you — your ${amountText} gift is pledged.`
    : 'Thank you — your gift is pledged.'

  return (
    <div className="border border-paper/20 p-6 md:p-9">
      {/* self-drawing checkmark */}
      <Checkmark />

      <h3 className="mt-8 font-display text-2xl font-light leading-snug tracking-[-0.01em] md:text-[2rem]">
        {message}
      </h3>
      <p className="mt-5 text-sm leading-relaxed text-paper/60">
        Stripe isn't connected yet — add your keys to <code>.env</code> to accept live donations.
      </p>
      <button
        type="button"
        onClick={onReset}
        className="u-link mt-8 text-[11px] font-semibold uppercase tracking-[0.15em] text-paper/80 transition-colors hover:text-paper"
      >
        ← Change amount
      </button>
    </div>
  )
}

export default function Donate() {
  const [frequency, setFrequency] = useState<Frequency>('monthly')
  const [amount, setAmount] = useState<Amount>(50)
  const [custom, setCustom] = useState('')
  const [pledged, setPledged] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const monthly = frequency === 'monthly'
  const parsed = Number.parseInt(custom, 10)
  const effectiveAmount =
    amount === 'custom' ? (Number.isFinite(parsed) && parsed >= 1 ? parsed : null) : amount

  const donateLabel = loading
    ? 'Redirecting…'
    : effectiveAmount
      ? `Donate $${effectiveAmount.toLocaleString('en-US')}${monthly ? '/mo' : ''} →`
      : 'Donate →'

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (loading) return
    if (effectiveAmount == null) {
      setError('Please enter an amount of at least $1.')
      return
    }
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: effectiveAmount,
          frequency: monthly ? 'monthly' : 'one-time',
        }),
      })
      const data = (await res.json().catch(() => ({}))) as { url?: string; error?: string }
      if (res.ok && data.url) {
        window.location.href = data.url
        return
      }
      if (res.status === 501 || data.error === 'stripe_not_configured') {
        // Stripe keys not configured yet — fall back to the demo thank-you panel.
        setPledged(true)
        return
      }
      setError('Something went wrong — please try again.')
    } catch {
      setError('Something went wrong — please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <section id="donate" className="bg-ink px-5 py-[50px] text-paper md:px-12 md:py-[100px]">
      <div className="grid gap-14 lg:grid-cols-2 lg:gap-24">
        {/* left — pitch + trust ledger */}
        <div>
          <MicroLabel tone="paper">02 — GIVE</MicroLabel>
          <h2 className="mt-8 font-display text-[clamp(2.2rem,4.5vw,4.25rem)] font-light leading-[1.04] tracking-[-0.02em]">
            <Reveal>Every dollar stays</Reveal>
            <Reveal delay={0.1}>in Montana.</Reveal>
          </h2>
          <p className="mt-6 max-w-md leading-relaxed text-paper/70">
            No national overhead, no black-box fund. Gifts go to vetted local partners and directly
            to families — and every grant is published.
          </p>

          <ul className="mt-12 border-b border-paper/20">
            {TRUST_ROWS.map((row) => (
              <li
                key={row.k}
                className="flex items-baseline justify-between gap-6 border-t border-paper/20 py-4"
              >
                <span className="shrink-0 text-[11px] font-semibold uppercase tracking-[0.15em] text-paper/50">
                  {row.k}
                </span>
                <span className="text-right text-sm text-paper/85">{row.v}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* right — hand-built donation widget */}
        <div>
          {pledged ? (
            <ThankYou
              amount={effectiveAmount}
              monthly={monthly}
              onReset={() => setPledged(false)}
            />
          ) : (
            <form onSubmit={handleSubmit} className="border border-paper/20 p-6 md:p-9">
              <MicroLabel tone="paper">FREQUENCY</MicroLabel>
              <div className="mt-4 grid grid-cols-2 border border-paper/25">
                {(['once', 'monthly'] as const).map((f) => (
                  <button
                    key={f}
                    type="button"
                    onClick={() => setFrequency(f)}
                    aria-pressed={frequency === f}
                    className={`py-3.5 text-[11px] font-semibold uppercase tracking-[0.15em] transition-colors duration-200 ${
                      frequency === f ? 'bg-gold text-ink' : 'text-paper/60 hover:text-paper'
                    }`}
                  >
                    {f === 'once' ? 'One-time' : 'Monthly'}
                  </button>
                ))}
              </div>
              <p className="mt-3 h-4 text-[11px] font-semibold uppercase tracking-[0.15em] text-gold">
                {monthly ? '×12 the impact — monthly gifts sustain long recoveries' : ''}
              </p>

              <MicroLabel tone="paper" className="mt-7">
                AMOUNT
              </MicroLabel>
              <div className="mt-4 grid grid-cols-3 gap-2 sm:grid-cols-5">
                {AMOUNTS.map((a) => (
                  <button
                    key={String(a)}
                    type="button"
                    onClick={() => setAmount(a)}
                    aria-pressed={amount === a}
                    className={`border py-3.5 text-sm font-semibold transition-colors duration-200 ${
                      amount === a
                        ? 'border-gold bg-gold text-ink'
                        : 'border-paper/25 text-paper/80 hover:border-paper/60'
                    }`}
                  >
                    {a === 'custom' ? 'Custom' : `$${a}`}
                  </button>
                ))}
              </div>

              {amount === 'custom' && (
                <div className="mt-5 flex items-baseline gap-2 border-b border-paper/40 pb-2 transition-colors focus-within:border-gold">
                  <span className="font-display text-2xl text-paper/60">$</span>
                  <input
                    type="number"
                    min={1}
                    value={custom}
                    onChange={(e) => setCustom(e.target.value)}
                    placeholder="75"
                    aria-label="Custom amount in dollars"
                    className="w-full bg-transparent font-display text-2xl text-paper [appearance:textfield] placeholder:text-paper/30 focus:outline-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                  />
                </div>
              )}

              {/* impact line — updates with the selected amount */}
              <div className="mt-7 flex items-start gap-3 border-t border-paper/20 pt-6">
                <TickGlyph />
                <p className="font-display text-lg font-light leading-snug md:text-xl">
                  {amount === 'custom' ? (
                    'Every dollar is put to work in Montana communities.'
                  ) : (
                    <>
                      <span className="text-gold">${amount}</span> {IMPACT[String(amount)]}.
                    </>
                  )}
                </p>
              </div>

              <SwapButton
                type="submit"
                variant="gold"
                label={donateLabel}
                disabled={loading}
                className="mt-8 w-full"
              />
              {error && (
                <p role="alert" className="mt-4 text-[13px] leading-relaxed text-[#F07568]">
                  {error}
                </p>
              )}
            </form>
          )}
        </div>
      </div>
    </section>
  )
}
