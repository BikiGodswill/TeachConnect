import AiAssistant from '@/components/learning/AiAssistant';

export const metadata = { title: 'AI teaching tools — Teacher Connect' };

export default function Assistant() {
  const enabled = !!process.env.ANTHROPIC_API_KEY && !!process.env.AI_MODEL;
  return (
    <div className="max-w-2xl space-y-6">
      <h1 className="text-3xl font-extrabold">AI teaching tools</h1>
      <AiAssistant role="teacher" enabled={enabled} />
    </div>
  );
}
