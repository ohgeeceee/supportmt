// Production serverless endpoint (Vercel convention: /api/stripe-webhook).
// Stripe calls this after Checkout completes: we verify the event signature
// against the raw request body, record the donation as a structured log line
// (Stripe itself remains the system of record), and send the donor a branded
// thank-you email through Resend's REST API — no extra npm dependencies.
//
// Deploy: set STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET, and RESEND_API_KEY in
// the host's environment variables. This file does not run locally.
import type { IncomingMessage, ServerResponse } from 'http'
import Stripe from 'stripe'

// @vercel/node honors this: leave the body unparsed so the exact bytes Stripe
// signed can be fed to stripe.webhooks.constructEvent.
export const config = { api: { bodyParser: false } }

type VercelRequest = IncomingMessage & {
  body?: unknown
}

type VercelResponse = ServerResponse & {
  status: (code: number) => VercelResponse
  json: (payload: unknown) => void
}

type DonationRecord = {
  id: string
  amount: number // dollars — session.amount_total arrives in cents
  currency: string
  frequency: 'one-time' | 'monthly'
  email: string | null
  name: string | null
  created: string
}

// Same impact mapping as the donation widget (src/sections/Donate.tsx).
const IMPACT_LINES: Record<number, string> = {
  25: 'fills a gas tank so a ranch hand can get to work',
  50: "puts a week of groceries on a family's table",
  100: 'covers a night of emergency lodging after a wildfire evacuation',
  250: 'helps rebuild a fence line burned in a fire',
}

/** Read the unparsed request stream into a single Buffer for verification. */
async function readRawBody(req: IncomingMessage): Promise<Buffer> {
  const chunks: Buffer[] = []
  for await (const chunk of req) {
    chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk)
  }
  return Buffer.concat(chunks)
}

/** Whole-dollar gifts render as "$50"; custom amounts keep cents ("$12.50"). */
function formatAmount(amount: number): string {
  return Number.isInteger(amount) ? String(amount) : amount.toFixed(2)
}

function impactSentence(amount: number): string {
  const line = IMPACT_LINES[amount]
  return line ? `It ${line}.` : 'Every dollar is put to work in Montana communities.'
}

/**
 * Branded donor receipt. Single column, inline styles, no images and no
 * gradient buttons — those break or get stripped in email clients.
 */
function buildDonorEmail(record: DonationRecord): { subject: string; html: string; text: string } {
  const amount = formatAmount(record.amount)
  const frequencyWord = record.frequency === 'monthly' ? 'monthly ' : ''
  const subject = `Thank you, neighbor — your $${amount} ${frequencyWord}gift to SupportMT`
  const impact = impactSentence(record.amount)
  const gratitude =
    'From the Hi-Line to the Bitterroot, neighbors like you are how Montana takes care of its own — thank you.'
  const smallPrint = 'SupportMT is a 501(c)(3) — this email confirms your tax-deductible gift.'
  const bodyStyle =
    'margin:0 0 16px;font-family:Arial,Helvetica,sans-serif;font-size:16px;line-height:1.65;color:#252525;'

  const html = `<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"></head>
<body style="margin:0;padding:0;background-color:#F8F7F2;">
  <div style="max-width:560px;margin:0 auto;padding:48px 24px;">
    <p style="margin:0 0 28px;font-family:Arial,Helvetica,sans-serif;font-size:11px;font-weight:bold;letter-spacing:0.22em;text-transform:uppercase;color:#1D6151;">SUPPORTMT&nbsp;&middot;&nbsp;MONTANA</p>
    <h1 style="margin:0 0 24px;font-family:Georgia,'Times New Roman',serif;font-size:34px;line-height:1.2;font-weight:normal;color:#252525;">Thank you, neighbor.</h1>
    <p style="${bodyStyle}">Your <span style="background-color:#FDE460;padding:1px 5px;">$${amount}</span> ${frequencyWord}gift to SupportMT has been received.</p>
    <p style="${bodyStyle}">${impact}</p>
    <p style="${bodyStyle}">${gratitude}</p>
    <p style="${bodyStyle}"><a href="https://supportmt.com" style="color:#1D6151;">supportmt.com</a></p>
    <hr style="border:none;border-top:1px solid #D8D4C8;margin:32px 0 16px;">
    <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:1.6;color:#252525;opacity:0.65;">${smallPrint}</p>
  </div>
</body>
</html>`

  const text = [
    'SUPPORTMT · MONTANA',
    '',
    'Thank you, neighbor.',
    '',
    `Your $${amount} ${frequencyWord}gift to SupportMT has been received.`,
    impact,
    '',
    gratitude,
    '',
    'https://supportmt.com',
    '',
    smallPrint,
  ].join('\n')

  return { subject, html, text }
}

