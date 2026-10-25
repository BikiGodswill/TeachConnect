export const money = (n, c = 'XAF') => `${Number(n || 0).toLocaleString('en-US')} ${c === 'XAF' ? 'FCFA' : c}`;

export const fmtDate = (d) =>
  new Date(`${d}T12:00:00`).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });

export const fmtTime = (t) => (t ? t.slice(0, 5) : '');

export const fmtDateTime = (iso) =>
  new Date(iso).toLocaleString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });

export const BOOKING_TONE = {
  REQUESTED: 'bg-brandyellow-100 text-[#8a6100]', ACCEPTED: 'bg-sky-100 text-info', CONFIRMED: 'bg-teal-100 text-teal-600',
  TEACHER_ARRIVING: 'bg-sky-100 text-info', ARRIVED: 'bg-sky-100 text-info', IN_PROGRESS: 'bg-lavender-100 text-navy-700',
  COMPLETED: 'bg-teal-100 text-teal-600', CANCELLED: 'bg-ink-100 text-ink-600', REJECTED: 'bg-ink-100 text-danger',
  EXPIRED: 'bg-ink-100 text-ink-600', DISPUTED: 'bg-peach-100 text-danger',
};

export const PAYMENT_LABEL = {
  UNPAID: 'Unpaid', PENDING: 'Payment pending', PAID: 'Paid', HELD: 'Held (protected)', AVAILABLE: 'Settled',
  REFUNDED: 'Refunded', PARTIALLY_REFUNDED: 'Partially refunded', DISPUTED: 'Disputed', FAILED: 'Failed',
  PAID_OFF_PLATFORM: 'Paid outside app',
};

export const DISPUTE_REASONS = [
  ['TEACHER_NO_SHOW', 'Teacher did not attend'], ['TEACHER_LATE', 'Teacher arrived very late'],
  ['LESSON_SHORT', 'Lesson was shorter than agreed'], ['WRONG_SERVICE', 'Wrong service'],
  ['POOR_SERVICE', 'Poor or incorrect service'], ['SAFETY', 'Safety issue'],
  ['TECHNICAL', 'Technical issue'], ['OTHER', 'Other'],
];
