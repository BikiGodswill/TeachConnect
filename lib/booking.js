// Shared booking helpers (pure functions — safe for client and server).
export const PAYMENT_METHODS = [
  { value: 'TEACHER_CONNECT', label: 'Pay in the app', hint: 'Dispute protection, secure records and rewards', recommended: true },
  { value: 'CASH', label: 'Cash to teacher', hint: 'Pay your teacher in person' },
  { value: 'MOBILE_MONEY_DIRECT', label: 'Mobile Money (direct)', hint: 'Send directly to your teacher' },
  { value: 'BANK_TRANSFER', label: 'Bank transfer', hint: 'Pay your teacher by transfer' },
  { value: 'OTHER', label: 'Other', hint: 'Agree another method with your teacher' },
];

export const DURATIONS = [30, 45, 60, 90, 120];

const toMin = (t) => { const [h, m] = t.split(':').map(Number); return h * 60 + m; };
const toHHMM = (min) => `${String(Math.floor(min / 60)).padStart(2, '0')}:${String(min % 60).padStart(2, '0')}`;

export function rateFor(teacher, mode) {
  return mode === 'ONLINE' ? (teacher.online_rate ?? teacher.hourly_rate) : (teacher.physical_rate ?? teacher.hourly_rate);
}
export const priceFor = (rate, minutes) => (rate == null ? null : Math.round((rate * minutes) / 60));

/** Valid start times (every 30 min) inside availability windows, excluding busy ranges and past times. */
export function buildSlots({ date, duration, availability, busy, now = new Date() }) {
  if (!date) return [];
  const dow = new Date(`${date}T12:00:00`).getDay();
  const busyR = (busy || []).map((b) => [toMin(b.start_time), toMin(b.end_time)]);
  const isToday = date === now.toISOString().slice(0, 10);
  const nowMin = now.getHours() * 60 + now.getMinutes();
  const slots = [];
  availability.filter((a) => a.day_of_week === dow).forEach((a) => {
    for (let s = toMin(a.start_time); s + duration <= toMin(a.end_time); s += 30) {
      if (isToday && s <= nowMin + 60) continue;
      if (busyR.some(([bs, be]) => s < be && s + duration > bs)) continue;
      slots.push(toHHMM(s));
    }
  });
  return [...new Set(slots)].sort();
}
