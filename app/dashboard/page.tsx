'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import {
  ArrowRight,
  Plus,
  TrendingUp,
  FolderKanban,
  BookOpen,
  History,
  PenLine,
  Sparkles,
  Volume2,
  CheckCircle2,
} from 'lucide-react';
import { loadStore } from '@/lib/data/store';
import type { AppStore } from '@/types';
import { Badge, Button } from '@/components/ui';

export default function DashboardPage() {
  const [store, setStore] = useState<AppStore | null>(null);

  useEffect(() => {
    setStore(loadStore());

    const handleStoreChange = () => {
      setStore(loadStore());
    };
    window.addEventListener('copycraft-store-change', handleStoreChange);
    return () => window.removeEventListener('copycraft-store-change', handleStoreChange);
  }, []);

  const metrics = useMemo(() => {
    if (!store) return null;

    const totalGenerations = store.generations.length;
    const totalProjects = store.projects.length;
    const totalVoices = store.brandVoices.length;

    const avgScore = totalGenerations > 0
      ? Math.round(store.generations.reduce((acc, g) => acc + g.score, 0) / totalGenerations)
      : 0;

    const highScoring = store.generations.filter(g => g.score >= 90).length;

    return {
      totalGenerations,
      totalProjects,
      totalVoices,
      avgScore,
      highScoring,
    };
  }, [store]);

  if (!store || !metrics) {
    return <div className="py-20 text-center muted">Loading dashboard…</div>;
  }

  const hasGenerations = store.generations.length > 0;
  const hasProjects = store.projects.length > 0;

  return (
    <div className="space-y-8">
      {/* Header & Quick Action Buttons */}
      <header className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between border-b border-line pb-6">
        <div>
          <div className="text-xs font-bold uppercase tracking-[.18em] text-[var(--accent)]">
            Workspace Overview
          </div>
          <h1 className="serif mt-1 text-4xl md:text-5xl font-normal text-[var(--text)]">
            Good copy is a product decision.
          </h1>
          <p className="mt-2 text-sm text-muted max-w-2xl">
            Track interface quality, monitor UX heuristics across products, and craft high-converting copy with built-in accessibility.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Link
            href="/studio"
            className="focus-ring inline-flex min-h-10 items-center justify-center gap-2 rounded-lg bg-[var(--accent)] px-4 py-2 text-sm font-bold text-white shadow-xs hover:opacity-90"
          >
            <Sparkles size={16} />
            <span>New Copy</span>
          </Link>
          <Link
            href="/projects"
            className="focus-ring inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border border-line bg-[var(--surface)] px-4 py-2 text-sm font-bold text-[var(--text)] hover:bg-[var(--surface2)]"
          >
            <FolderKanban size={16} />
            <span>Projects</span>
          </Link>
        </div>
      </header>

      {/* Metrics Row */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-line bg-[var(--surface)] p-5 shadow-xs">
          <div className="text-xs text-muted font-medium">Saved Generations</div>
          <div className="mt-2 text-3xl font-black text-[var(--text)]">
            {metrics.totalGenerations}
          </div>
          <div className="mt-1 text-[11px] text-muted">Active across all projects</div>
        </div>

        <div className="rounded-2xl border border-line bg-[var(--surface)] p-5 shadow-xs">
          <div className="text-xs text-muted font-medium">Average Quality Score</div>
          <div className="mt-2 text-3xl font-black text-[var(--text)]">
            {metrics.avgScore > 0 ? `${metrics.avgScore}/100` : '—'}
          </div>
          <div className="mt-1 text-[11px] text-muted">
            {metrics.highScoring} piece{metrics.highScoring === 1 ? '' : 's'} scoring 90+
          </div>
        </div>

        <div className="rounded-2xl border border-line bg-[var(--surface)] p-5 shadow-xs">
          <div className="text-xs text-muted font-medium">Active Projects</div>
          <div className="mt-2 text-3xl font-black text-[var(--text)]">
            {metrics.totalProjects}
          </div>
          <div className="mt-1 text-[11px] text-muted">Repositories configured</div>
        </div>

        <div className="rounded-2xl border border-line bg-[var(--surface)] p-5 shadow-xs">
          <div className="text-xs text-muted font-medium">Brand Voices</div>
          <div className="mt-2 text-3xl font-black text-[var(--text)]">
            {metrics.totalVoices}
          </div>
          <div className="mt-1 text-[11px] text-muted">Tone profiles active</div>
        </div>
      </div>

      {/* Quick Launch Cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Link
          href="/studio"
          className="focus-ring group rounded-2xl border border-line bg-[var(--surface)] p-5 shadow-xs transition hover:border-[var(--accent)]/40 hover:shadow-md"
        >
          <div className="flex items-center justify-between">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-[var(--accent)]/10 text-[var(--accent)]">
              <PenLine size={20} />
            </div>
            <ArrowRight size={16} className="text-muted group-hover:text-[var(--accent)] transition" />
          </div>
          <h2 className="mt-4 font-bold text-base text-[var(--text)]">Copy Studio</h2>
          <p className="mt-1 text-xs text-muted leading-relaxed">
            Generate, analyze, and apply focused improvements to microcopy.
          </p>
        </Link>

        <Link
          href="/patterns"
          className="focus-ring group rounded-2xl border border-line bg-[var(--surface)] p-5 shadow-xs transition hover:border-[var(--accent)]/40 hover:shadow-md"
        >
          <div className="flex items-center justify-between">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-[var(--accent)]/10 text-[var(--accent)]">
              <BookOpen size={20} />
            </div>
            <ArrowRight size={16} className="text-muted group-hover:text-[var(--accent)] transition" />
          </div>
          <h2 className="mt-4 font-bold text-base text-[var(--text)]">Pattern Library</h2>
          <p className="mt-1 text-xs text-muted leading-relaxed">
            Browse tested UX patterns for errors, modals, empty states and more.
          </p>
        </Link>

        <Link
          href="/brand-voice"
          className="focus-ring group rounded-2xl border border-line bg-[var(--surface)] p-5 shadow-xs transition hover:border-[var(--accent)]/40 hover:shadow-md"
        >
          <div className="flex items-center justify-between">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-[var(--accent)]/10 text-[var(--accent)]">
              <Volume2 size={20} />
            </div>
            <ArrowRight size={16} className="text-muted group-hover:text-[var(--accent)] transition" />
          </div>
          <h2 className="mt-4 font-bold text-base text-[var(--text)]">Brand Voice</h2>
          <p className="mt-1 text-xs text-muted leading-relaxed">
            Define personality traits, writing rules, and banned vocabulary.
          </p>
        </Link>
      </div>

      {/* Main Dashboard Two-Column Split */}
      <div className="grid gap-6 lg:grid-cols-[1.3fr_0.9fr]">
        {/* Left Column: Recent Copy */}
        <section
          aria-labelledby="recent-copy-heading"
          className="rounded-2xl border border-line bg-[var(--surface)] p-6 shadow-xs flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between border-b border-line pb-4">
              <div>
                <h2 id="recent-copy-heading" className="font-bold text-lg text-[var(--text)]">
                  Recent Copy
                </h2>
                <p className="text-xs text-muted">Latest outputs generated or saved</p>
              </div>
              <Link
                href="/history"
                className="focus-ring inline-flex items-center gap-1 text-xs font-bold text-[var(--accent)] hover:underline"
              >
                <span>View All History</span>
                <ArrowRight size={13} />
              </Link>
            </div>

            {hasGenerations ? (
              <div className="divide-y divide-[var(--line)]">
                {store.generations.slice(0, 5).map(g => (
                  <div
                    key={g.id}
                    className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between py-4 group"
                  >
                    <div className="min-w-0 pr-4">
                      <Link
                        href={`/studio?generationId=${g.id}`}
                        className="focus-ring font-semibold text-sm text-[var(--text)] group-hover:text-[var(--accent)] transition line-clamp-1"
                      >
                        {g.headline}
                      </Link>
                      <div className="mt-1 flex items-center gap-2 text-xs text-muted">
                        <Badge variant="default">{g.component}</Badge>
                        <span>{g.product}</span>
                        <span>·</span>
                        <span>{g.createdAt}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <Badge variant={g.score >= 90 ? 'success' : 'default'}>
                        {g.score}/100
                      </Badge>
                      <Link
                        href={`/studio?generationId=${g.id}`}
                        className="focus-ring inline-flex items-center gap-1 rounded-lg border border-line bg-[var(--surface)] px-2.5 py-1 text-xs font-semibold text-muted hover:text-[var(--text)] hover:bg-[var(--surface2)]"
                      >
                        <PenLine size={12} />
                        <span>Edit</span>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-12 text-center">
                <p className="text-sm text-muted">No copy generated in this workspace yet.</p>
                <div className="mt-4">
                  <Link
                    href="/studio"
                    className="focus-ring inline-flex items-center gap-2 rounded-lg bg-[var(--accent)] px-4 py-2 text-sm font-bold text-white shadow-xs"
                  >
                    <Sparkles size={16} />
                    <span>Create Your First Copy</span>
                  </Link>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Right Column: Project Quality Health */}
        <section
          aria-labelledby="project-health-heading"
          className="rounded-2xl border border-line bg-[var(--surface)] p-6 shadow-xs flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between border-b border-line pb-4">
              <div className="flex items-center gap-2">
                <TrendingUp size={18} className="text-[var(--accent)]" />
                <h2 id="project-health-heading" className="font-bold text-lg text-[var(--text)]">
                  Project Quality Health
                </h2>
              </div>
              <Link
                href="/projects"
                className="focus-ring text-xs font-bold text-[var(--accent)] hover:underline"
              >
                All Projects →
              </Link>
            </div>

            <p className="mt-3 text-xs text-muted leading-relaxed">
              Monitors heuristic compliance across all product repositories. High-scoring projects have specific, plain-language CTAs.
            </p>

            {hasProjects ? (
              <div className="mt-5 space-y-3.5">
                {store.projects.map(p => (
                  <Link
                    key={p.id}
                    href={`/projects/${p.id}`}
                    className="focus-ring block rounded-xl border border-line bg-[var(--surface2)]/40 p-3.5 transition hover:border-[var(--accent)]/30 hover:bg-[var(--surface2)]"
                  >
                    <div className="flex items-center justify-between gap-3 text-xs">
                      <span className="font-bold text-sm text-[var(--text)] truncate">{p.name}</span>
                      <strong className="text-[var(--text)]">
                        {p.avgScore ? `${p.avgScore}/100` : '—'}
                      </strong>
                    </div>

                    <div className="mt-2.5 h-1.5 w-full overflow-hidden rounded-full bg-[var(--line)]">
                      <div
                        className={`h-full rounded-full transition-all ${
                          p.avgScore >= 90
                            ? 'bg-[var(--success)]'
                            : p.avgScore >= 75
                            ? 'bg-[var(--accent)]'
                            : 'bg-[var(--warn)]'
                        }`}
                        style={{ width: `${Math.min(100, Math.max(0, p.avgScore))}%` }}
                      />
                    </div>

                    <div className="mt-2 flex items-center justify-between text-[11px] text-muted">
                      <span>{p.copyCount} saved item{p.copyCount === 1 ? '' : 's'}</span>
                      <span>Audience: {p.audience}</span>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="py-12 text-center">
                <p className="text-sm text-muted">No projects in this workspace yet.</p>
                <div className="mt-4">
                  <Link
                    href="/projects"
                    className="focus-ring inline-flex items-center gap-2 rounded-lg bg-[var(--surface2)] border border-line px-4 py-2 text-sm font-bold text-[var(--text)]"
                  >
                    <Plus size={16} />
                    <span>Create Project</span>
                  </Link>
                </div>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
