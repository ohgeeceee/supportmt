// Production serverless endpoint (Vercel convention: /api/create-checkout-session).
// Thin adapter over the shared logic in server/checkout.ts — the Stripe secret
// key only ever lives in this server-side environment.
//
// Deploy: set STRIPE_SECRET_KEY in the host's environment variables.
// This file does not run locally; `npm run dev` uses the Vite middleware instead.
import type { IncomingMessage, ServerResponse } from 'http'
import { createCheckoutSession, resolveOrigin, CheckoutError } from '../server/checkout.js'

type VercelRequest = IncomingMessage & {
  body?: unknown
}

type VercelResponse = ServerResponse & {
  status: (code: number) => VercelResponse
  json: (payload: unknown) => void
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).json({ error: 'method_not_allowed' })
  }

  const body = (req.body ?? {}) as { amount?: unknown; frequency?: unknown }
  const proto = (req.headers['x-forwarded-proto'] as string) || 'https'
  const host = req.headers.host
  const fallbackOrigin = host ? `${proto}://${host}` : 'https://supportmt.com'

  try {
    const url = await createCheckoutSession({
      amount: body.amount,
      frequency: body.frequency,
      origin: resolveOrigin(req.headers as Record<string, string | string[] | undefined>, 3000).replace(
        /^http:\/\/localhost:3000$/,
        fallbackOrigin,
      ),
    })
    return res.status(200).json({ url })
  } catch (err) {
    if (err instanceof CheckoutError) {
      if (err.code === 'STRIPE_NOT_CONFIGURED') {
        return res.status(501).json({ error: 'stripe_not_configured' })
      }
      return res.status(err.status).json({ error: err.message })
    }
    console.error('[checkout] unexpected error', err)
    return res.status(500).json({ error: 'internal_error' })
  }
}
