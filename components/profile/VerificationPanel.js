'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { friendlyError } from '@/lib/errors';
import { HiCheckBadge, HiShieldCheck } from 'react-icons/hi2';
import { createClient } from '@/lib/supabase/client';

const TYPES = [['NATIONAL_ID', 'National ID'], ['PASSPORT', 'Passport'], ['ACADEMIC_CERT', 'Academic certificate'], ['PROFESSIONAL_CERT', 'Professional certificate'], ['OTHER', 'Other']];
const STATUS_COPY = {
  NOT_SUBMITTED: 'Upload an ID and at least one certificate, then submit for review.',
  PENDING: 'Submitted. Our team will start reviewing soon.',
  UNDER_REVIEW: 'Our team is reviewing your documents.',
  VERIFIED: 'You are verified. Students see your badge.',
  REJECTED: 'Your documents were not accepted. Upload new ones and resubmit.',
};
const MAX = 8 * 1024 * 1024;

export default function VerificationPanel({ userId, status = 'NOT_SUBMITTED', docs }) {
  const router = useRouter();
  const [type, setType] = useState('NATIONAL_ID');
  const [busy, setBusy] = useState(false);
  const locked = ['PENDING', 'UNDER_REVIEW', 'VERIFIED'].includes(status);

  async function upload(e) {
    const file = e.target.files?.[0]; e.target.value = '';
    if (!file) return;
    if (file.size > MAX) return toast.error('Files must be under 8 MB.');
    if (!/^(image\/|application\/pdf)/.test(file.type)) return toast.error('Upload an image or PDF.');
    setBusy(true);
    const supabase = createClient();
    const path = `${userId}/${Date.now()}-${file.name.replace(/[^\w.-]/g, '_')}`;
    const up = await supabase.storage.from('verification-docs').upload(path, file);
    if (up.error) { setBusy(false); return toast.error('Upload failed.'); }
    const { error } = await supabase.from('verification_documents').insert({ teacher_id: userId, doc_type: type, storage_path: path, status: 'PENDING' });
    setBusy(false);
    if (error) return toast.error('Could not record the document.');
    toast.success('Document uploaded.'); router.refresh();
  }

  async function submit() {
    setBusy(true);
    const { error } = await createClient().rpc('submit_verification');
    setBusy(false);
    if (error) return toast.error(friendlyError(error));
    toast.success('Submitted for review.'); router.refresh();
  }

  return (
    <section className="card p-6">
      <div className="flex items-start gap-3">
        {status === 'VERIFIED' ? <HiCheckBadge className="text-teal-500" size={30} /> : <HiShieldCheck className="text-navy-700" size={30} />}
        <div><h2 className="text-lg font-bold">Verification: {status.replace('_', ' ')}</h2><p className="text-sm text-ink-600">{STATUS_COPY[status]}</p></div>
      </div>
      {!locked && (
        <div className="mt-5 flex flex-wrap items-center gap-3">
          <select value={type} onChange={(e) => setType(e.target.value)} className="h-11 rounded-md border border-ink-200 bg-white px-3 text-sm">{TYPES.map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select>
          <label className={`btn-ghost h-11 cursor-pointer px-5 text-xs ${busy ? 'opacity-50' : ''}`}>Upload document<input type="file" accept="image/*,application/pdf" className="hidden" onChange={upload} disabled={busy} /></label>
          <button onClick={submit} disabled={busy || !docs.length} className="btn-teal h-11 px-6 text-xs disabled:opacity-50">Submit for review</button>
        </div>
      )}
      {docs.length > 0 && (
        <ul className="mt-5 space-y-2 text-sm">
          {docs.map((d) => <li key={d.id} className="flex justify-between rounded-md bg-sky-50 px-4 py-2.5"><span>{TYPES.find(([v]) => v === d.doc_type)?.[1]}</span><span className="font-semibold">{d.status.replace('_', ' ')}{d.review_note ? ` — ${d.review_note}` : ''}</span></li>)}
        </ul>
      )}
      <p className="mt-4 text-xs text-ink-400">Documents are stored privately and only visible to you and our review team.</p>
    </section>
  );
}
