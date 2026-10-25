'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { createClient } from '@/lib/supabase/client';

export default function ReplyForm({ reviewId }) {
  const router = useRouter();
  const [text, setText] = useState('');
  const [busy, setBusy] = useState(false);
  async function submit(e) {
    e.preventDefault();
    if (!text.trim()) return;
    setBusy(true);
    const { error } = await createClient().from('reviews').update({ teacher_reply: text.trim().slice(0, 1000) }).eq('id', reviewId);
    setBusy(false);
    if (error) return toast.error('Could not post your reply.');
    router.refresh();
  }
  return (
    <form onSubmit={submit} className="mt-4 flex gap-2">
      <input value={text} onChange={(e) => setText(e.target.value)} placeholder="Reply publicly…" maxLength={1000} className="h-11 flex-1 rounded-md border border-ink-200 px-4 text-sm outline-none focus:border-teal-500" />
      <button disabled={busy} className="btn-primary h-11 px-5 text-xs">Reply</button>
    </form>
  );
}
