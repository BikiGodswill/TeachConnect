'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { createClient } from '@/lib/supabase/client';
import { friendlyError } from '@/lib/errors';

export default function RpcButton({ rpc, args = {}, label, success = 'Done.', confirmText, kind = 'teal', redirectTo }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  async function go() {
    if (confirmText && !confirm(confirmText)) return;
    setBusy(true);
    const { error } = await createClient().rpc(rpc, args);
    setBusy(false);
    if (error) return toast.error(friendlyError(error));
    toast.success(success);
    if (redirectTo) router.push(redirectTo); else router.refresh();
  }
  const cls = kind === 'ghost' ? 'btn-ghost' : 'btn-teal';
  return <button onClick={go} disabled={busy} className={`${cls} h-10 px-5 text-xs disabled:opacity-60`}>{busy ? 'Please wait…' : label}</button>;
}
