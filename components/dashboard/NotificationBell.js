'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { HiBell } from 'react-icons/hi2';
import toast from 'react-hot-toast';
import { createClient } from '@/lib/supabase/client';

export default function NotificationBell({ userId }) {
  const [items, setItems] = useState([]);
  const [open, setOpen] = useState(false);
  const unread = items.filter((n) => !n.read_at).length;

  useEffect(() => {
    const supabase = createClient();
    let alive = true;
    supabase.from('notifications').select('id,type,title,body,data,read_at,created_at').order('created_at', { ascending: false }).limit(15)
      .then(({ data }) => { if (alive && data) setItems(data); });
    const channel = supabase.channel(`notif-${userId}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'notifications', filter: `user_id=eq.${userId}` },
        (payload) => { setItems((cur) => [payload.new, ...cur]); toast(payload.new.title); })
      .subscribe();
    return () => { alive = false; supabase.removeChannel(channel); };
  }, [userId]);

  async function markAllRead() {
    const ids = items.filter((n) => !n.read_at).map((n) => n.id);
    if (!ids.length) return;
    await createClient().from('notifications').update({ read_at: new Date().toISOString() }).in('id', ids);
    setItems((cur) => cur.map((n) => ({ ...n, read_at: n.read_at || new Date().toISOString() })));
  }

  return (
    <div className="relative">
      <button aria-label="Notifications" onClick={() => { setOpen(!open); if (!open) markAllRead(); }}
        className="relative grid h-10 w-10 place-items-center rounded-full bg-sky-50">
        <HiBell size={20} />
        {unread > 0 && <span className="absolute -right-0.5 -top-0.5 grid h-5 min-w-5 place-items-center rounded-full bg-danger px-1 text-[10px] font-bold text-white">{unread}</span>}
      </button>
      {open && (
        <div className="absolute right-0 z-50 mt-2 w-80 max-w-[90vw] rounded-lg bg-white p-2 shadow-float">
          {items.length === 0 && <p className="p-4 text-sm text-ink-600">No notifications yet.</p>}
          {items.map((n) => (
            <Wrapper key={n.id} href={linkFor(n)} onNavigate={() => setOpen(false)}>
              <p className="text-sm font-bold">{n.title}</p>
              {n.body && <p className="text-xs text-ink-600">{n.body}</p>}
            </Wrapper>
          ))}
        </div>
      )}
    </div>
  );
}

// Where a notification should take the person (null = no link). Only our own known id types are used.
function linkFor(n) {
  const d = n.data || {};
  if (d.assignment_id) return `/learning/assignment/${d.assignment_id}`;
  if (d.attempt_id) return `/learning/test/${d.attempt_id}`;
  if (d.certificate_id) return `/learning/certificate/${d.certificate_id}`;
  if (d.job_id) return n.type === 'APPLICATION' ? '/dashboard' : '/jobs';
  if (d.booking_id) return `/lesson/${d.booking_id}`;
  return null;
}

function Wrapper({ href, onNavigate, children }) {
  const cls = 'block rounded-md p-3 hover:bg-sky-50';
  return href ? <Link href={href} onClick={onNavigate} className={cls}>{children}</Link> : <div className={cls}>{children}</div>;
}
