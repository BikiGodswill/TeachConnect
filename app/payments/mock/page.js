import { notFound, redirect } from 'next/navigation';
import { getSessionUser } from '@/lib/supabase/auth-server';
import { createAdminClient } from '@/lib/supabase/admin';
import { signPayload } from '@/lib/payments/provider';

// DEV-ONLY fake checkout. Calls the same signed webhook a real provider would.
export const dynamic = 'force-dynamic';

export default async function MockCheckout({ searchParams }) {
  if (process.env.NODE_ENV === 'production') notFound();
  const { user } = await getSessionUser();
  if (!user) redirect('/login');
  const { payment, ref, return: back } = searchParams;

  async function pay() {
    'use server';
    const admin = createAdminClient();
    const { data: p } = await admin.from('payments').select('id,amount,student_id').eq('id', payment).single();
    if (!p || p.student_id !== user.id) return;
    const body = JSON.stringify({ reference: ref, paymentId: p.id, status: 'SUCCESS', amount: p.amount });
    const origin = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
    await fetch(`${origin}/api/payments/webhook`, { method: 'POST', headers: { 'x-signature': signPayload(body), 'Content-Type': 'application/json' }, body });
    redirect(back || '/student/bookings');
  }

  return (
    <main className="grid min-h-screen place-items-center bg-sky-50 p-5">
      <form action={pay} className="w-full max-w-sm rounded-xl bg-white p-8 text-center shadow-float">
        <p className="text-xs font-bold uppercase text-danger">Development mock — no real money</p>
        <h1 className="mt-3 text-2xl font-extrabold">Mock checkout</h1>
        <p className="mt-2 text-sm text-ink-600">Simulates a successful provider payment via the signed webhook.</p>
        <button className="btn-teal mt-6 w-full">Simulate successful payment</button>
      </form>
    </main>
  );
}
