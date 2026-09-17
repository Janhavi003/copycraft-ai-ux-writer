'use client';

import { useEffect, useState } from 'react';
import {
  Plus,
  Save,
  Trash2,
  Volume2,
  Check,
  Star,
  Sparkles,
  Info,
} from 'lucide-react';
import {
  Button,
  Field,
  Input,
  Textarea,
  Select,
  Badge,
  Modal,
  Notice,
} from '@/components/ui';
import {
  loadStore,
  saveStore,
  upsertBrandVoice,
  deleteBrandVoice,
  setDefaultBrandVoice,
} from '@/lib/data/store';
import type { AppStore, BrandVoice } from '@/types';

const defaultTones = [
  'Empathetic',
  'Confident',
  'Professional',
  'Friendly',
  'Playful',
  'Minimal',
  'Direct',
];

export default function BrandVoicePage() {
  const [store, setStore] = useState<AppStore | null>(null);
  const [selectedId, setSelectedId] = useState<string>('');

  // Form fields
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [personality, setPersonality] = useState('');
  const [tone, setTone] = useState('Empathetic');
  const [rules, setRules] = useState('');
  const [wordsToUse, setWordsToUse] = useState('');
  const [wordsToAvoid, setWordsToAvoid] = useState('');
  const [exampleCopy, setExampleCopy] = useState('');

  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  useEffect(() => {
    const s = loadStore();
    setStore(s);
    const initialVoice = s.brandVoices.find(v => v.id === s.defaultVoiceId) || s.brandVoices[0];
    if (initialVoice) {
      setSelectedId(initialVoice.id);
      fillForm(initialVoice);
    }
  }, []);

  function fillForm(v: BrandVoice) {
    setName(v.name);
    setDescription(v.description || '');
    setPersonality(v.personality.join(', '));
    setTone(v.tone || 'Empathetic');
    setRules(v.rules.join('\n'));
    setWordsToUse((v.wordsToUse || []).join(', '));
    setWordsToAvoid((v.wordsToAvoid || []).join(', '));
    setExampleCopy(v.exampleCopy || '');
    setError('');
  }

  function handleSelectVoice(id: string) {
    if (!store) return;
    const v = store.brandVoices.find(x => x.id === id);
    if (v) {
      setSelectedId(id);
      fillForm(v);
    }
  }

  function handleCreateNew() {
    const newId = crypto.randomUUID();
    const newVoice: BrandVoice = {
      id: newId,
      name: 'New Brand Voice',
      description: 'Describe the voice guidelines for your product.',
      personality: ['Clear', 'Helpful'],
      tone: 'Friendly',
      rules: ['Use plain language', 'Avoid jargon'],
      wordsToUse: ['Continue', 'Back'],
      wordsToAvoid: ['Submit', 'Oops'],
      exampleCopy: 'Your changes have been saved.',
      isDefault: false,
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: 'Just now',
    };

    if (!store) return;
    const nextStore = upsertBrandVoice(store, newVoice);
    saveStore(nextStore);
    setStore(nextStore);
    setSelectedId(newId);
    fillForm(newVoice);
    setNotice(`Created new brand voice: ${newVoice.name}`);
  }

  function handleSave() {
    if (!store) return;
    if (name.trim().length < 2) {
      setError('Please provide a voice name with at least 2 characters.');
      return;
    }

    const current = store.brandVoices.find(v => v.id === selectedId);

    const voiceData: BrandVoice = {
      id: selectedId || crypto.randomUUID(),
      name: name.trim(),
      description: description.trim(),
      personality: personality
        .split(',')
        .map(x => x.trim())
        .filter(Boolean),
      tone,
      rules: rules
        .split('\n')
        .map(x => x.replace(/^[•\-\*]\s*/, '').trim())
        .filter(Boolean),
      wordsToUse: wordsToUse
        .split(',')
        .map(x => x.trim())
        .filter(Boolean),
      wordsToAvoid: wordsToAvoid
        .split(',')
        .map(x => x.trim())
        .filter(Boolean),
      exampleCopy: exampleCopy.trim(),
      isDefault: current ? Boolean(current.isDefault) : false,
      updatedAt: 'Just now',
    };

    const nextStore = upsertBrandVoice(store, voiceData);
    saveStore(nextStore);
    setStore(nextStore);
    setNotice(`Saved voice: "${voiceData.name}". Changes are now active across Copy Studio.`);
  }

  function handleSetDefault() {
    if (!store || !selectedId) return;
    const nextStore = setDefaultBrandVoice(store, selectedId);
    saveStore(nextStore);
    setStore(nextStore);
    setNotice(`Set "${name}" as the default brand voice.`);
  }

  function handleDeleteConfirm() {
    if (!store || !selectedId) return;
    const nextStore = deleteBrandVoice(store, selectedId);
    saveStore(nextStore);
    setStore(nextStore);
    setDeleteModalOpen(false);

    const nextSelected = nextStore.brandVoices[0];
    if (nextSelected) {
      setSelectedId(nextSelected.id);
      fillForm(nextSelected);
    } else {
      setSelectedId('');
      setName('');
      setDescription('');
      setPersonality('');
      setRules('');
      setWordsToUse('');
      setWordsToAvoid('');
      setExampleCopy('');
    }
    setNotice('Brand voice deleted.');
  }

  if (!store) {
    return <div className="py-20 text-center muted">Loading brand voices…</div>;
  }

  const selectedVoiceObj = store.brandVoices.find(v => v.id === selectedId);
  const isDefault = selectedVoiceObj?.isDefault || store.defaultVoiceId === selectedId;

  return (
    <div className="space-y-6">
      {/* Header */}
      <header className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between border-b border-line pb-6">
        <div>
          <div className="text-xs font-bold uppercase tracking-[.18em] text-[var(--accent)]">
            Content Strategy
          </div>
          <h1 className="serif mt-1 text-4xl md:text-5xl font-normal text-[var(--text)]">
            Brand Voice & Guidelines
          </h1>
          <p className="mt-2 text-sm text-muted max-w-2xl">
            Codify your product personality, vocabulary, and writing rules. Active voices automatically shape Copy Studio generation and inspection heuristics.
          </p>
        </div>

        <Button variant="primary" onClick={handleCreateNew}>
          <Plus size={16} />
          <span>New Voice</span>
        </Button>
      </header>

      {notice ? (
        <Notice kind="success" onClose={() => setNotice(null)}>
          {notice}
        </Notice>
      ) : null}

      {error ? (
        <Notice kind="error" onClose={() => setError('')}>
          {error}
        </Notice>
      ) : null}

      {/* Two Column Layout: Voice Selector & Editor */}
      <div className="grid gap-6 lg:grid-cols-[300px_minmax(0,1fr)]">
        {/* Left: Voice List */}
        <aside
          aria-label="Available brand voices"
          className="rounded-2xl border border-line bg-[var(--surface)] p-4 shadow-xs flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between border-b border-line pb-3 px-2">
              <span className="text-xs font-bold uppercase tracking-wider text-muted">
                Configured Voices ({store.brandVoices.length})
              </span>
              <button
                type="button"
                onClick={handleCreateNew}
                className="focus-ring rounded-lg p-1.5 text-muted hover:bg-[var(--surface2)] hover:text-[var(--text)]"
                aria-label="Add new voice"
                title="Add brand voice"
              >
                <Plus size={16} />
              </button>
            </div>

            <nav aria-label="Brand voices list" className="mt-3 space-y-1.5">
              {store.brandVoices.map(v => {
                const active = selectedId === v.id;
                const def = v.isDefault || store.defaultVoiceId === v.id;
                return (
                  <button
                    key={v.id}
                    type="button"
                    onClick={() => handleSelectVoice(v.id)}
                    className={`focus-ring w-full text-left rounded-xl p-3 text-sm transition flex items-center justify-between ${
                      active
                        ? 'border border-[var(--accent)] bg-[var(--accent)]/10 text-[var(--accent)] font-bold'
                        : 'border border-transparent text-[var(--text)] hover:bg-[var(--surface2)]'
                    }`}
                  >
                    <div className="min-w-0 pr-2">
                      <div className="truncate">{v.name}</div>
                      <div className="text-[11px] text-muted truncate font-normal">
                        {v.personality.slice(0, 2).join(' · ')}
                      </div>
                    </div>
                    {def ? (
                      <span title="Default voice" className="shrink-0 text-[var(--accent)]">
                        <Star size={14} className="fill-current" />
                      </span>
                    ) : null}
                  </button>
                );
              })}
            </nav>
          </div>

          <div className="mt-6 rounded-xl border border-line bg-[var(--surface2)]/70 p-3 text-xs text-muted leading-relaxed">
            <div className="flex items-center gap-1.5 font-bold text-[var(--text)] mb-1">
              <Info size={14} className="text-[var(--accent)]" />
              <span>Studio Integration</span>
            </div>
            These voices appear directly inside Copy Studio dropdowns and prime the AI system prompt.
          </div>
        </aside>

        {/* Right: Form Editor */}
        <section
          aria-labelledby="voice-editor-heading"
          className="rounded-2xl border border-line bg-[var(--surface)] p-6 md:p-7 shadow-xs space-y-5"
        >
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line pb-4">
            <div>
              <div className="flex items-center gap-2">
                <h2 id="voice-editor-heading" className="text-xl font-bold text-[var(--text)]">
                  {name || 'Edit Brand Voice'}
                </h2>
                {isDefault ? <Badge variant="accent">Default Voice</Badge> : null}
              </div>
              <p className="text-xs text-muted mt-1">
                Customize rules, personality dimensions, and approved terms.
              </p>
            </div>

            <div className="flex items-center gap-2">
              {!isDefault && selectedId ? (
                <Button variant="outline" size="sm" onClick={handleSetDefault}>
                  <Star size={14} />
                  <span>Set as Default</span>
                </Button>
              ) : null}

              {store.brandVoices.length > 1 ? (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setDeleteModalOpen(true)}
                  aria-label="Delete this voice"
                >
                  <Trash2 size={15} className="text-[var(--danger)]" />
                </Button>
              ) : null}

              <Button variant="primary" size="sm" onClick={handleSave}>
                <Save size={15} />
                <span>Save Voice</span>
              </Button>
            </div>
          </div>

          {/* Form Fields */}
          <div className="grid gap-5 md:grid-cols-2">
            <Field label="Voice Name" required hint="e.g. Pulse or Clarity Enterprise">
              <Input value={name} onChange={e => setName(e.target.value)} />
            </Field>

            <Field label="Primary Tone" hint="Standard emotional baseline">
              <Select value={tone} onChange={e => setTone(e.target.value)}>
                {defaultTones.map(t => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </Select>
            </Field>
          </div>

          <Field
            label="Personality Traits"
            hint="Comma-separated adjectives (e.g. Calm, Trustworthy, Human, Precise)"
          >
            <Input
              value={personality}
              onChange={e => setPersonality(e.target.value)}
              placeholder="e.g. Calm, Direct, Warm, Efficient"
            />
          </Field>

          <Field label="Description & Strategic Purpose">
            <Input
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="e.g. Reassuring, plain-language voice for high-risk financial and identity flows."
            />
          </Field>

          <Field
            label="Writing Principles & Rules"
            hint="One rule per line. The generator checks against these requirements."
          >
            <Textarea
              value={rules}
              onChange={e => setRules(e.target.value)}
              rows={4}
              placeholder="• Use plain language&#10;• State consequences before user commits&#10;• Prefer specific actions over generic labels&#10;• Never blame the user"
            />
          </Field>

          <div className="grid gap-5 md:grid-cols-2">
            <Field
              label="Words to Use (Preferred Vocabulary)"
              hint="Comma-separated approved terms"
            >
              <Input
                value={wordsToUse}
                onChange={e => setWordsToUse(e.target.value)}
                placeholder="e.g. Keep, Remove, Confirm, Update, Back to safety"
              />
            </Field>

            <Field
              label="Words to Avoid (Banned Terms)"
              hint="Comma-separated phrases to filter"
            >
              <Input
                value={wordsToAvoid}
                onChange={e => setWordsToAvoid(e.target.value)}
                placeholder="e.g. Oops, Uh oh, Submit, Proceed, Click here"
              />
            </Field>
          </div>

          <Field
            label="Canonical Example Copy"
            hint="A gold-standard microcopy sample illustrating this voice in practice"
          >
            <Textarea
              value={exampleCopy}
              onChange={e => setExampleCopy(e.target.value)}
              rows={3}
              placeholder="e.g. Delete your bank account? This permanently removes your account and transaction history. This action cannot be undone."
            />
          </Field>

          {/* Example Preview Card */}
          <div className="mt-4 rounded-xl border border-line bg-[var(--surface2)]/50 p-4">
            <div className="text-xs font-bold uppercase tracking-wider text-muted mb-2 flex items-center gap-1.5">
              <Sparkles size={13} className="text-[var(--accent)]" />
              <span>Voice Character Preview</span>
            </div>
            <p className="text-sm font-medium text-[var(--text)] italic leading-relaxed">
              &ldquo;{exampleCopy || 'Provide an example above to preview the voice tone.'}&rdquo;
            </p>
          </div>
        </section>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteModalOpen && selectedVoiceObj ? (
        <Modal
          open={deleteModalOpen}
          onClose={() => setDeleteModalOpen(false)}
          title={`Delete "${selectedVoiceObj.name}"?`}
          description="Are you sure? This will remove this voice profile from your workspace and Copy Studio options."
        >
          <div className="flex items-center justify-end gap-3 pt-4">
            <Button variant="secondary" onClick={() => setDeleteModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={handleDeleteConfirm}>
              <Trash2 size={16} />
              <span>Delete Voice</span>
            </Button>
          </div>
        </Modal>
      ) : null}
    </div>
  );
}
