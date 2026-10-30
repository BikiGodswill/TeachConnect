import 'server-only';
import crypto from 'crypto';

/**
 * Payment provider adapter. Real providers (MTN MoMo, Orange Money, card gateway…) implement
 * the same two functions. Secrets stay in server env vars, never in the browser.
 *
 *   createCheckout({ paymentId, amount, currency, returnUrl }) -> { url, reference }
 *   verifyWebhook(rawBody, headers) -> { reference, paymentId, status: 'SUCCESS'|'FAILED', amount }
 */
const secret = () => process.env.PAYMENT_WEBHOOK_SECRET || '';

const mock = {
  // DEV ONLY. Refuses to run in production.
  async createCheckout({ paymentId, returnUrl }) {
    if (process.env.NODE_ENV === 'production') throw new Error('Mock payments are disabled in production.');
    const reference = `mock_${crypto.randomBytes(8).toString('hex')}`;
    return { reference, url: `/payments/mock?payment=${paymentId}&ref=${reference}&return=${encodeURIComponent(returnUrl)}` };
  },
  verifyWebhook(rawBody, headers) {
    const sig = headers.get('x-signature') || '';
    const expected = crypto.createHmac('sha256', secret()).update(rawBody).digest('hex');
    const a = Buffer.from(sig); const b = Buffer.from(expected);
    if (!secret() || a.length !== b.length || !crypto.timingSafeEqual(a, b)) throw new Error('Invalid signature');
    const j = JSON.parse(rawBody);
    return { reference: j.reference, paymentId: j.paymentId, status: j.status, amount: j.amount };
  },
};

/**
 * Fapshi (Cameroon: MTN MoMo, Orange Money, cards) — hosted checkout.
 * Fapshi webhooks are NOT signed, so we never trust their body: we take only the transaction id from it
 * and ask Fapshi directly (GET /payment-status/{transId}, authenticated with our API key) what happened.
 * Keys starting FAK_TEST_ use the sandbox; anything else uses live.
 */
const fapshiBase = () => (process.env.FAPSHI_API_KEY || '').startsWith('FAK_TEST_') ? 'https://sandbox.fapshi.com' : 'https://live.fapshi.com';
const fapshiHeaders = () => {
  if (!process.env.FAPSHI_API_USER || !process.env.FAPSHI_API_KEY) throw new Error('Payments are not configured yet (missing Fapshi keys).');
  return { 'Content-Type': 'application/json', apiuser: process.env.FAPSHI_API_USER, apikey: process.env.FAPSHI_API_KEY };
};
const fapshiStatus = (s) => ({ SUCCESSFUL: 'SUCCESS', FAILED: 'FAILED', EXPIRED: 'FAILED' }[String(s || '').toUpperCase()] || 'PENDING');

const fapshi = {
  async createCheckout({ paymentId, amount, currency, returnUrl, email }) {
    if ((currency || 'XAF') !== 'XAF') throw new Error('Only XAF payments are supported.');
    const amt = Math.round(Number(amount));
    if (!(amt >= 100)) throw new Error('Minimum online payment is 100 XAF.');
    const r = await fetch(`${fapshiBase()}/initiate-pay`, {
      method: 'POST', headers: fapshiHeaders(), cache: 'no-store',
      body: JSON.stringify({ amount: amt, email: email || undefined, redirectUrl: returnUrl, externalId: String(paymentId), message: 'Teacher Connect lesson' }),
    });
    const j = await r.json().catch(() => ({}));
    if (!r.ok || !j.link || !j.transId) throw new Error(j.message || 'Could not start the payment. Please try again.');
    return { url: j.link, reference: j.transId };
  },
  async getStatus(transId) {
    const r = await fetch(`${fapshiBase()}/payment-status/${encodeURIComponent(transId)}`, { headers: fapshiHeaders(), cache: 'no-store' });
    const j = await r.json().catch(() => null);
    if (!r.ok || !j) throw new Error((j && j.message) || 'Could not check the payment with Fapshi.');
    const t = Array.isArray(j) ? j[0] : j;
    if (!t) throw new Error('Payment not found at Fapshi.');
    return { reference: t.transId || transId, paymentId: t.externalId, status: fapshiStatus(t.status), amount: t.amount };
  },
  async verifyWebhook(rawBody, headers, url) {
    // optional shared secret in the webhook URL: /api/payments/webhook?s=<PAYMENT_WEBHOOK_SECRET>
    if (secret()) {
      const given = new URL(url).searchParams.get('s') || '';
      const a = Buffer.from(given); const b = Buffer.from(secret());
      if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) throw new Error('Invalid secret');
    }
    const j = JSON.parse(rawBody || '{}');
    const transId = j.transId || (j[0] && j[0].transId);
    if (!transId) throw new Error('No transaction id');
    return this.getStatus(transId);
  },
};

export function getProvider() {
  const name = process.env.PAYMENT_PROVIDER || 'mock';
  if (name === 'mock') return mock;
  if (name === 'fapshi') return fapshi;
  throw new Error(`Payment provider "${name}" is not implemented yet.`);
}

export function signPayload(rawBody) {
  return crypto.createHmac('sha256', secret()).update(rawBody).digest('hex');
}
