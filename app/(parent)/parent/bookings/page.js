import Link from 'next/link';
import { getSessionUser } from '@/lib/supabase/auth-server';
import BookingCard from '@/components/bookings/BookingCard';

export const metadata = { title: 'Bookings — Teacher Connect' };

const GROUPS = [
  ['Active', ['REQUESTED', 'ACCEPTED', 'CONFIRMED', 'TEACHER_ARRIVING', 'ARRIVED', 'IN_PROGRESS']],
  ['Completed', ['COMPLETED', 'DISPUTED']],
  ['Cancelled', ['CANCELLED', 'REJECTED', 'EXPIRED']],
];

export default async function ParentBookings() {
  const { db, user } = await getSessionUser();
  const { data } = await db.from('booking_details').select('*').eq('student_id', user.id)
    .order('scheduled_date', { ascending: false }).order('start_time', { ascending: false }).limit(150);
  return (
    <div className="space-y-10">
      <h1 className="text-3xl font-extrabold">Bookings</h1>
      {!data?.length && <div className="card p-10 text-center"><p className="text-ink-600">No lessons booked yet.</p><Link href="/teachers" className="btn-teal mt-5">Find a Teacher</Link></div>}
      {GROUPS.map(([title, statuses]) => {
        const list = (data || []).filter((b) => statuses.includes(b.status));
        if (!list.length) return null;
        return (<section key={title}><h2 className="mb-4 text-lg font-bold">{title}</h2><div className="space-y-4">{list.map((b) => <BookingCard key={b.id} b={b} viewer="STUDENT" />)}</div></section>);
      })}
    </div>
  );
}
