export default function Loading() {
  return (
    <div className="grid min-h-[50vh] place-items-center" role="status" aria-label="Loading">
      <div className="h-12 w-12 animate-spin rounded-full border-4 border-sky-100 border-t-teal-500" />
    </div>
  );
}
