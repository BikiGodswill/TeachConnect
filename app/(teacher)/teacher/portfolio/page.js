import { getSessionUser } from '@/lib/supabase/auth-server';
import DownloadJson from '@/components/forms/DownloadJson';

export const metadata = { title: 'Portfolio & reputation — Teacher Connect' };

export default async function Portfolio() {
  const { db, user } = await getSessionUser();
  const [{ data: tp }, { data: certs }] = await Promise.all([
    db.from('teacher_profiles').select('rating_avg,rating_count,completed_lessons,verification').eq('id', user.id).maybeSingle(),
    db.from('certificates').select('id', { count: 'exact', head: true }).eq('teacher_id', user.id).eq('revoked', false),
  ]);
  return (
    <div className="max-w-2xl space-y-6">
      <div><h1 className="text-3xl font-extrabold">Portfolio &amp; reputation</h1><p className="mt-1 text-sm text-ink-600">Your track record belongs to you. Download a fingerprinted copy to keep or show elsewhere.</p></div>
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="card p-5"><p className="text-xs font-bold text-ink-600">Rating</p><p className="font-heading text-2xl font-extrabold">{Number(tp?.rating_avg || 0).toFixed(1)} <span className="text-sm">({tp?.rating_count || 0})</span></p></div>
        <div className="card p-5"><p className="text-xs font-bold text-ink-600">Completed lessons</p><p className="font-heading text-2xl font-extrabold">{tp?.completed_lessons || 0}</p></div>
        <div className="card p-5"><p className="text-xs font-bold text-ink-600">Verification</p><p className="font-heading text-lg font-extrabold">{(tp?.verification || 'NOT_SUBMITTED').replace('_', ' ')}</p></div>
      </div>
      <section className="card space-y-3 p-6">
        <h2 className="font-bold">Download my reputation</h2>
        <p className="text-sm text-ink-600">The file includes a SHA-256 fingerprint of its contents, so any later change to it can be detected. It is a record issued by Teacher Connect; it is not stored on any blockchain.</p>
        <DownloadJson rpc="my_reputation_export" filename="teacher-connect-reputation.json" label="Download reputation (JSON)" />
      </section>
    </div>
  );
}