/**
 * POST one email through Resend's REST API. Failures are logged, never
 * thrown — tradeoff noted here: returning a non-2xx to Stripe would trigger
 * webhook retries and risk duplicate receipts / double-recorded donations,
 * so a missed email is accepted, logged for manual follow-up, and can be
 * replayed from the Stripe dashboard (Stripe stays the system of record).
 */
async function sendViaResend(apiKey: string, payload: Record<string, unknown>): Promise<void> {
  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    })
    if (!res.ok) {
      console.error('[donation] resend_failed', res.status, await res.text().catch(() => ''))
    }
  } catch (err) {
    console.error('[donation] resend_error', err instanceof Error ? err.message : err)
  }
}

/** Donor receipt + optional plain-text heads-up to the org. Never throws. */
async function sendDonationEmails(record: DonationRecord): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey || !apiKey.trim()) return // receipts disabled — the donation is still recorded above
  const from = process.env.EMAIL_FROM || 'SupportMT <onboarding@resend.dev>'

  if (record.email) {
    const { subject, html, text } = buildDonorEmail(record)
    await sendViaResend(apiKey, { from, to: [record.email], subject, html, text })
  }

  const orgEmail = process.env.ORG_NOTIFY_EMAIL
  if (orgEmail && orgEmail.trim()) {
    const amount = formatAmount(record.amount)
    const frequencyWord = record.frequency === 'monthly' ? 'monthly ' : ''
    const summary = `New $${amount} ${frequencyWord}donation from ${record.email ?? 'unknown donor'}.`
    await sendViaResend(apiKey, { from, to: [orgEmail], subject: summary, text: summary })
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).json({ error: 'method_not_allowed' })
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET
  if (!webhookSecret || !webhookSecret.trim()) {
    return res.status(501).json({ error: 'webhook_not_configured' })
  }

  const secretKey = process.env.STRIPE_SECRET_KEY
  if (!secretKey || !secretKey.trim()) {
    return res.status(501).json({ error: 'stripe_not_configured' })
  }

  const signatureHeader = req.headers['stripe-signature']
  const signature = Array.isArray(signatureHeader) ? signatureHeader[0] : signatureHeader
  if (!signature) {
    return res.status(400).json({ error: 'invalid_signature' })
  }

  let event: Stripe.Event
  try {
    const rawBody = await readRawBody(req)
    const stripe = new Stripe(secretKey)
    event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret)
  } catch (err) {
    console.error('[donation] invalid_signature', err instanceof Error ? err.message : err)
    return res.status(400).json({ error: 'invalid_signature' })
  }

  // The endpoint only subscribes to checkout.session.completed; anything else
  // is acknowledged and dropped.
  if (event.type !== 'checkout.session.completed') {
    return res.status(200).json({ received: true, ignored: true })
  }

  const session = event.data.object as Stripe.Checkout.Session
  const record: DonationRecord = {
    id: session.id,
    amount: (session.amount_total ?? 0) / 100,
    currency: session.currency ?? 'usd',
    frequency: session.mode === 'subscription' ? 'monthly' : 'one-time',
    email: session.customer_details?.email ?? null,
    name: session.customer_details?.name ?? null,
    created: new Date().toISOString(),
  }

  // Vercel captures this structured line in the function logs; Stripe itself
  // remains the system of record for every completed donation.
  console.log('[donation]', JSON.stringify(record))

  // ── Extension point ──────────────────────────────────────────────────────
  // Persist `record` here when a store is added later (Vercel KV, Postgres,
  // etc.). Stripe stays the system of record, so this projection can always
  // be replayed from the Stripe dashboard — no backfill risk.
  // ─────────────────────────────────────────────────────────────────────────

  await sendDonationEmails(record)

  return res.status(200).json({ received: true })
}
