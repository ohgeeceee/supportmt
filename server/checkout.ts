import Stripe from 'stripe'

export type DonationFrequency = 'one-time' | 'monthly'

export type CheckoutInput = {
  amount: unknown
  frequency: unknown
  origin: string
}

/** Error carrying an HTTP-ish status code and a stable machine-readable code. */
export class CheckoutError extends Error {
  status: number
  code: string

  constructor(status: number, code: string, message: string) {
    super(message)
    this.name = 'CheckoutError'
    this.status = status
    this.code = code
  }
}

const MIN_AMOUNT = 1
const MAX_AMOUNT = 100000

/**
 * Shared Stripe Checkout session creation used by both the Vite dev
 * middleware (vite.config.ts) and the production serverless function
 * (api/create-checkout-session.ts). Secret key stays server-side only.
 */
export async function createCheckoutSession({
  amount,
  frequency,
  origin,
}: CheckoutInput): Promise<string> {
  const dollars = typeof amount === 'number' ? amount : Number.NaN
  if (!Number.isFinite(dollars) || dollars < MIN_AMOUNT || dollars > MAX_AMOUNT) {
    throw new CheckoutError(
      400,
      'invalid_amount',
      `amount must be a number between ${MIN_AMOUNT} and ${MAX_AMOUNT} dollars`,
    )
  }
  if (frequency !== 'one-time' && frequency !== 'monthly') {
    throw new CheckoutError(400, 'invalid_frequency', "frequency must be 'one-time' or 'monthly'")
  }

  const secretKey = process.env.STRIPE_SECRET_KEY
  if (!secretKey || !secretKey.trim()) {
    throw new CheckoutError(501, 'STRIPE_NOT_CONFIGURED', 'Stripe secret key is not configured')
  }

  const stripe = new Stripe(secretKey)
  const monthly = frequency === 'monthly'
  const cleanOrigin = origin.replace(/\/+$/, '')

  const session = await stripe.checkout.sessions.create({
    mode: monthly ? 'subscription' : 'payment',
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: 'usd',
          unit_amount: Math.round(dollars * 100),
          product_data: {
            name: `SupportMT ${monthly ? 'Monthly' : 'One-time'} Donation`,
            description: 'Gift supporting Montana communities',
          },
          ...(monthly ? { recurring: { interval: 'month' as const } } : {}),
        },
      },
    ],
    success_url: `${cleanOrigin}/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${cleanOrigin}/#donate`,
    billing_address_collection: 'auto',
    ...(monthly ? {} : { payment_intent_data: { description: 'SupportMT donation' } }),
  })

  if (!session.url) {
    throw new CheckoutError(500, 'no_session_url', 'Stripe did not return a checkout URL')
  }
  return session.url
}

/**
 * Resolve the public origin for redirect URLs from request headers,
 * falling back to the local dev server.
 */
export function resolveOrigin(headers: Record<string, string | string[] | undefined>, fallbackPort: number): string {
  const raw = headers.origin ?? headers.referer
  const value = Array.isArray(raw) ? raw[0] : raw
  if (value) {
    try {
      return new URL(value).origin
    } catch {
      // fall through to localhost fallback
    }
  }
  return `http://localhost:${fallbackPort}`
}
