// Dependency-free bar chart; values are real wallet data.
export default function EarningsChart({ data }) {
  const max = Math.max(1, ...data.map((d) => Number(d.earned)));
  const total = data.reduce((s, d) => s + Number(d.earned), 0);
  if (!total) return <p className="py-10 text-center text-sm text-ink-600">No earnings in this period yet.</p>;
  return (
    <div>
      <div className="flex h-40 items-end gap-1.5" role="img" aria-label="Daily earnings bar chart">
        {data.map((d) => (
          <div key={d.day} className="group relative flex-1">
            <div className="rounded-t bg-teal-500 transition group-hover:bg-navy-900" style={{ height: `${(Number(d.earned) / max) * 100}%`, minHeight: Number(d.earned) ? 4 : 1 }} />
            <span className="absolute -top-7 left-1/2 hidden -translate-x-1/2 whitespace-nowrap rounded bg-navy-900 px-2 py-1 text-[10px] text-white group-hover:block">
              {d.day.slice(5)}: {Number(d.earned).toLocaleString('en-US')}
            </span>
          </div>
        ))}
      </div>
      <div className="mt-2 flex justify-between text-[10px] text-ink-400"><span>{data[0].day.slice(5)}</span><span>{data[data.length - 1].day.slice(5)}</span></div>
    </div>
  );
}
