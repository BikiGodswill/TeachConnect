// A learner is identified by (studentId, childId). In URLs: "<studentId>" or "<studentId>~<childId>".
const UUID = /^[0-9a-f-]{36}$/i;
export const learnerKey = (studentId, childId) => (childId ? `${studentId}~${childId}` : studentId);
export function parseLearnerKey(key) {
  const [s, c] = String(key || '').split('~');
  if (!UUID.test(s || '') || (c && !UUID.test(c))) return null;
  return { studentId: s, childId: c || null };
}

export const SAFE_FILE = /^(image\/|application\/pdf|text\/plain|application\/vnd\.openxmlformats|application\/msword)/;
export const MAX_FILE = 10 * 1024 * 1024;

// path convention enforced by storage policies: <assignmentId>/<teacher|student>/<file>
export async function uploadLearningFile(supabase, assignmentId, side, file) {
  if (file.size > MAX_FILE) throw new Error('Files must be under 10 MB.');
  if (!SAFE_FILE.test(file.type)) throw new Error('Upload an image, PDF, text or Word file.');
  const path = `${assignmentId}/${side}/${Date.now()}-${file.name.replace(/[^\w.-]/g, '_')}`;
  const { error } = await supabase.storage.from('learning-files').upload(path, file);
  if (error) throw new Error('Upload failed. Please try again.');
  return path;
}

export async function openLearningFile(supabase, path) {
  const { data, error } = await supabase.storage.from('learning-files').createSignedUrl(path, 120);
  if (error || !data?.signedUrl) throw new Error('Could not open the file.');
  window.open(data.signedUrl, '_blank', 'noopener,noreferrer');
}
