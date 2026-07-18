import { Link, useSearchParams } from 'react-router'
import Checkmark from '@/components/Checkmark'
import MicroLabel from '@/components/MicroLabel'
import SwapButton from '@/components/SwapButton'

export default function Success() {
  // Stripe appends ?session_id={CHECKOUT_SESSION_ID} — read it so the route
  // contract is explicit, but never display it.
  const [params] = useSearchParams()
  void params.get('session_id')

  return (
    <div className="flex min-h-screen flex-col bg-paper text-ink">
      <main className="flex flex-1 items-center px-5 py-[60px] md:px-12">
        <div className="mx-auto w-full max-w-2xl">
          <Checkmark />
          <MicroLabel className="mt-10">DONATION RECEIVED</MicroLabel>
          <h1 className="mt-6 font-display text-[clamp(2.6rem,6vw,5rem)] font-light leading-[1.02] tracking-[-0.02em]">
            Thank you, neighbor.
          </h1>
          <p className="mt-6 max-w-md leading-relaxed text-ink/70">
            Your gift is on its way to Montana communities. A receipt is headed to your email.
          </p>
          <Link to="/" className="mt-12 inline-block">
            <SwapButton label="Back to supportmt.com →" variant="light" />
          </Link>
        </div>
      </main>
    </div>
  )
}
