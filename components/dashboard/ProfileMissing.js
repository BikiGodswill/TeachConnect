import Link from 'next/link';
export default function ProfileMissing() {
  return (
    <div className="mx-auto my-24 max-w-md rounded-xl bg-white p-10 text-center shadow-float">
      <h1 className="text-2xl font-extrabold">Your profile is not set up yet</h1>
      <p className="mt-2 text-ink-600">You are signed in, but your account has no profile record. This usually means the database migrations have not all been applied. Ask the site owner to run every file in supabase/migrations in order, then sign in again.</p>
      <Link href="/" className="btn-ghost mt-6">Go home</Link>
    </div>
  );
}
