import path from "path"
import react from "@vitejs/plugin-react"
import { defineConfig, type Plugin } from "vite"
import { inspectAttr } from 'kimi-plugin-inspect-react'
import { config as loadEnv } from 'dotenv'
import { createCheckoutSession, resolveOrigin, CheckoutError } from './server/checkout'
import type { IncomingMessage, ServerResponse } from 'http'

/** Read a JSON request body from the dev-server middleware request. */
function readJsonBody(req: IncomingMessage): Promise<unknown> {
  return new Promise((resolve, reject) => {
    let data = ''
    req.on('data', (chunk) => {
      data += chunk
      if (data.length > 1_000_000) {
        reject(new Error('request body too large'))
        req.destroy()
      }
    })
    req.on('end', () => {
      if (!data) return resolve({})
      try {
        resolve(JSON.parse(data))
      } catch {
        reject(new Error('invalid JSON body'))
      }
    })
    req.on('error', reject)
  })
}

function sendJson(res: ServerResponse, status: number, payload: unknown) {
  res.statusCode = status
  res.setHeader('Content-Type', 'application/json')
  res.end(JSON.stringify(payload))
}

/**
 * Dev-only /api/create-checkout-session endpoint, mirroring the
 * production serverless function in api/create-checkout-session.ts.
 */
function checkoutApi(): Plugin {
  return {
    name: 'supportmt-checkout-api',
    configureServer(server) {
      // Load .env from the project root so STRIPE_SECRET_KEY is available.
      loadEnv()

      server.middlewares.use('/api/create-checkout-session', async (req, res) => {
        if (req.method !== 'POST') {
          res.setHeader('Allow', 'POST')
          return sendJson(res, 405, { error: 'method_not_allowed' })
        }

        let body: unknown
        try {
          body = await readJsonBody(req)
        } catch (err) {
          return sendJson(res, 400, { error: err instanceof Error ? err.message : 'invalid body' })
        }

        const { amount, frequency } = (body ?? {}) as { amount?: unknown; frequency?: unknown }
        const port = server.config.server.port ?? 3000

        try {
          const url = await createCheckoutSession({
            amount,
            frequency,
            origin: resolveOrigin(req.headers as Record<string, string | string[] | undefined>, port),
          })
          return sendJson(res, 200, { url })
        } catch (err) {
          if (err instanceof CheckoutError) {
            if (err.code === 'STRIPE_NOT_CONFIGURED') {
              return sendJson(res, 501, { error: 'stripe_not_configured' })
            }
            return sendJson(res, err.status, { error: err.message })
          }
          console.error('[checkout] unexpected error', err)
          return sendJson(res, 500, { error: 'internal_error' })
        }
      })
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  base: './',
  plugins: [inspectAttr(), react(), checkoutApi()],
  server: {
    port: 3000,
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
