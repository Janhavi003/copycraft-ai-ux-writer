import Link from 'next/link';
import {
  ArrowRight,
  CheckCircle2,
  PenLine,
  ScanText,
  Sparkles,
  Layers,
  Volume2,
  ShieldCheck,
  Zap,
} from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text)] transition-colors">
      {/* Top Simple Nav */}
      <header className="border-b border-line bg-[var(--bg)]/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link href="/" className="focus-ring flex items-center gap-2.5 font-bold tracking-tight text-lg">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-[var(--accent)] text-white shadow-xs">
              <span className="font-bold text-base">C</span>
            </span>
            <span>CopyCraft</span>
          </Link>

          <nav className="flex items-center gap-3">
            <Link
              href="/dashboard"
              className="focus-ring rounded-lg px-3 py-1.5 text-xs font-semibold text-muted hover:text-[var(--text)]"
            >
              Dashboard
            </Link>
            <Link
              href="/patterns"
              className="focus-ring rounded-lg px-3 py-1.5 text-xs font-semibold text-muted hover:text-[var(--text)]"
            >
              Patterns
            </Link>
            <Link
              href="/studio"
              className="focus-ring inline-flex items-center gap-1.5 rounded-lg bg-[var(--accent)] px-4 py-2 text-xs font-bold text-white shadow-xs hover:opacity-90"
            >
              <span>Open Studio</span>
              <ArrowRight size={13} />
            </Link>
          </nav>
        </div>
      </header>

      <main>
        {/* Hero Section */}
        <section className="mx-auto max-w-6xl px-6 py-16 md:py-24">
          <div className="max-w-3xl">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-line bg-[var(--surface)] px-3 py-1 text-xs font-semibold text-[var(--accent)] shadow-xs">
              <Sparkles size={13} />
              <span>AI-Powered UX Writing Workspace</span>
            </div>

            <h1 className="serif text-5xl leading-[1.08] tracking-tight text-[var(--text)] md:text-7xl font-normal">
              Write interfaces people understand.
            </h1>

            <p className="mt-6 max-w-2xl text-lg text-muted leading-relaxed">
              CopyCraft helps product teams craft, audit, compare, and organize interface copy. Generate structured UI microcopy, score it against 7 accessibility heuristics, and iterate with focused precision.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link
                href="/studio"
                className="focus-ring inline-flex min-h-12 items-center gap-2 rounded-xl bg-[var(--accent)] px-6 py-3 text-sm font-bold text-white shadow-md hover:opacity-90 transition active:scale-[0.99]"
              >
                <span>Open Copy Studio</span>
                <ArrowRight size={16} />
              </Link>
              <Link
                href="/dashboard"
                className="focus-ring inline-flex min-h-12 items-center rounded-xl border border-line bg-[var(--surface)] px-6 py-3 text-sm font-bold text-[var(--text)] hover:bg-[var(--surface2)] transition active:scale-[0.99]"
              >
                View Workspace
              </Link>
            </div>

            <div className="mt-8 flex items-center gap-6 text-xs text-muted">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 size={14} className="text-[var(--success)]" />
                <span>Zero fake mockups</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 size={14} className="text-[var(--success)]" />
                <span>Offline Demo Mode</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 size={14} className="text-[var(--success)]" />
                <span>WCAG 2.2 AA heuristics</span>
              </div>
            </div>
          </div>

          {/* Interactive Heuristic Showcase Card */}
          <div className="mt-16 rounded-3xl border border-line bg-[var(--surface)] p-6 md:p-10 shadow-sm">
            <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr] items-center">
              <div>
                <div className="text-xs font-bold uppercase tracking-wider text-[var(--accent)]">
                  Production UX Heuristics in Action
                </div>
                <h2 className="serif mt-2 text-3xl md:text-4xl text-[var(--text)]">
                  High-Stakes Destructive Confirmation
                </h2>
                <p className="mt-2 text-sm text-muted leading-relaxed">
                  Notice how every word performs real work: consequence is disclosed before commitment, the action verb is unambiguous, and secondary exit is guaranteed.
                </p>

                <div className="mt-6 rounded-2xl border border-line bg-[var(--surface2)]/80 p-6 max-w-md shadow-xs">
                  <div className="font-bold text-base text-[var(--text)]">
                    Delete your bank account?
                  </div>
                  <p className="mt-2 text-sm text-muted leading-relaxed">
                    This permanently removes your account and transaction history. This action cannot be undone.
                  </p>
                  <div className="mt-5 flex items-center gap-2.5">
                    <span className="rounded-lg bg-[var(--danger)] px-4 py-2 text-xs font-bold text-white shadow-xs">
                      Delete account
                    </span>
                    <span className="rounded-lg border border-line bg-[var(--surface)] px-4 py-2 text-xs font-semibold text-[var(--text)]">
                      Cancel
                    </span>
                  </div>
                  <p className="mt-3 text-[11px] text-muted">
                    Download tax statements before continuing if needed.
                  </p>
                </div>
              </div>

              <div className="rounded-2xl border border-line bg-[var(--surface2)]/40 p-6 space-y-4">
                <h3 className="font-bold text-sm text-[var(--text)]">Copy Inspector Audit: 94/100</h3>
                <div className="space-y-3 text-xs">
                  <div className="flex items-start gap-2.5">
                    <CheckCircle2 size={16} className="text-[var(--success)] shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-[var(--text)]">Outcome-Oriented Verb</strong>
                      <p className="text-muted mt-0.5">Replaced generic &quot;Proceed&quot; with &quot;Delete account&quot;.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <CheckCircle2 size={16} className="text-[var(--success)] shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-[var(--text)]">Explicit Finality</strong>
                      <p className="text-muted mt-0.5">States that transaction records cannot be restored.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <CheckCircle2 size={16} className="text-[var(--success)] shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-[var(--text)]">Recovery Route</strong>
                      <p className="text-muted mt-0.5">Provides safe, low-contrast Cancel dismiss button.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Pillars Grid */}
          <div className="mt-16 grid gap-5 md:grid-cols-4">
            <div className="rounded-2xl border border-line bg-[var(--surface)] p-6 shadow-xs">
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-[var(--accent)]/10 text-[var(--accent)]">
                <PenLine size={20} />
              </div>
              <h2 className="mt-4 font-bold text-base text-[var(--text)]">Copy Studio</h2>
              <p className="mt-1.5 text-xs text-muted leading-relaxed">
                Generate structured headlines, bodies, and CTAs for buttons, modals, errors, and empty states.
              </p>
            </div>

            <div className="rounded-2xl border border-line bg-[var(--surface)] p-6 shadow-xs">
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-[var(--accent)]/10 text-[var(--accent)]">
                <ScanText size={20} />
              </div>
              <h2 className="mt-4 font-bold text-base text-[var(--text)]">Copy Inspector</h2>
              <p className="mt-1.5 text-xs text-muted leading-relaxed">
                Audit clarity, tone, accessibility, conciseness, specificity, actionability, and confidence.
              </p>
            </div>

            <div className="rounded-2xl border border-line bg-[var(--surface)] p-6 shadow-xs">
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-[var(--accent)]/10 text-[var(--accent)]">
                <Layers size={20} />
              </div>
              <h2 className="mt-4 font-bold text-base text-[var(--text)]">Pattern Library</h2>
              <p className="mt-1.5 text-xs text-muted leading-relaxed">
                Explore 12+ tested blueprints for errors, empty states, permissions, and onboarding flows.
              </p>
            </div>

            <div className="rounded-2xl border border-line bg-[var(--surface)] p-6 shadow-xs">
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-[var(--accent)]/10 text-[var(--accent)]">
                <Volume2 size={20} />
              </div>
              <h2 className="mt-4 font-bold text-base text-[var(--text)]">Brand Voice</h2>
              <p className="mt-1.5 text-xs text-muted leading-relaxed">
                Enforce writing guidelines, personality profiles, and banned vocabulary across your team.
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-line py-8 text-center text-xs text-muted">
        <div className="mx-auto max-w-6xl px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>CopyCraft UX Writing Workspace · Built for precision product teams</div>
          <div className="flex items-center gap-4">
            <Link href="/studio" className="hover:text-[var(--text)]">Studio</Link>
            <Link href="/patterns" className="hover:text-[var(--text)]">Patterns</Link>
            <Link href="/dashboard" className="hover:text-[var(--text)]">Dashboard</Link>
            <Link href="/settings" className="hover:text-[var(--text)]">Settings</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
