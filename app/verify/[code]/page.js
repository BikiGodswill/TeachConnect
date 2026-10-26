import Link from 'next/link';
import SiteHeader from '@/components/layout/SiteHeader';
import SiteFooter from '@/components/layout/SiteFooter';
import { createPublicClient } from '@/lib/supabase/server';

export const metadata = { title: 'Certificate verification — Teacher Connect' };
export const dynamic = 'force-dynamic';

export default async function Verify({ params }) {
  const code = decodeURIComponent(params.code).toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 40);
  const { data, error } = await createPublicClient().rpc('verify_certificate', { p_code: code });
  const c = data?.[0];
  return (
    <>
      <SiteHeader />
      <main className="grid min-h-[60vh] place-items-center bg-sky-50 px-5 py-16">
        <div className="card w-full max-w-lg space-y-3 p-8 text-center">
          {error ? (<><h1 className="text-2xl font-extrabold">We could not check this right now</h1><p className="text-sm text-ink-600">Please try again in a moment.</p></>)
            : !c ? (<><span className="text-4xl" aria-hidden>❌</span><h1 className="text-2xl font-extrabold">Certificate not found</h1><p className="text-sm text-ink-600">No certificate matches the code <b className="font-mono">{code}</b>. Check it and try again.</p></>)
            : c.revoked ? (<><span className="text-4xl" aria-hidden>⚠️</span><h1 className="text-2xl font-extrabold">Certificate revoked</h1><p className="text-sm text-ink-600">This certificate was issued to {c.recipient_name} but has since been revoked by the issuer.</p></>)
            : (<>
              <span className="text-4xl" aria-hidden>✅</span><h1 className="text-2xl font-extrabold">Valid certificate</h1>
              <p className="text-sm text-ink-600">Issued to</p><p className="font-heading text-2xl font-extrabold">{c.recipient_name}</p>
              <p className="font-bold text-navy-900">{c.title}</p>
              {c.description && <p className="text-sm text-ink-600">{c.description}</p>}
              <p className="text-sm">By <b>{c.teacher_name}</b> · {new Date(c.issued_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
              <p className="font-mono text-xs text-ink-400">{code}</p>
            </>)}
          <Link href="/verify" className="btn-ghost mt-4">Check another</Link>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
