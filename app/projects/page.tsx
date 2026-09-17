'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import {
  Plus,
  ArrowRight,
  Search,
  FolderKanban,
  Trash2,
  Edit2,
  SlidersHorizontal,
  PenLine,
} from 'lucide-react';
import {
  Button,
  Field,
  Input,
  Select,
  Textarea,
  Modal,
  Badge,
  Notice,
} from '@/components/ui';
import { loadStore, saveStore, upsertProject, deleteProject } from '@/lib/data/store';
import type { AppStore, Audience, Project } from '@/types';

const audiences: Audience[] = [
  'General',
  'Consumers',
  'Developers',
  'Designers',
  'Business',
  'Enterprise',
];

export default function ProjectsPage() {
  const [store, setStore] = useState<AppStore | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAudience, setSelectedAudience] = useState<string>('All');
  const [selectedStatus, setSelectedStatus] = useState<string>('All');

  // Create / Edit Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [product, setProduct] = useState('');
  const [team, setTeam] = useState('');
  const [audience, setAudience] = useState<Audience>('General');
  const [brandVoiceId, setBrandVoiceId] = useState('');
  const [guidelinesText, setGuidelinesText] = useState('');
  const [status, setStatus] = useState<'Active' | 'In Review' | 'Archived'>('Active');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState<string | null>(null);

  // Delete Confirmation State
  const [deleteCandidate, setDeleteCandidate] = useState<Project | null>(null);

  useEffect(() => {
    setStore(loadStore());
  }, []);

  function openCreateModal() {
    setEditingProject(null);
    setName('');
    setDescription('');
    setProduct('');
    setTeam('');
    setAudience('General');
    setBrandVoiceId(store?.defaultVoiceId || 'pulse');
    setGuidelinesText('• Use clear, plain language\n• Always explain consequences\n• Use active verbs');
    setStatus('Active');
    setError('');
    setModalOpen(true);
  }

  function openEditModal(p: Project, e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    setEditingProject(p);
    setName(p.name);
    setDescription(p.description);
    setProduct(p.product || '');
    setTeam(p.team || '');
    setAudience(p.audience);
    setBrandVoiceId(p.brandVoiceId || '');
    setGuidelinesText(p.guidelines.join('\n'));
    setStatus(p.status || 'Active');
    setError('');
    setModalOpen(true);
  }

  function handleSaveProject() {
    if (!store) return;
    if (name.trim().length < 2) {
      setError('Please provide a project name with at least 2 characters.');
      return;
    }

    const guidelines = guidelinesText
      .split('\n')
      .map(l => l.replace(/^[•\-\*]\s*/, '').trim())
      .filter(Boolean);

    const now = new Date().toISOString().split('T')[0];

    const projectData: Project = {
      id: editingProject ? editingProject.id : crypto.randomUUID(),
      name: name.trim(),
      description: description.trim() || 'Product interface copy repository.',
      product: product.trim() || name.trim(),
      team: team.trim() || 'Product Team',
      audience,
      brandVoiceId: brandVoiceId || undefined,
      status,
      guidelines: guidelines.length > 0 ? guidelines : ['Use plain, direct interface language.'],
      copyCount: editingProject ? editingProject.copyCount : 0,
      avgScore: editingProject ? editingProject.avgScore : 0,
      createdAt: editingProject ? editingProject.createdAt : now,
      updatedAt: 'Just now',
    };

    const nextStore = upsertProject(store, projectData);
    saveStore(nextStore);
    setStore(nextStore);
    setModalOpen(false);
    setNotice(editingProject ? `Updated project: ${projectData.name}` : `Created project: ${projectData.name}`);
  }

  function handleDelete(p: Project, e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    setDeleteCandidate(p);
  }

  function confirmDelete() {
    if (!store || !deleteCandidate) return;
    const nextStore = deleteProject(store, deleteCandidate.id);
    saveStore(nextStore);
    setStore(nextStore);
    setNotice(`Deleted project: ${deleteCandidate.name}`);
    setDeleteCandidate(null);
  }

  const filteredProjects = useMemo(() => {
    if (!store) return [];
    return store.projects.filter(p => {
      const matchesQuery =
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.product && p.product.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (p.team && p.team.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesAudience = selectedAudience === 'All' || p.audience === selectedAudience;
      const matchesStatus = selectedStatus === 'All' || p.status === selectedStatus;

      return matchesQuery && matchesAudience && matchesStatus;
    });
  }, [store, searchQuery, selectedAudience, selectedStatus]);

  if (!store) {
    return <div className="py-20 text-center muted">Loading projects…</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <header className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between border-b border-line pb-6">
        <div>
          <div className="text-xs font-bold uppercase tracking-[.18em] text-[var(--accent)]">
            Product Repositories
          </div>
          <h1 className="serif mt-1 text-4xl md:text-5xl font-normal text-[var(--text)]">
            Projects
          </h1>
          <p className="mt-2 text-sm text-muted max-w-2xl">
            Keep interface copy organized by product experience. Attach writing guidelines, track overall quality scores, and maintain team consistency.
          </p>
        </div>

        <Button variant="primary" onClick={openCreateModal}>
          <Plus size={16} />
          <span>New Project</span>
        </Button>
      </header>

      {notice ? (
        <Notice kind="success" onClose={() => setNotice(null)}>
          {notice}
        </Notice>
      ) : null}

      {/* Filter and Search Bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 muted" size={16} />
          <Input
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search projects by name, product, or team…"
            className="pl-10"
            aria-label="Search projects"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Select
            value={selectedAudience}
            onChange={e => setSelectedAudience(e.target.value)}
            className="w-40 text-xs"
            aria-label="Filter by audience"
          >
            <option value="All">All Audiences</option>
            {audiences.map(a => (
              <option key={a} value={a}>
                {a}
              </option>
            ))}
          </Select>

          <Select
            value={selectedStatus}
            onChange={e => setSelectedStatus(e.target.value)}
            className="w-36 text-xs"
            aria-label="Filter by status"
          >
            <option value="All">All Statuses</option>
            <option value="Active">Active</option>
            <option value="In Review">In Review</option>
            <option value="Archived">Archived</option>
          </Select>
        </div>
      </div>

      {/* Projects Grid */}
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {filteredProjects.map(p => (
          <div
            key={p.id}
            className="group relative rounded-2xl border border-line bg-[var(--surface)] p-6 shadow-xs transition hover:border-[var(--accent)]/40 hover:shadow-md flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2">
                  <div className="grid h-9 w-9 place-items-center rounded-xl bg-[var(--surface2)] text-[var(--accent)]">
                    <FolderKanban size={18} />
                  </div>
                  <div>
                    <h2 className="font-bold text-base text-[var(--text)] group-hover:text-[var(--accent)] transition">
                      <Link href={`/projects/${p.id}`} className="focus-ring rounded-sm">
                        {p.name}
                      </Link>
                    </h2>
                    <span className="text-xs text-muted block">{p.product || 'Interface'}</span>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <Badge variant={p.status === 'Active' ? 'success' : 'default'}>
                    {p.status || 'Active'}
                  </Badge>
                  <button
                    type="button"
                    onClick={e => openEditModal(p, e)}
                    className="focus-ring rounded-lg p-1.5 text-muted hover:bg-[var(--surface2)] hover:text-[var(--text)]"
                    aria-label={`Edit ${p.name}`}
                    title="Edit project"
                  >
                    <Edit2 size={14} />
                  </button>
                  <button
                    type="button"
                    onClick={e => handleDelete(p, e)}
                    className="focus-ring rounded-lg p-1.5 text-muted hover:bg-[var(--danger)]/10 hover:text-[var(--danger)]"
                    aria-label={`Delete ${p.name}`}
                    title="Delete project"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>

              <p className="mt-3.5 text-sm leading-relaxed text-muted line-clamp-2">
                {p.description}
              </p>
            </div>

            <div className="mt-6 border-t border-line pt-4">
              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                <div className="rounded-lg bg-[var(--surface2)]/60 p-2">
                  <div className="font-bold text-sm text-[var(--text)]">{p.copyCount}</div>
                  <span className="text-[11px] text-muted">Copies</span>
                </div>
                <div className="rounded-lg bg-[var(--surface2)]/60 p-2">
                  <div className="font-bold text-sm text-[var(--text)]">
                    {p.avgScore ? `${p.avgScore}` : '—'}
                  </div>
                  <span className="text-[11px] text-muted">Avg Score</span>
                </div>
                <div className="rounded-lg bg-[var(--surface2)]/60 p-2">
                  <div className="font-bold text-sm text-[var(--text)] truncate">{p.audience}</div>
                  <span className="text-[11px] text-muted">Audience</span>
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between">
                <Link
                  href={`/studio?projectId=${p.id}`}
                  className="focus-ring inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--accent)] hover:underline"
                >
                  <PenLine size={13} />
                  <span>Write Copy</span>
                </Link>

                <Link
                  href={`/projects/${p.id}`}
                  className="focus-ring inline-flex items-center gap-1 text-xs font-semibold text-muted hover:text-[var(--text)]"
                >
                  <span>View Details</span>
                  <ArrowRight size={13} />
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredProjects.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-line bg-[var(--surface)] p-12 text-center">
          <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-[var(--surface2)] text-muted">
            <FolderKanban size={24} />
          </div>
          <h2 className="mt-4 font-bold text-lg text-[var(--text)]">No projects found</h2>
          <p className="mt-1 text-sm text-muted max-w-sm mx-auto">
            {searchQuery || selectedAudience !== 'All' || selectedStatus !== 'All'
              ? 'Try changing your search or filter options.'
              : 'Create your first project to start organizing copy for your product.'}
          </p>
          <div className="mt-5">
            <Button variant="primary" onClick={openCreateModal}>
              <Plus size={16} />
              <span>Create Project</span>
            </Button>
          </div>
        </div>
      ) : null}

      {/* Create / Edit Project Modal */}
      {modalOpen ? (
        <Modal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          title={editingProject ? 'Edit Project' : 'Create New Project'}
          description="Group interface copy, attach brand voices, and enforce writing guidelines."
          maxWidth="max-w-2xl"
        >
          <div className="space-y-4">
            {error ? <Notice kind="error">{error}</Notice> : null}

            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Project Name" required hint="e.g. Mobile Checkout">
                <Input
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="e.g. Account Security"
                  autoFocus
                />
              </Field>

              <Field label="Product / Service" hint="e.g. iOS Banking App">
                <Input
                  value={product}
                  onChange={e => setProduct(e.target.value)}
                  placeholder="e.g. Pulse Mobile App"
                />
              </Field>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <Field label="Audience">
                <Select
                  value={audience}
                  onChange={e => setAudience(e.target.value as Audience)}
                >
                  {audiences.map(a => (
                    <option key={a} value={a}>
                      {a}
                    </option>
                  ))}
                </Select>
              </Field>

              <Field label="Brand Voice">
                <Select
                  value={brandVoiceId}
                  onChange={e => setBrandVoiceId(e.target.value)}
                >
                  <option value="">None (Standard)</option>
                  {store.brandVoices.map(v => (
                    <option key={v.id} value={v.id}>
                      {v.name}
                    </option>
                  ))}
                </Select>
              </Field>

              <Field label="Status">
                <Select
                  value={status}
                  onChange={e => setStatus(e.target.value as 'Active' | 'In Review' | 'Archived')}
                >
                  <option value="Active">Active</option>
                  <option value="In Review">In Review</option>
                  <option value="Archived">Archived</option>
                </Select>
              </Field>
            </div>

            <Field label="Description" hint="What interface experiences belong here?">
              <Input
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="e.g. Onboarding, password reset, and 2FA verification screens."
              />
            </Field>

            <Field
              label="Writing Guidelines"
              hint="One guideline per line (bullet points supported)"
            >
              <Textarea
                value={guidelinesText}
                onChange={e => setGuidelinesText(e.target.value)}
                rows={4}
                placeholder="• Plain language&#10;• Make irreversible consequences clear&#10;• Specific outcome verbs"
              />
            </Field>

            <div className="flex items-center justify-end gap-3 border-t border-line pt-4">
              <Button variant="secondary" onClick={() => setModalOpen(false)}>
                Cancel
              </Button>
              <Button variant="primary" onClick={handleSaveProject}>
                {editingProject ? 'Save Changes' : 'Create Project'}
              </Button>
            </div>
          </div>
        </Modal>
      ) : null}

      {/* Delete Confirmation Modal */}
      {deleteCandidate ? (
        <Modal
          open={Boolean(deleteCandidate)}
          onClose={() => setDeleteCandidate(null)}
          title={`Delete "${deleteCandidate.name}"?`}
          description="This will permanently delete this project. Any saved copy in this project will be kept in General History."
        >
          <div className="flex items-center justify-end gap-3 pt-4">
            <Button variant="secondary" onClick={() => setDeleteCandidate(null)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={confirmDelete}>
              <Trash2 size={16} />
              <span>Delete Project</span>
            </Button>
          </div>
        </Modal>
      ) : null}
    </div>
  );
}
