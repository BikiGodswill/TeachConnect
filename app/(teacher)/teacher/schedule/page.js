import { getSessionUser } from '@/lib/supabase/auth-server';
import BookingCard from '@/components/bookings/BookingCard';
import AvailabilityEditor from '@/components/profile/AvailabilityEditor';

export const metadata = { title: 'Schedule — Teacher Connect' };

export default async function Schedule() {
  const { db, user } = await getSessionUser();
  const [{ data: bookings }, { data: avail }] = await Promise.all([
    db.from('booking_details').select('*').eq('teacher_id', user.id)
      .in('status', ['ACCEPTED', 'CONFIRMED', 'TEACHER_ARRIVING', 'ARRIVED', 'IN_PROGRESS', 'COMPLETED', 'DISPUTED'])
      .order('scheduled_date', { ascending: false }).order('start_time', { ascending: false }).limit(60),
    db.from('teacher_availability').select('*').eq('teacher_id', user.id).order('day_of_week').order('start_time'),
  ]);
  const live = (bookings || []).filter((b) => !['COMPLETED', 'DISPUTED'].includes(b.status));
  const done = (bookings || []).filter((b) => ['COMPLETED', 'DISPUTED'].includes(b.status));
  return (
    <div className="space-y-10">
      <h1 className="text-3xl font-extrabold">Schedule</h1>
      <section>
        <h2 className="mb-4 text-lg font-bold">Weekly availability</h2>
        <AvailabilityEditor teacherId={user.id} initial={avail || []} />
      </section>
      <section>
        <h2 className="mb-4 text-lg font-bold">Upcoming & in progress</h2>
        {live.length ? <div className="space-y-4">{live.map((b) => <BookingCard key={b.id} b={b} viewer="TEACHER" />)}</div> : <p className="text-ink-600">Nothing scheduled.</p>}
      </section>
      {done.length > 0 && (
        <section>
          <h2 className="mb-4 text-lg font-bold">Past lessons</h2>
          <div className="space-y-4">{done.map((b) => <BookingCard key={b.id} b={b} viewer="TEACHER" />)}</div>
        </section>
      )}
    </div>
  );
}
