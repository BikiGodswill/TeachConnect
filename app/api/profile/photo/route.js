import { NextResponse } from 'next/server';
import { createAuthClient } from '@/lib/supabase/auth-server';
import { createAdminClient } from '@/lib/supabase/admin';

export const runtime = 'nodejs';
const KINDS = { avatar: 'avatar_url', cover: 'cover_url' };
const MAX = 4 * 1024 * 1024; // the browser already shrinks photos; Vercel allows ~4.5 MB bodies

async function who() {
  const { data: { user } } = await createAuthClient().auth.getUser();
  return user;
}
async function ensureBucket(admin) {
  const { data } = await admin.storage.getBucket('avatars');
  if (!data) await admin.storage.createBucket('avatars', { public: true, fileSizeLimit: 5242880, allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp'] });
}
async function cleanup(admin, uid, kind, keep) {
  const { data } = await admin.storage.from('avatars').list(uid, { limit: 100 });
  const old = (data || []).filter((f) => f.name.startsWith(`${kind}-`)).map((f) => `${uid}/${f.name}`).filter((p) => p !== keep);
  if (old.length) await admin.storage.from('avatars').remove(old);
}

export async function POST(req) {
  const user = await who();
  if (!user) return NextResponse.json({ error: 'Please log in again.' }, { status: 401 });
  let form;
  try { form = await req.formData(); } catch { return NextResponse.json({ error: 'The picture was too large or could not be read.' }, { status: 400 }); }
  const kind = String(form.get('kind'));
  const file = form.get('file');
  if (!KINDS[kind]) return NextResponse.json({ error: 'Unknown picture type.' }, { status: 400 });
  if (!file || typeof file === 'string' || !file.size) return NextResponse.json({ error: 'No picture received.' }, { status: 400 });
  if (file.size > MAX) return NextResponse.json({ error: 'That picture is too large. Choose a smaller one.' }, { status: 413 });
  if (!/^image\/(jpeg|png|webp)$/.test(file.type)) return NextResponse.json({ error: 'Choose a JPG, PNG or WebP picture.' }, { status: 415 });

  try {
    const admin = createAdminClient();
    await ensureBucket(admin);
    const ext = file.type === 'image/png' ? 'png' : file.type === 'image/webp' ? 'webp' : 'jpg';
    const path = `${user.id}/${kind}-${Date.now()}.${ext}`;
    const { error: upErr } = await admin.storage.from('avatars').upload(path, Buffer.from(await file.arrayBuffer()), { contentType: file.type, cacheControl: '31536000' });
    if (upErr) throw new Error(`Upload failed: ${upErr.message}`);
    const { data: pub } = admin.storage.from('avatars').getPublicUrl(path);
    const { error } = await admin.from('users').update({ [KINDS[kind]]: pub.publicUrl }).eq('id', user.id);
    if (error) {
      if (/cover_url/.test(error.message)) throw new Error('Cover photos are not enabled yet. Run migration 015_cover_photos.sql in Supabase.');
      throw new Error(error.message);
    }
    await cleanup(admin, user.id, kind, path).catch(() => {});
    return NextResponse.json({ url: pub.publicUrl });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function DELETE(req) {
  const user = await who();
  if (!user) return NextResponse.json({ error: 'Please log in again.' }, { status: 401 });
  const { kind } = await req.json().catch(() => ({}));
  if (!KINDS[kind]) return NextResponse.json({ error: 'Unknown picture type.' }, { status: 400 });
  try {
    const admin = createAdminClient();
    const { error } = await admin.from('users').update({ [KINDS[kind]]: null }).eq('id', user.id);
    if (error) throw new Error(error.message);
    await cleanup(admin, user.id, kind, '').catch(() => {});
    return NextResponse.json({ ok: true });
  } catch (e) { return NextResponse.json({ error: e.message }, { status: 500 }); }
}
