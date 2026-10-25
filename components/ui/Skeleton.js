export function Skeleton({ className = '' }) {
  return <div className={`skeleton rounded-md ${className}`} aria-hidden />;
}

export function CardSkeleton() {
  return (
    <div className="card overflow-hidden" aria-hidden>
      <Skeleton className="h-44 rounded-none" />
      <div className="space-y-3 p-5">
        <Skeleton className="h-5 w-2/3" /><Skeleton className="h-4 w-full" /><Skeleton className="h-4 w-1/2" />
        <div className="flex justify-between pt-3"><Skeleton className="h-6 w-24" /><Skeleton className="h-10 w-28 rounded-full" /></div>
      </div>
    </div>
  );
}

export function PageSkeleton({ cards = 3 }) {
  return (
    <div role="status" aria-label="Loading" className="space-y-6">
      <Skeleton className="h-9 w-56" />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{Array.from({ length: cards }).map((_, i) => <CardSkeleton key={i} />)}</div>
    </div>
  );
}
