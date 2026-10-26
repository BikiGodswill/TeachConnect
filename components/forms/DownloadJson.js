'use client';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { createClient } from '@/lib/supabase/client';
import { friendlyError } from '@/lib/errors';

export default function DownloadJson({ rpc, filename, label }) {
  const [busy, setBusy] = useState(false);
  async function go() {
    setBusy(true);
    const { data, error } = await createClient().rpc(rpc);
    setBusy(false);
    if (error) return toast.error(friendlyError(error));
    const url = URL.createObjectURL(new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' }));
    const a = Object.assign(document.createElement('a'), { href: url, download: filename });
    a.click(); URL.revokeObjectURL(url);
  }
  return <button onClick={go} disabled={busy} className="btn-teal h-10 px-5 text-xs disabled:opacity-60">{busy ? 'Preparing…' : label}</button>;
}
