'use client';
import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { HiCamera, HiTrash } from 'react-icons/hi2';
import Avatar from '@/components/ui/Avatar';

const MAX_INPUT = 15 * 1024 * 1024;

// Centre-crops to the target ratio and shrinks, so uploads are small even from a phone camera.
async function toJpeg(file, w, h) {
  const bmp = await createImageBitmap(file);
  const scale = Math.max(w / bmp.width, h / bmp.height);
  const sw = w / scale, sh = h / scale;
  const canvas = document.createElement('canvas');
  canvas.width = w; canvas.height = h;
  canvas.getContext('2d').drawImage(bmp, (bmp.width - sw) / 2, (bmp.height - sh) / 2, sw, sh, 0, 0, w, h);
  bmp.close?.();
  const blob = await new Promise((res) => canvas.toBlob(res, 'image/jpeg', 0.85));
  if (!blob) throw new Error('This picture could not be processed.');
  return blob;
}

/** Facebook-style header: cover banner with the profile picture overlapping its bottom-left corner. */
export default function AvatarUploader({ name, url, coverUrl }) {
  const router = useRouter();
  const avatarIn = useRef(null);
  const coverIn = useRef(null);
  const [busy, setBusy] = useState('');
  const [avatar, setAvatar] = useState(url || null);
  const [cover, setCover] = useState(coverUrl || null);

  async function upload(kind, e) {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    if (file.type && !/^image\//i.test(file.type)) return toast.error('Please choose a picture (JPG, PNG or WebP).');
    if (file.size > MAX_INPUT) return toast.error('That picture is too large. Choose one under 15 MB.');
    setBusy(kind);
    try {
      let blob;
      try { blob = kind === 'avatar' ? await toJpeg(file, 600, 600) : await toJpeg(file, 1500, 500); }
      catch { throw new Error('This picture format is not supported. Try a JPG or PNG.'); }
      const fd = new FormData();
      fd.append('kind', kind);
      fd.append('file', new File([blob], `${kind}.jpg`, { type: 'image/jpeg' }));
      const res = await fetch('/api/profile/photo', { method: 'POST', body: fd });
      const j = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(j.error || 'Upload failed. Please try again.');
      (kind === 'avatar' ? setAvatar : setCover)(j.url);
      toast.success(kind === 'avatar' ? 'Profile picture updated.' : 'Cover photo updated.');
      router.refresh();
    } catch (err) { toast.error(err.message || 'Upload failed. Please try again.'); }
    setBusy('');
  }

  async function remove(kind) {
    if (!confirm(kind === 'avatar' ? 'Remove your profile picture?' : 'Remove your cover photo?')) return;
    setBusy(kind);
    const res = await fetch('/api/profile/photo', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ kind }) });
    if (!res.ok) toast.error((await res.json().catch(() => ({}))).error || 'Could not remove it.');
    else { (kind === 'avatar' ? setAvatar : setCover)(null); router.refresh(); }
    setBusy('');
  }

  const accept = 'image/jpeg,image/png,image/webp,image/heic,image/heif';
  return (
    <section className="card overflow-hidden">
      <div className="relative h-40 bg-gradient-to-br from-navy-900 via-teal-600 to-lavender-500 sm:h-56">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        {cover && <img src={cover} alt="Cover photo" className="h-full w-full object-cover" />}
        {busy === 'cover' && <span className="absolute inset-0 grid place-items-center bg-white/60 text-sm font-bold">Saving…</span>}
        <div className="absolute bottom-3 right-3 flex gap-2">
          <button type="button" disabled={!!busy} onClick={() => coverIn.current?.click()} className="flex h-9 items-center gap-2 rounded-md bg-white/95 px-3 text-xs font-bold shadow-card disabled:opacity-60">
            <HiCamera size={16} /> {cover ? 'Edit cover photo' : 'Add cover photo'}
          </button>
          {cover && <button type="button" aria-label="Remove cover photo" disabled={!!busy} onClick={() => remove('cover')} className="grid h-9 w-9 place-items-center rounded-md bg-white/95 shadow-card disabled:opacity-60"><HiTrash size={16} /></button>}
        </div>
        <input ref={coverIn} type="file" accept={accept} onChange={(e) => upload('cover', e)} className="sr-only" aria-label="Choose a cover photo" />
      </div>
      <div className="flex flex-wrap items-end gap-4 px-5 pb-5 sm:px-8">
        <div className="relative -mt-14 sm:-mt-16">
          <div className="rounded-full border-4 border-white bg-white shadow-card"><Avatar url={avatar} name={name} size={120} /></div>
          {busy === 'avatar' && <span className="absolute inset-0 grid place-items-center rounded-full bg-white/70 text-xs font-bold">Saving…</span>}
          <button type="button" aria-label="Change profile picture" disabled={!!busy} onClick={() => avatarIn.current?.click()}
            className="absolute bottom-1 right-1 grid h-9 w-9 place-items-center rounded-full bg-ink-100 shadow-card ring-2 ring-white transition hover:bg-ink-200 disabled:opacity-60"><HiCamera size={18} /></button>
          <input ref={avatarIn} type="file" accept={accept} onChange={(e) => upload('avatar', e)} className="sr-only" aria-label="Choose a profile picture" />
        </div>
        <div className="min-w-0 flex-1 pb-1">
          <h2 className="truncate text-2xl font-extrabold">{name}</h2>
          <p className="text-xs text-ink-600">A clear photo of your face builds trust. JPG, PNG or WebP.</p>
        </div>
        {avatar && <button type="button" disabled={!!busy} onClick={() => remove('avatar')} className="btn-ghost h-10 px-4 text-xs disabled:opacity-60"><HiTrash size={16} /> Remove picture</button>}
      </div>
    </section>
  );
}
