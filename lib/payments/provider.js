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

export function getProvider() {
  const name = process.env.PAYMENT_PROVIDER || 'mock';
  if (name === 'mock') return mock;
  throw new Error(`Payment provider "${name}" is not implemented yet.`);
}

export function signPayload(rawBody) {
  return crypto.createHmac('sha256', secret()).update(rawBody).digest('hex');
}
