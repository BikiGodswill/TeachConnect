import Link from 'next/link';

export const metadata = { title: 'Plans — Teacher Connect' };

export default function Plans() {
  return (
    <div className="max-w-2xl space-y-6">
      <div><h1 className="text-3xl font-extrabold">Teacher plans</h1><p className="mt-1 text-sm text-ink-600">Everything you need to teach is free today. Optional paid plans are planned for later.</p></div>
      <section className="card space-y-2 p-6"><h2 className="font-bold">Free (your plan now)</h2>
        <ul className="list-disc pl-5 text-sm text-ink-600"><li>Public profile, bookings, instant requests and packages</li><li>Wallet and withdrawals</li><li>Students, assignments, tests, courses and certificates</li><li>Basic analytics</li></ul></section>
      <section className="card space-y-2 p-6 opacity-80"><h2 className="font-bold">Pro &amp; Premium — coming later</h2>
        <p className="text-sm text-ink-600">Featured placement in search, advanced analytics and premium visibility are planned. Nothing is sold or charged yet.</p>
        <Link href="/teacher/analytics" className="text-sm font-bold text-teal-600 underline">See your analytics</Link></section>
    </div>
  );
}
