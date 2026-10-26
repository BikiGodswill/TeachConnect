import Link from 'next/link';
import { headers } from 'next/headers';
import { notFound, redirect } from 'next/navigation';
import QRCode from 'qrcode';
import SiteHeader from '@/components/layout/SiteHeader';
import PrintButton from '@/components/learning/PrintButton';
import RevokeButton from '@/components/learning/RevokeButton';
import { getSessionUser } from '@/lib/supabase/auth-server';

export const metadata = { title: 'Certificate — Teacher Connect' };

export default async function CertificatePage({ params }) {
  if (!/^[0-9a-f-]{36}$/i.test(params.id)) notFound();
  const { db, user } = await getSessionUser();
  if (!user) redirect(`/login?next=/learning/certificate/${params.id}`);
  const { data: c } = await db.from('certificates').select('*').eq('id', params.id).maybeSingle();
  if (!c) notFound();
  const { data: t } = await db.from('users').select('full_name').eq('id', c.teacher_id).maybeSingle();
  const h = headers();
  const origin = process.env.NEXT_PUBLIC_SITE_URL || `${h.get('x-forwarded-proto') || 'https'}://${h.get('host')}`;
  const url = `${origin}/verify/${c.code}`;
  const qr = await QRCode.toString(url, { type: 'svg', margin: 1, width: 120 });
  return (
    <>
      <SiteHeader />
      <main className="min-h-screen bg-sky-50 px-5 py-8">
        <div className="mx-auto max-w-2xl space-y-4">
          <div className="print:hidden"><Link href={user.id === c.teacher_id ? '/teacher/students' : '/dashboard'} className="text-sm font-bold text-teal-600">← Back</Link></div>
          <article className="rounded-xl border-4 border-double border-teal-500 bg-white p-10 text-center shadow-float">
            <p className="text-xs font-bold uppercase tracking-widest text-teal-600">Teacher Connect · Certificate</p>
            <p className="mt-8 text-sm text-ink-600">This certifies that</p>
            <h1 className="mt-2 font-heading text-4xl font-extrabold">{c.recipient_name}</h1>
            <p className="mt-6 text-sm text-ink-600">has successfully completed</p>
            <h2 className="mt-2 text-2xl font-bold text-navy-900">{c.title}</h2>
            {c.description && <p className="mx-auto mt-3 max-w-md text-sm text-ink-600">{c.description}</p>}
            <p className="mt-8 text-sm">Issued by <b>{t?.full_name}</b> on {new Date(c.issued_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
            {c.revoked && <p className="mt-4 rounded-md bg-peach-100 p-2 text-sm font-bold text-danger">This certificate has been revoked.</p>}
            <div className="mt-8 flex items-center justify-center gap-6">
              <div className="h-[120px] w-[120px]" dangerouslySetInnerHTML={{ __html: qr }} aria-label="QR code to verify this certificate" role="img" />
              <div className="text-left text-xs text-ink-600"><p>Certificate code</p><p className="font-mono text-lg font-bold text-navy-900">{c.code}</p><p className="mt-1 break-all">{url}</p></div>
            </div>
          </article>
          <div className="flex flex-wrap gap-3 print:hidden"><PrintButton />{user.id === c.teacher_id && !c.revoked && <RevokeButton id={c.id} />}</div>
        </div>
      </main>
    </>
  );
}
