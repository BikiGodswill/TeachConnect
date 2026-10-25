'use client';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { HiChatBubbleLeftRight } from 'react-icons/hi2';
import { createClient } from '@/lib/supabase/client';

export default function MessageButton({ teacherId }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function start() {
    setBusy(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.push(`/login?next=/teachers/${teacherId}`); return; }
    const { data, error } = await supabase.rpc('get_or_create_conversation', { p_other: teacherId });
    setBusy(false);
    if (error) return toast.error('Could not open the conversation.');
    router.push(`/student/messages?c=${data}`);
  }
  return <button onClick={start} disabled={busy} className="btn-ghost px-6"><HiChatBubbleLeftRight size={18} /> Message</button>;
}
