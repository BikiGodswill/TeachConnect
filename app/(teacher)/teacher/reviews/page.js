import { getSessionUser } from '@/lib/supabase/auth-server';
import Stars from '@/components/ui/Stars';
import ReplyForm from '@/components/profile/ReplyForm';

export const metadata = { title: 'Reviews — Teacher Connect' };

export default async function TeacherReviews() {
  const { db, user } = await getSessionUser();
  const { data: reviews } = await db.from('reviews').select('id,rating,comment,teacher_reply,created_at').eq('teacher_id', user.id).order('created_at', { ascending: false }).limit(50);
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-extrabold">Reviews</h1>
      {reviews?.length ? reviews.map((r) => (
        <article key={r.id} className="card p-6">
          <div className="flex items-center justify-between"><Stars value={r.rating} size={18} /><span className="text-xs text-ink-400">{new Date(r.created_at).toLocaleDateString('en-GB')}</span></div>
          {r.comment && <p className="mt-3 text-ink-600">{r.comment}</p>}
          {r.teacher_reply ? <p className="mt-4 rounded-md bg-sky-50 p-3 text-sm"><b>Your reply:</b> {r.teacher_reply}</p> : <ReplyForm reviewId={r.id} />}
        </article>
      )) : <div className="card p-10 text-center text-ink-600">Reviews from students appear here after completed lessons.</div>}
    </div>
  );
}
