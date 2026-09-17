'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import {
  Search,
  Trash2,
  PenLine,
  History,
  Filter,
  ArrowUpDown,
  Sparkles,
} from 'lucide-react';
import {
  Button,
  CopyButton,
  Input,
  Select,
  Badge,
  Modal,
  Notice,
} from '@/components/ui';
import { loadStore, saveStore, deleteGeneration } from '@/lib/data/store';
import type { AppStore, ComponentType, CopyGeneration } from '@/types';

export default function HistoryPage() {
  const [store, setStore] = useState<AppStore | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedComponent, setSelectedComponent] = useState<string>('All');
  const [selectedProject, setSelectedProject] = useState<string>('All');
  const [sortBy, setSortBy] = useState<'newest' | 'score-high' | 'score-low'>('newest');

  const [deleteCandidate, setDeleteCandidate] = useState<CopyGeneration | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    setStore(loadStore());
  }, []);

  const componentsList = useMemo(() => {
    if (!store) return [];
    const set = new Set(store.generations.map(g => g.component));
    return Array.from(set);
  }, [store]);

  const projectsList = useMemo(() => {
    if (!store) return [];
    return store.projects;
  }, [store]);

  const filteredList = useMemo(() => {
    if (!store) return [];

    return store.generations
      .filter(g => {
        const query = searchQuery.toLowerCase();
        const matchesQuery =
          !query ||
          g.headline.toLowerCase().includes(query) ||
          g.body.toLowerCase().includes(query) ||
          g.component.toLowerCase().includes(query) ||
          g.product.toLowerCase().includes(query) ||
          (g.projectName && g.projectName.toLowerCase().includes(query));

        const matchesComponent =
          selectedComponent === 'All' || g.component === selectedComponent;

        const matchesProject =
          selectedProject === 'All' ||
          (selectedProject === 'none' ? !g.projectId : g.projectId === selectedProject);

        return matchesQuery && matchesComponent && matchesProject;
      })
      .sort((a, b) => {
        if (sortBy === 'score-high') return b.score - a.score;
        if (sortBy === 'score-low') return a.score - b.score;
        return 0; // default preserves store newest-first order
      });
  }, [store, searchQuery, selectedComponent, selectedProject, sortBy]);

  function confirmDelete() {
    if (!store || !deleteCandidate) return;
    const nextStore = deleteGeneration(store, deleteCandidate.id);
    saveStore(nextStore);
    setStore(nextStore);
    setNotice(`Deleted "${deleteCandidate.headline}" from history.`);
    setDeleteCandidate(null);
  }

  if (!store) {
    return <div className="py-20 text-center muted">Loading history…</div>;
  }

  const hasGenerations = store.generations.length > 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <header className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between border-b border-line pb-6">
        <div>
          <div className="text-xs font-bold uppercase tracking-[.18em] text-[var(--accent)]">
            Workspace Archive
          </div>
          <h1 className="serif mt-1 text-4xl md:text-5xl font-normal text-[var(--text)]">
            Generation History
          </h1>
          <p className="mt-2 text-sm text-muted max-w-2xl">
            Review, search, and reload previously crafted interface copy. Every saved piece retains its heuristic scores and project context.
          </p>
        </div>

        <Link
          href="/studio"
          className="focus-ring inline-flex min-h-10 items-center justify-center gap-2 rounded-lg bg-[var(--accent)] px-4 py-2 text-sm font-bold text-white shadow-xs hover:opacity-90"
        >
          <Sparkles size={16} />
          <span>New Copy</span>
        </Link>
      </header>

      {notice ? (
        <Notice kind="success" onClose={() => setNotice(null)}>
          {notice}
        </Notice>
      ) : null}

      {/* Filter and Search Bar */}
      {hasGenerations ? (
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 muted" size={16} />
            <Input
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search by headline, body, product or project…"
              className="pl-10"
              aria-label="Search saved copy"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Select
              value={selectedComponent}
              onChange={e => setSelectedComponent(e.target.value)}
              className="w-40 text-xs"
              aria-label="Filter by component"
            >
              <option value="All">All Components</option>
              {componentsList.map(c => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </Select>

            <Select
              value={selectedProject}
              onChange={e => setSelectedProject(e.target.value)}
              className="w-40 text-xs"
              aria-label="Filter by project"
            >
              <option value="All">All Projects</option>
              <option value="none">No Project</option>
              {projectsList.map(p => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </Select>

            <Select
              value={sortBy}
              onChange={e => setSortBy(e.target.value as 'newest' | 'score-high' | 'score-low')}
              className="w-36 text-xs"
              aria-label="Sort order"
            >
              <option value="newest">Newest First</option>
              <option value="score-high">Highest Score</option>
              <option value="score-low">Lowest Score</option>
            </Select>
          </div>
        </div>
      ) : null}

      {/* List */}
      {filteredList.length > 0 ? (
        <div className="space-y-4">
          {filteredList.map(g => (
            <article
              key={g.id}
              className="rounded-2xl border border-line bg-[var(--surface)] p-5 md:p-6 shadow-xs transition hover:border-[var(--accent)]/30"
            >
              <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between border-b border-line pb-4">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="accent">{g.component}</Badge>
                    {g.projectName ? (
                      <Link
                        href={`/projects/${g.projectId}`}
                        className="focus-ring inline-flex items-center rounded-full border border-line bg-[var(--surface2)] px-2.5 py-0.5 text-xs font-semibold text-muted hover:text-[var(--text)]"
                      >
                        {g.projectName}
                      </Link>
                    ) : null}
                    <span className="text-xs text-muted">
                      {g.product} · {g.createdAt}
                    </span>
                  </div>

                  <h2 className="serif mt-2.5 text-2xl font-semibold text-[var(--text)]">
                    {g.headline}
                  </h2>
                </div>

                <div className="flex items-center gap-2">
                  <Badge variant={g.score >= 90 ? 'success' : 'default'}>
                    Score: {g.score}/100
                  </Badge>
                  <Link
                    href={`/studio?generationId=${g.id}`}
                    className="focus-ring inline-flex items-center gap-1 rounded-lg border border-line bg-[var(--surface)] px-3 py-1.5 text-xs font-semibold text-[var(--text)] hover:bg-[var(--surface2)]"
                  >
                    <PenLine size={13} />
                    <span>Continue in Studio</span>
                  </Link>
                  <CopyButton
                    text={[
                      g.headline,
                      g.body,
                      `Primary: ${g.primaryAction}`,
                      g.secondaryAction ? `Secondary: ${g.secondaryAction}` : '',
                    ]
                      .filter(Boolean)
                      .join('\n\n')}
                    label="Copy"
                  />
                  <button
                    type="button"
                    onClick={() => setDeleteCandidate(g)}
                    className="focus-ring rounded-lg p-2 text-muted hover:bg-[var(--danger)]/10 hover:text-[var(--danger)]"
                    aria-label={`Delete ${g.headline}`}
                    title="Delete copy"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              <div className="mt-4 grid gap-4 lg:grid-cols-[1fr_auto] items-center">
                <p className="text-sm leading-relaxed text-[var(--text)]/80 max-w-3xl">
                  {g.body}
                </p>
                <div className="flex items-center gap-2">
                  <span className="rounded-lg bg-[var(--surface2)] border border-line px-3 py-1.5 text-xs font-bold text-[var(--text)]">
                    {g.primaryAction}
                  </span>
                  {g.secondaryAction ? (
                    <span className="rounded-lg bg-[var(--surface2)] border border-line px-3 py-1.5 text-xs text-muted font-medium">
                      {g.secondaryAction}
                    </span>
                  ) : null}
                </div>
              </div>
            </article>
          ))}
        </div>
      ) : hasGenerations ? (
        <div className="rounded-2xl border border-dashed border-line bg-[var(--surface)] p-12 text-center">
          <p className="text-sm text-muted">No saved copy matches your current search or filters.</p>
          <div className="mt-4">
            <Button
              variant="secondary"
              onClick={() => {
                setSearchQuery('');
                setSelectedComponent('All');
                setSelectedProject('All');
              }}
            >
              Reset Filters
            </Button>
          </div>
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-line bg-[var(--surface)] p-12 text-center">
          <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-[var(--surface2)] text-muted">
            <History size={24} />
          </div>
          <h2 className="mt-4 font-bold text-lg text-[var(--text)]">No saved copy yet</h2>
          <p className="mt-1 text-sm text-muted max-w-sm mx-auto">
            When you create or inspect copy in Copy Studio, click &quot;Save&quot; to keep it here in your local archive.
          </p>
          <div className="mt-5">
            <Link
              href="/studio"
              className="focus-ring inline-flex items-center gap-2 rounded-lg bg-[var(--accent)] px-4 py-2 text-sm font-bold text-white shadow-xs"
            >
              <Sparkles size={16} />
              <span>Open Copy Studio</span>
            </Link>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteCandidate ? (
        <Modal
          open={Boolean(deleteCandidate)}
          onClose={() => setDeleteCandidate(null)}
          title="Delete Saved Copy?"
          description={`Permanently remove "${deleteCandidate.headline}" from workspace history?`}
        >
          <div className="flex items-center justify-end gap-3 pt-4">
            <Button variant="secondary" onClick={() => setDeleteCandidate(null)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={confirmDelete}>
              <Trash2 size={16} />
              <span>Delete</span>
            </Button>
          </div>
        </Modal>
      ) : null}
    </div>
  );
}
