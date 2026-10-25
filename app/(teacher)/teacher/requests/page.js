import { getSessionUser } from '@/lib/supabase/auth-server';
import BookingCard from '@/components/bookings/BookingCard';

export const metadata = { title: 'Requests — Teacher Connect' };

export default async function Requests() {
  const { db, user } = await getSessionUser();
  const { data } = await db.from('booking_details').select('*').eq('teacher_id', user.id).eq('status', 'REQUESTED').order('created_at');
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-extrabold">Lesson requests</h1>
      <p className="text-sm text-ink-600">Requests expire after 24 hours without a response.</p>
      {data?.length ? <div className="space-y-4">{data.map((b) => <BookingCard key={b.id} b={b} viewer="TEACHER" />)}</div>
        : <div className="card p-10 text-center text-ink-600">No pending requests right now.</div>}
    </div>
  );
}
