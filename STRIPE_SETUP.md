# Stripe Setup — SupportMT donations

The donation widget redirects to Stripe Checkout. Secret keys stay server-side
only (Vite dev middleware in `vite.config.ts` + serverless function in
`api/create-checkout-session.ts`, both sharing `server/checkout.ts`).

## Local development

1. Create or verify a Stripe account at https://dashboard.stripe.com.
2. Copy your **test** secret key (`sk_test_...`) from
   https://dashboard.stripe.com/apikeys into a new `.env` file in this
   directory (see `.env.example`). Never commit `.env` — it's gitignored.
3. Restart `npm run dev` so the middleware picks up the key.
4. Click Donate on the site — you'll be redirected to Stripe Checkout.
   Test with card `4242 4242 4242 4242`, any future expiry, any CVC.

Without a key, the API returns `501 stripe_not_configured` and the widget
falls back to a demo thank-you panel.

## Production (Vercel / Netlify-style hosts)

- Deploy as-is: `api/create-checkout-session.ts` works as a serverless
  function with no extra config. Set `STRIPE_SECRET_KEY` to your **live**
  key (`sk_live_...`) in the host's environment-variable settings.
- Optionally add a webhook (Dashboard → Developers → Webhooks) listening for
  `checkout.session.completed` to record donations in your own database.

## Monthly gifts

Monthly donations create real Stripe Subscriptions (`mode: 'subscription'`).
Donors can be managed, paused, or refunded from the Stripe dashboard under
Payments → Subscriptions.

Success URL: `/success?session_id=...` · Cancel URL: `/#donate`

## Webhook + receipts

`api/stripe-webhook.ts` receives Stripe's `checkout.session.completed` event,
verifies the signature against `STRIPE_WEBHOOK_SECRET`, records each completed
donation as a structured `[donation]` line in the function logs (Stripe stays
the system of record), and emails the donor a branded thank-you receipt.

- Provision the endpoint + signing secret via the Stripe API or Dashboard →
  Developers → Webhooks: URL `https://supportmt.com/api/stripe-webhook`,
  event `checkout.session.completed`. Set the returned `whsec_...` as
  `STRIPE_WEBHOOK_SECRET` in the host's environment variables.
- Receipts use the free tier of https://resend.com — create an API key and set
  it as `RESEND_API_KEY`. Optional: `EMAIL_FROM` (sender, defaults to
  `SupportMT <onboarding@resend.dev>`) and `ORG_NOTIFY_EMAIL` for a plain-text
  heads-up to the team on every gift.
- Verifying supportmt.com in Resend (Domains → add the DNS records) enables a
  branded From address like `SupportMT <hello@supportmt.com>`.
- Email failures are logged but still return 200 so Stripe does not retry;
  replay or refund any gift from the Stripe dashboard at any time.
