'use client';
import { useEffect, useMemo, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { HiPaperAirplane, HiPaperClip, HiArrowLeft } from 'react-icons/hi2';
import { createClient } from '@/lib/supabase/client';

const MAX_FILE = 5 * 1024 * 1024;
const time = (iso) => new Date(iso).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });

export default function MessagesClient({ userId, initialConversations, initialActive }) {
  const supabase = useMemo(() => createClient(), []);
  const [convs, setConvs] = useState(initialConversations);
  const [active, setActive] = useState(initialActive || null);
  const [msgs, setMsgs] = useState([]);
  const [text, setText] = useState('');
  const [typing, setTyping] = useState(false);
  const [online, setOnline] = useState(false);
  const bottom = useRef(null);
  const channelRef = useRef(null);
  const typingTimer = useRef(null);
  const other = convs.find((c) => c.id === active);

  async function refreshList() {
    const { data } = await supabase.rpc('conversation_list');
    if (data) setConvs(data);
  }

  useEffect(() => {
    if (!active) return;
    let alive = true;
    setMsgs([]);
    supabase.from('messages').select('*').eq('conversation_id', active).order('created_at').limit(200)
      .then(({ data }) => { if (alive) setMsgs(data || []); });

    const channel = supabase.channel(`chat-${active}`, { config: { presence: { key: userId } } })
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages', filter: `conversation_id=eq.${active}` },
        ({ new: m }) => { setMsgs((cur) => (cur.some((x) => x.id === m.id) ? cur : [...cur, m])); refreshList(); })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'messages', filter: `conversation_id=eq.${active}` },
        ({ new: m }) => setMsgs((cur) => cur.map((x) => (x.id === m.id ? m : x))))
      .on('broadcast', { event: 'typing' }, ({ payload }) => {
        if (payload.userId === userId) return;
        setTyping(true); clearTimeout(typingTimer.current); typingTimer.current = setTimeout(() => setTyping(false), 2500);
      })
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState();
        setOnline(Object.keys(state).some((k) => k !== userId));
      })
      .subscribe(async (status) => { if (status === 'SUBSCRIBED') await channel.track({ at: Date.now() }); });
    channelRef.current = channel;
    return () => { alive = false; supabase.removeChannel(channel); };
  }, [active]); // eslint-disable-line

  // mark incoming as read
  useEffect(() => {
    const unread = msgs.filter((m) => m.sender_id !== userId && !m.read_at).map((m) => m.id);
    if (unread.length) supabase.from('messages').update({ read_at: new Date().toISOString() }).in('id', unread).then(refreshList);
  }, [msgs]); // eslint-disable-line

  useEffect(() => { bottom.current?.scrollIntoView({ behavior: 'smooth' }); }, [msgs.length, typing]);

  async function send(e) {
    e.preventDefault();
    const body = text.trim();
    if (!body || !active) return;
    setText('');
    const { error } = await supabase.from('messages').insert({ conversation_id: active, sender_id: userId, body });
    if (error) { toast.error('Message not sent.'); setText(body); }
  }

  async function attach(e) {
    const file = e.target.files?.[0]; e.target.value = '';
    if (!file || !active) return;
    if (file.size > MAX_FILE) return toast.error('Files must be under 5 MB.');
    const path = `${userId}/${active}/${Date.now()}-${file.name.replace(/[^\w.-]/g, '_')}`;
    const up = await supabase.storage.from('chat-attachments').upload(path, file);
    if (up.error) return toast.error('Upload failed.');
    const { error } = await supabase.from('messages').insert({ conversation_id: active, sender_id: userId, attachment_path: path, attachment_type: file.type });
    if (error) toast.error('Message not sent.');
  }

  async function openAttachment(path) {
    const { data } = await supabase.storage.from('chat-attachments').createSignedUrl(path, 60);
    if (data?.signedUrl) window.open(data.signedUrl, '_blank', 'noopener');
    else toast.error('You cannot open this file.');
  }

  return (
    <div className="grid h-[calc(100vh-190px)] min-h-[480px] overflow-hidden rounded-xl bg-white shadow-card lg:grid-cols-[320px_1fr]">
      <aside className={`${active ? 'hidden lg:block' : ''} overflow-y-auto border-r border-ink-200`}>
        <h2 className="p-5 text-lg font-bold">Messages</h2>
        {convs.length === 0 && <p className="px-5 text-sm text-ink-600">No conversations yet. Open a teacher profile and tap Message.</p>}
        {convs.map((c) => (
          <button key={c.id} onClick={() => setActive(c.id)} className={`flex w-full items-center gap-3 px-5 py-4 text-left hover:bg-sky-50 ${active === c.id ? 'bg-sky-50' : ''}`}>
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-lavender-100 font-bold">{c.other_name?.[0]}</span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-bold">{c.other_name}</span>
              <span className="block truncate text-xs text-ink-600">{c.last_body || 'Attachment'}</span>
            </span>
            {Number(c.unread) > 0 && <span className="grid h-5 min-w-5 place-items-center rounded-full bg-teal-500 px-1 text-[10px] font-bold text-white">{c.unread}</span>}
          </button>
        ))}
      </aside>

      <section className={`${active ? 'flex' : 'hidden lg:flex'} min-h-0 flex-col`}>
        {!active ? <p className="m-auto text-ink-600">Select a conversation</p> : (
          <>
            <header className="flex items-center gap-3 border-b border-ink-200 p-4">
              <button aria-label="Back" className="lg:hidden" onClick={() => setActive(null)}><HiArrowLeft size={20} /></button>
              <div><p className="font-bold">{other?.other_name}</p><p className="text-xs text-ink-600">{typing ? 'typing…' : online ? 'Online' : 'Offline'}</p></div>
            </header>
            <div className="flex-1 space-y-3 overflow-y-auto bg-sky-50 p-4">
              {msgs.map((m) => {
                const mine = m.sender_id === userId;
                return (
                  <div key={m.id} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[78%] rounded-2xl px-4 py-2.5 text-sm ${mine ? 'bg-navy-900 text-white' : 'bg-white shadow-card'}`}>
                      {m.body && <p className="whitespace-pre-wrap break-words">{m.body}</p>}
                      {m.attachment_path && <button onClick={() => openAttachment(m.attachment_path)} className="flex items-center gap-1 underline"><HiPaperClip /> Attachment</button>}
                      <p className={`mt-1 text-[10px] ${mine ? 'text-white/60' : 'text-ink-400'}`}>{time(m.created_at)}{mine && (m.read_at ? ' · Read' : ' · Sent')}</p>
                    </div>
                  </div>
                );
              })}
              <div ref={bottom} />
            </div>
            <form onSubmit={send} className="flex items-center gap-2 border-t border-ink-200 p-3">
              <label className="grid h-11 w-11 cursor-pointer place-items-center rounded-full bg-sky-50" aria-label="Attach file">
                <HiPaperClip size={20} /><input type="file" className="hidden" onChange={attach} accept="image/*,application/pdf,.doc,.docx" />
              </label>
              <input value={text} maxLength={2000}
                onChange={(e) => { setText(e.target.value); channelRef.current?.send({ type: 'broadcast', event: 'typing', payload: { userId } }); }}
                placeholder="Write a message…" className="h-11 flex-1 rounded-full bg-sky-50 px-5 text-sm outline-none" />
              <button aria-label="Send" className="grid h-11 w-11 place-items-center rounded-full bg-teal-500 text-white"><HiPaperAirplane size={18} /></button>
            </form>
          </>
        )}
      </section>
    </div>
  );
}
