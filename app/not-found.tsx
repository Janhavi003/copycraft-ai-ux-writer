import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="mx-auto max-w-xl px-6 py-24 text-center">
      <div className="text-xs font-bold uppercase tracking-wider text-[var(--accent)]">404 Error</div>
      <h1 className="serif mt-3 text-5xl font-normal text-[var(--text)]">Page Not Found</h1>
      <p className="mt-3 text-sm text-muted">
        The interface copy or workspace route you requested does not exist or has been relocated.
      </p>
      <div className="mt-8 flex justify-center gap-3">
        <Link
          href="/dashboard"
          className="focus-ring rounded-lg bg-[var(--accent)] px-4 py-2 text-sm font-bold text-white shadow-xs"
        >
          Go to Dashboard
        </Link>
        <Link
          href="/studio"
          className="focus-ring rounded-lg border border-line bg-[var(--surface)] px-4 py-2 text-sm font-bold text-[var(--text)] hover:bg-[var(--surface2)]"
        >
          Open Copy Studio
        </Link>
      </div>
    </main>
  );
}
