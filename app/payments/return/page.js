'use client';
import { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { HiCheckCircle, HiXCircle, HiClock } from 'react-icons/hi2';

function Inner() {
  const booking = useSearchParams().get('booking');
  const [state, setState] = useState('CHECKING');
  const [error, setError] = useState('');

  useEffect(() => {
    let stop = false;
    (async () => {
      for (let i = 0; i < 12 && !stop; i++) {
        try {
          const res = await fetch('/api/payments/verify', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ bookingId: booking }) });
          const j = await res.json().catch(() => ({}));
          if (!res.ok) { setError(j.error || 'Could not check your payment.'); setState('ERROR'); return; }
          if (j.state !== 'PENDING') { setState(j.state); return; }
        } catch { setError('Network problem while checking your payment.'); setState('ERROR'); return; }
        await new Promise((r) => setTimeout(r, 3000));
      }
      if (!stop) setState('PENDING');
    })();
    return () => { stop = true; };
  }, [booking]);

  const view = {
    CHECKING: [HiClock, 'Confirming your payment…', 'Please keep this page open for a moment.', 'text-ink-600'],
    PAID: [HiCheckCircle, 'Payment received', 'Your lesson is confirmed. You will find it under My lessons.', 'text-teal-600'],
    FAILED: [HiXCircle, 'Payment was not completed', 'No money was taken. You can try again from your lessons.', 'text-red-600'],
    PENDING: [HiClock, 'Still waiting for confirmation', 'If you approved the payment on your phone it will appear shortly. Check your lessons in a minute.', 'text-ink-600'],
    ERROR: [HiXCircle, 'We could not check your payment', error, 'text-red-600'],
    MISMATCH: [HiXCircle, 'Payment needs review', 'The amount did not match. Please contact support.', 'text-red-600'],
  }[state] || [HiClock, 'Checking…', '', 'text-ink-600'];
  const Icon = view[0];
  return (
    <main className="mx-auto flex min-h-[70vh] max-w-md items-center px-4">
      <div className="card w-full p-8 text-center">
        <Icon className={`mx-auto text-6xl ${view[3]} ${state === 'CHECKING' ? 'animate-pulse' : ''}`} />
        <h1 className="mt-4 text-2xl font-extrabold">{view[1]}</h1>
        <p className="mt-2 text-sm text-ink-600">{view[2]}</p>
        <Link href="/dashboard" className="btn-primary mt-6 inline-flex h-11 px-6 text-sm">Go to my lessons</Link>
      </div>
    </main>
  );
}
export default function Page() { return <Suspense><Inner /></Suspense>; }
