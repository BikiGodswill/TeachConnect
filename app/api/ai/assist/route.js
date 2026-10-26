import { NextResponse } from 'next/server';
import { createAuthClient } from '@/lib/supabase/auth-server';

// AI study / teaching helper. Off unless ANTHROPIC_API_KEY and AI_MODEL are set.
// The key stays on the server; the daily limit is enforced in the database (ai_consume).
const MODES = {
  explain: 'Explain the topic clearly and simply for a school student, with one worked example. Keep it under 250 words.',
  quiz: 'Write 5 short practice questions on the topic, then an answer key at the end.',
  summary: 'Summarise the text into clear bullet points a student can revise from.',
  lesson_plan: 'Draft a one-hour lesson plan for a teacher: objectives, activities with timings, and a short exercise.',
  feedback: 'Suggest constructive, encouraging written feedback a teacher could give on this work. Do not invent a mark.',
};

export async function POST(req) {
  const key = process.env.ANTHROPIC_API_KEY, model = process.env.AI_MODEL;
  if (!key || !model) return NextResponse.json({ error: 'The AI assistant is not switched on yet.' }, { status: 503 });
  const db = createAuthClient();
  const { data: { user } } = await db.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Please log in.' }, { status: 401 });
  const b = await req.json().catch(() => ({}));
  const prompt = String(b.prompt || '').trim().slice(0, 4000);
  const mode = MODES[b.mode] ? b.mode : 'explain';
  if (prompt.length < 3) return NextResponse.json({ error: 'Type a question or topic first.' }, { status: 400 });
  const { data: left, error } = await db.rpc('ai_consume');
  if (error) return NextResponse.json({ error: error.message }, { status: 429 });
  try {
    const r = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-api-key': key, 'anthropic-version': '2023-06-01' },
      body: JSON.stringify({ model, max_tokens: 900, system: `You are a helpful education assistant on Teacher Connect. ${MODES[mode]} Never ask for personal details.`, messages: [{ role: 'user', content: prompt }] }),
    });
    if (!r.ok) return NextResponse.json({ error: 'The assistant could not answer right now. Please try again.' }, { status: 502 });
    const j = await r.json();
    const text = (j.content || []).filter((c) => c.type === 'text').map((c) => c.text).join('\n');
    return NextResponse.json({ text, left });
  } catch {
    return NextResponse.json({ error: 'The assistant could not be reached. Please try again.' }, { status: 502 });
  }
}
