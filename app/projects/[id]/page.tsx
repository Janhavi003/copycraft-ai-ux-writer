'use client';

import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import {
  ArrowLeft,
  PenLine,
  Edit2,
  Trash2,
  BookOpen,
  CheckCircle2,
  Copy,
  ExternalLink,
  FolderKanban,
  Volume2,
} from 'lucide-react';
import {
  Button,
  CopyButton,
  Field,
  Input,
  Select,
  Textarea,
  Modal,
  Badge,
  Notice,
} from '@/components/ui';
import {
  loadStore,
  saveStore,
  upsertProject,
  deleteProject,
  deleteGeneration,
} from '@/lib/data/store';
import type { AppStore, Audience, Project, CopyGeneration } from '@/types';

const audiences: Audience[] = [
  'General',
  'Consumers',
  'Developers',
  'Designers',
  'Business',
  'Enterprise',
];

export default function ProjectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = String(params.id);

  const [store, setStore] = useState<AppStore | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  // Edit Project Modal
  const [editOpen, setEditOpen] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [product, setProduct] = useState('');
  const [team, setTeam] = useState('');
  const [audience, setAudience] = useState<Audience>('General');
  const [brandVoiceId, setBrandVoiceId] = useState('');
  const [guidelinesText, setGuidelinesText] = useState('');
  const [status, setStatus] = useState<'Active' | 'In Review' | 'Archived'>('Active');

  // Delete Project Confirmation
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  // Delete Copy Item Confirmation
  const [deleteCopyCandidate, setDeleteCopyCandidate] = useState<CopyGeneration | null>(null);

  useEffect(() => {
    setStore(loadStore());
  }, []);

  const project = useMemo(() => {
    return store?.projects.find(p => p.id === projectId);
  }, [store, projectId]);

  const brandVoice = useMemo(() => {
    if (!project?.brandVoiceId || !store) return null;
    return store.brandVoices.find(v => v.id === project.brandVoiceId);
  }, [project, store]);

  const copies = useMemo(() => {
    if (!store) return [];
    return store.generations.filter(g => g.projectId === projectId);
  }, [store, projectId]);

  function openEdit() {
    if (!project) return;
    setName(project.name);
    setDescription(project.description);
    setProduct(project.product || '');
    setTeam(project.team || '');
    setAudience(project.audience);
    setBrandVoiceId(project.brandVoiceId || '');
    setGuidelinesText(project.guidelines.join('\n'));
    setStatus(project.status || 'Active');
    setEditOpen(true);
  }

  function handleSaveEdit() {
    if (!store || !project || name.trim().length < 2) return;

    const guidelines = guidelinesText
      .split('\n')
      .map(l => l.replace(/^[•\-\*]\s*/, '').trim())
      .filter(Boolean);

    const updated: Project = {
      ...project,
      name: name.trim(),
      description: description.trim(),
      product: product.trim() || name.trim(),
      team: team.trim() || 'Product Team',
      audience,
      brandVoiceId: brandVoiceId || undefined,
      status,
      guidelines: guidelines.length > 0 ? guidelines : project.guidelines,
      updatedAt: 'Just now',
    };

    const nextStore = upsertProject(store, updated);
    saveStore(nextStore);
    setStore(nextStore);
    setEditOpen(false);
    setNotice('Project updated successfully.');
  }

  function handleDeleteProject() {
    if (!store || !project) return;
    const nextStore = deleteProject(store, project.id);
    saveStore(nextStore);
    setStore(nextStore);
    router.push('/projects');
  }

  function handleDeleteCopy() {
    if (!store || !deleteCopyCandidate) return;
    const nextStore = deleteGeneration(store, deleteCopyCandidate.id);
    saveStore(nextStore);
    setStore(nextStore);
    setNotice(`Removed copy "${deleteCopyCandidate.headline}".`);
    setDeleteCopyCandidate(null);
  }

  if (!store) {
    return <div className="py-20 text-center muted">Loading project…</div>;
  }

  if (!project) {
    return (
      <div className="py-16 text-center">
        <h1 className="serif text-4xl text-[var(--text)]">Project Not Found</h1>
        <p className="mt-2 text-sm text-muted">
          This project may have been deleted or the link is incorrect.
        </p>
        <div className="mt-6">
          <Link
            href="/projects"
            className="focus-ring inline-flex items-center gap-2 rounded-lg bg-[var(--accent)] px-4 py-2 text-sm font-bold text-white"
          >
            <ArrowLeft size={16} />
            <span>Back to Projects</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Navigation & Header */}
      <div>
        <Link
          href="/projects"
          className="focus-ring inline-flex items-center gap-2 text-xs font-bold text-[var(--accent)] hover:underline mb-4"
        >
          <ArrowLeft size={14} />
          <span>All Projects</span>
        </Link>

        {notice ? (
          <div className="mb-4">
            <Notice kind="success" onClose={() => setNotice(null)}>
              {notice}
            </Notice>
          </div>
        ) : null}

        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between border-b border-line pb-6">
          <div>
            <div className="flex items-center gap-2.5">
              <Badge variant={project.status === 'Active' ? 'success' : 'default'}>
                {project.status || 'Active'}
              </Badge>
              <span className="text-xs text-muted font-semibold">{project.audience}</span>
            </div>

            <h1 className="serif mt-2 text-4xl md:text-5xl font-normal text-[var(--text)]">
              {project.name}
            </h1>
            <p className="mt-2 text-sm text-muted max-w-2xl leading-relaxed">
              {project.description}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Link
              href={`/studio?projectId=${project.id}`}
              className="focus-ring inline-flex min-h-10 items-center justify-center gap-2 rounded-lg bg-[var(--accent)] px-4 py-2 text-sm font-bold text-white shadow-xs hover:opacity-90"
            >
              <PenLine size={16} />
              <span>Write Copy</span>
            </Link>
            <Button variant="secondary" onClick={openEdit}>
              <Edit2 size={15} />
              <span>Edit</span>
            </Button>
            <Button variant="ghost" onClick={() => setDeleteModalOpen(true)} aria-label="Delete project">
              <Trash2 size={16} className="text-[var(--danger)]" />
            </Button>
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-line bg-[var(--surface)] p-5">
          <div className="text-xs text-muted font-medium">Saved Copies</div>
          <div className="mt-2 text-3xl font-black text-[var(--text)]">{copies.length}</div>
          <div className="mt-1 text-[11px] text-muted">Total in repository</div>
        </div>

        <div className="rounded-2xl border border-line bg-[var(--surface)] p-5">
          <div className="text-xs text-muted font-medium">Average Score</div>
          <div className="mt-2 text-3xl font-black text-[var(--text)]">
            {project.avgScore ? `${project.avgScore}/100` : '—'}
          </div>
          <div className="mt-1 text-[11px] text-muted">Across 7 heuristics</div>
        </div>

        <div className="rounded-2xl border border-line bg-[var(--surface)] p-5">
          <div className="text-xs text-muted font-medium">Brand Voice</div>
          <div className="mt-2 text-lg font-bold text-[var(--text)] truncate">
            {brandVoice ? brandVoice.name : 'Standard'}
          </div>
          <div className="mt-1 text-[11px] text-muted">
            {brandVoice ? (
              <Link href="/brand-voice" className="text-[var(--accent)] hover:underline">
                View rules →
              </Link>
            ) : (
              'No custom voice'
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-line bg-[var(--surface)] p-5">
          <div className="text-xs text-muted font-medium">Last Modified</div>
          <div className="mt-2 text-lg font-bold text-[var(--text)]">{project.updatedAt}</div>
          <div className="mt-1 text-[11px] text-muted">Created {project.createdAt}</div>
        </div>
      </div>

      {/* Writing Guidelines */}
      <section
        aria-labelledby="guidelines-heading"
        className="rounded-2xl border border-line bg-[var(--surface)] p-6 shadow-xs"
      >
        <div className="flex items-center justify-between border-b border-line pb-3">
          <div className="flex items-center gap-2">
            <BookOpen size={18} className="text-[var(--accent)]" />
            <h2 id="guidelines-heading" className="text-base font-bold text-[var(--text)]">
              Writing Guidelines for {project.name}
            </h2>
          </div>
          <Button variant="ghost" size="sm" onClick={openEdit}>
            Edit Guidelines
          </Button>
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-2 md:grid-cols-3">
          {project.guidelines.map((g, idx) => (
            <div key={idx} className="flex items-start gap-2.5 rounded-xl bg-[var(--surface2)]/60 p-3 text-xs text-[var(--text)] leading-relaxed">
              <CheckCircle2 size={15} className="text-[var(--success)] shrink-0 mt-0.5" />
              <span>{g}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Project Copy List */}
      <section aria-labelledby="project-copy-heading" className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 id="project-copy-heading" className="text-xl font-bold text-[var(--text)]">
              Project Copy ({copies.length})
            </h2>
          </div>
          <Link
            href={`/studio?projectId=${project.id}`}
            className="focus-ring inline-flex items-center gap-1 text-xs font-bold text-[var(--accent)] hover:underline"
          >
            <PenLine size={14} />
            <span>Generate New Piece</span>
          </Link>
        </div>

        {copies.length > 0 ? (
          <div className="grid gap-4">
            {copies.map(g => (
              <article
                key={g.id}
                className="rounded-2xl border border-line bg-[var(--surface)] p-5 md:p-6 shadow-xs flex flex-col justify-between"
              >
                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between border-b border-line pb-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <Badge variant="accent">{g.component}</Badge>
                      <span className="text-xs text-muted">{g.createdAt}</span>
                    </div>
                    <h3 className="serif mt-2 text-xl font-semibold text-[var(--text)]">
                      {g.headline}
                    </h3>
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
                      <span>Edit in Studio</span>
                    </Link>
                    <CopyButton
                      text={`${g.headline}\n${g.body}\n${g.primaryAction}`}
                      label="Copy"
                    />
                    <button
                      type="button"
                      onClick={() => setDeleteCopyCandidate(g)}
                      className="focus-ring rounded-lg p-2 text-muted hover:bg-[var(--danger)]/10 hover:text-[var(--danger)]"
                      aria-label={`Delete copy ${g.headline}`}
                      title="Delete this copy"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>

                <div className="mt-4 grid gap-4 md:grid-cols-[1fr_auto] items-center">
                  <p className="text-sm text-muted leading-relaxed">{g.body}</p>
                  <div className="flex items-center gap-2">
                    <span className="rounded-lg bg-[var(--surface2)] border border-line px-3 py-1.5 text-xs font-bold text-[var(--text)]">
                      CTA: {g.primaryAction}
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
        ) : (
          <div className="rounded-2xl border border-dashed border-line bg-[var(--surface)] p-12 text-center">
            <p className="text-sm text-muted">No copy saved in this project yet.</p>
            <div className="mt-4">
              <Link
                href={`/studio?projectId=${project.id}`}
                className="focus-ring inline-flex items-center gap-2 rounded-lg bg-[var(--accent)] px-4 py-2 text-sm font-bold text-white shadow-xs"
              >
                <PenLine size={15} />
                <span>Write First Copy for {project.name}</span>
              </Link>
            </div>
          </div>
        )}
      </section>

      {/* Edit Project Modal */}
      {editOpen ? (
        <Modal
          open={editOpen}
          onClose={() => setEditOpen(false)}
          title={`Edit ${project.name}`}
          maxWidth="max-w-2xl"
        >
          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Project Name" required>
                <Input value={name} onChange={e => setName(e.target.value)} />
              </Field>
              <Field label="Product / Experience">
                <Input value={product} onChange={e => setProduct(e.target.value)} />
              </Field>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <Field label="Audience">
                <Select value={audience} onChange={e => setAudience(e.target.value as Audience)}>
                  {audiences.map(a => (
                    <option key={a} value={a}>
                      {a}
                    </option>
                  ))}
                </Select>
              </Field>

              <Field label="Brand Voice">
                <Select value={brandVoiceId} onChange={e => setBrandVoiceId(e.target.value)}>
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

            <Field label="Description">
              <Input value={description} onChange={e => setDescription(e.target.value)} />
            </Field>

            <Field label="Writing Guidelines" hint="One guideline per line">
              <Textarea
                value={guidelinesText}
                onChange={e => setGuidelinesText(e.target.value)}
                rows={4}
              />
            </Field>

            <div className="flex items-center justify-end gap-3 border-t border-line pt-4">
              <Button variant="secondary" onClick={() => setEditOpen(false)}>
                Cancel
              </Button>
              <Button variant="primary" onClick={handleSaveEdit}>
                Save Changes
              </Button>
            </div>
          </div>
        </Modal>
      ) : null}

      {/* Delete Project Confirmation */}
      {deleteModalOpen ? (
        <Modal
          open={deleteModalOpen}
          onClose={() => setDeleteModalOpen(false)}
          title={`Delete "${project.name}"?`}
          description="Are you sure? Saved copy belonging to this project will be preserved in General History, but this project repository will be deleted."
        >
          <div className="flex items-center justify-end gap-3 pt-4">
            <Button variant="secondary" onClick={() => setDeleteModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={handleDeleteProject}>
              <Trash2 size={16} />
              <span>Delete Project</span>
            </Button>
          </div>
        </Modal>
      ) : null}

      {/* Delete Copy Confirmation */}
      {deleteCopyCandidate ? (
        <Modal
          open={Boolean(deleteCopyCandidate)}
          onClose={() => setDeleteCopyCandidate(null)}
          title="Delete Saved Copy?"
          description={`Permanently remove "${deleteCopyCandidate.headline}" from this project and workspace history?`}
        >
          <div className="flex items-center justify-end gap-3 pt-4">
            <Button variant="secondary" onClick={() => setDeleteCopyCandidate(null)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={handleDeleteCopy}>
              <Trash2 size={16} />
              <span>Delete Copy</span>
            </Button>
          </div>
        </Modal>
      ) : null}
    </div>
  );
}
