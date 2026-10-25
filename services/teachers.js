import { createPublicClient } from '@/lib/supabase/server';

// Marketing sections fail soft (the page still renders); search reports errors so the UI can say so.
export async function getSubjectsWithCounts() {
  try {
    const db = createPublicClient();
    const { data: subjects } = await db.from('subjects').select('id,name,slug,icon').order('name');
    const { data: links } = await db.from('teacher_subjects').select('subject_id');
    const counts = {};
    (links || []).forEach((l) => { counts[l.subject_id] = (counts[l.subject_id] || 0) + 1; });
    return (subjects || []).map((s) => ({ ...s, teacherCount: counts[s.id] || 0 }));
  } catch { return []; }
}

export async function getTopTeachers(limit = 8) {
  try {
    const db = createPublicClient();
    const { data } = await db.from('teacher_cards').select('*')
      .order('is_verified', { ascending: false }).order('rating_avg', { ascending: false }).limit(limit);
    return data || [];
  } catch { return []; }
}

export async function searchTeachers(f = {}) {
  const empty = { teachers: [], total: 0, page: 1, size: 12 };
  try {
    const db = createPublicClient();
    let q = db.from('teacher_cards').select('*', { count: 'exact' });
    if (f.subject) q = q.contains('subjects', [String(f.subject).slice(0, 80)]);
    if (f.city) q = q.ilike('city', `%${String(f.city).replace(/[%_,()]/g, '').slice(0, 60)}%`);
    if (f.mode === 'ONLINE') q = q.eq('offers_online', true);
    if (f.mode === 'PHYSICAL') q = q.eq('offers_physical', true);
    if (f.verified === '1') q = q.eq('is_verified', true);
    if (Number(f.minRating) > 0) q = q.gte('rating_avg', Number(f.minRating));
    if (Number(f.maxPrice) > 0) q = q.lte('hourly_rate', Number(f.maxPrice));
    const sorts = {
      rating: ['rating_avg', false], price_asc: ['hourly_rate', true],
      price_desc: ['hourly_rate', false], experience: ['years_experience', false],
    };
    const [col, asc] = sorts[f.sort] || sorts.rating;
    const page = Math.max(1, Math.min(500, Number(f.page) || 1));
    const size = 12;
    const { data, count, error } = await q.order(col, { ascending: asc, nullsFirst: false }).range((page - 1) * size, page * size - 1);
    if (error) return { ...empty, page, error: true };
    return { teachers: data || [], total: count || 0, page, size };
  } catch { return { ...empty, error: true }; }
}

export async function getPlatformStats() {
  try {
    const db = createPublicClient();
    const [{ count: teachers }, { count: verified }] = await Promise.all([
      db.from('teacher_cards').select('*', { count: 'exact', head: true }),
      db.from('teacher_cards').select('*', { count: 'exact', head: true }).eq('is_verified', true),
    ]);
    return { teachers: teachers || 0, verified: verified || 0 };
  } catch { return { teachers: 0, verified: 0 }; }
}
