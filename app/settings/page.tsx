'use client';

import { useEffect, useState } from 'react';
import {
  Moon,
  Sun,
  Laptop,
  RotateCcw,
  Download,
  Upload,
  Check,
  Sparkles,
  ShieldCheck,
  AlertTriangle,
} from 'lucide-react';
import {
  Button,
  Field,
  Select,
  Modal,
  Notice,
} from '@/components/ui';
import {
  loadStore,
  saveStore,
  resetStore,
  exportStoreJson,
  importStoreJson,
} from '@/lib/data/store';
import type { AppStore } from '@/types';

export default function SettingsPage() {
  const [store, setStore] = useState<AppStore | null>(null);
  const [theme, setTheme] = useState<'system' | 'light' | 'dark'>('system');
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Reset Modal
  const [resetModalOpen, setResetModalOpen] = useState(false);

  // Import JSON Modal
  const [importJsonModalOpen, setImportJsonModalOpen] = useState(false);
  const [importJsonText, setImportJsonText] = useState('');

  useEffect(() => {
    setStore(loadStore());

    const savedTheme = localStorage.getItem('copycraft-theme') as 'light' | 'dark' | null;
    if (savedTheme === 'light' || savedTheme === 'dark') {
      setTheme(savedTheme);
    } else {
      setTheme('system');
    }
  }, []);

  function handleThemeChange(val: 'system' | 'light' | 'dark') {
    setTheme(val);

    if (val === 'system') {
      localStorage.removeItem('copycraft-theme');
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      document.documentElement.classList.toggle('dark', prefersDark);
    } else {
      localStorage.setItem('copycraft-theme', val);
      document.documentElement.classList.toggle('dark', val === 'dark');
    }

    window.dispatchEvent(new Event('copycraft-theme-change'));
    setNotice(`Appearance theme updated to ${val}.`);
  }

  function handleConfirmReset() {
    const fresh = resetStore();
    setStore(fresh);
    setResetModalOpen(false);
    setNotice('Workspace has been reset to default starter data.');
  }

  function handleExportBackup() {
    if (!store) return;
    const jsonStr = exportStoreJson(store);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `copycraft-workspace-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setNotice('Downloaded workspace backup JSON.');
  }

  function handleImportBackup() {
    if (!importJsonText.trim()) {
      setError('Please paste valid JSON workspace data.');
      return;
    }
    const imported = importStoreJson(importJsonText);
    if (!imported) {
      setError('Invalid JSON format. Please verify the file contents.');
      return;
    }

    saveStore(imported);
    setStore(imported);
    setImportJsonModalOpen(false);
    setImportJsonText('');
    setNotice('Successfully imported workspace backup.');
  }

  if (!store) {
    return <div className="py-20 text-center muted">Loading settings…</div>;
  }

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <header className="border-b border-line pb-6">
        <div className="text-xs font-bold uppercase tracking-[.18em] text-[var(--accent)]">
          Preferences & Data
        </div>
        <h1 className="serif mt-1 text-4xl md:text-5xl font-normal text-[var(--text)]">
          Workspace Settings
        </h1>
        <p className="mt-2 text-sm text-muted max-w-2xl">
          Configure appearance, review local offline persistence, backup workspace data, or reset to starter templates.
        </p>
      </header>

      {notice ? (
        <Notice kind="success" onClose={() => setNotice(null)}>
          {notice}
        </Notice>
      ) : null}

      {error ? (
        <Notice kind="error" onClose={() => setError(null)}>
          {error}
        </Notice>
      ) : null}

      {/* Appearance Section */}
      <section
        aria-labelledby="appearance-heading"
        className="rounded-2xl border border-line bg-[var(--surface)] p-6 shadow-xs space-y-4"
      >
        <h2 id="appearance-heading" className="text-lg font-bold text-[var(--text)]">
          Appearance & Theme
        </h2>
        <p className="text-xs text-muted">
          Choose how CopyCraft looks on your screen. The setting persists across sessions.
        </p>

        <div className="grid gap-3 sm:grid-cols-3 pt-2">
          <button
            type="button"
            onClick={() => handleThemeChange('light')}
            className={`focus-ring rounded-xl border p-4 text-left transition flex items-center gap-3 ${
              theme === 'light'
                ? 'border-[var(--accent)] bg-[var(--accent)]/10 text-[var(--accent)] font-bold'
                : 'border-line bg-[var(--surface2)]/50 text-[var(--text)] hover:bg-[var(--surface2)]'
            }`}
          >
            <Sun size={20} className={theme === 'light' ? 'text-[var(--accent)]' : 'text-muted'} />
            <div>
              <div className="text-sm font-semibold">Light Theme</div>
              <div className="text-[11px] text-muted font-normal">Warm paper neutrals</div>
            </div>
          </button>

          <button
            type="button"
            onClick={() => handleThemeChange('dark')}
            className={`focus-ring rounded-xl border p-4 text-left transition flex items-center gap-3 ${
              theme === 'dark'
                ? 'border-[var(--accent)] bg-[var(--accent)]/10 text-[var(--accent)] font-bold'
                : 'border-line bg-[var(--surface2)]/50 text-[var(--text)] hover:bg-[var(--surface2)]'
            }`}
          >
            <Moon size={20} className={theme === 'dark' ? 'text-[var(--accent)]' : 'text-muted'} />
            <div>
              <div className="text-sm font-semibold">Dark Theme</div>
              <div className="text-[11px] text-muted font-normal">Editorial deep zinc</div>
            </div>
          </button>

          <button
            type="button"
            onClick={() => handleThemeChange('system')}
            className={`focus-ring rounded-xl border p-4 text-left transition flex items-center gap-3 ${
              theme === 'system'
                ? 'border-[var(--accent)] bg-[var(--accent)]/10 text-[var(--accent)] font-bold'
                : 'border-line bg-[var(--surface2)]/50 text-[var(--text)] hover:bg-[var(--surface2)]'
            }`}
          >
            <Laptop size={20} className={theme === 'system' ? 'text-[var(--accent)]' : 'text-muted'} />
            <div>
              <div className="text-sm font-semibold">System Default</div>
              <div className="text-[11px] text-muted font-normal">Sync with OS preference</div>
            </div>
          </button>
        </div>
      </section>

      {/* AI Architecture & Security Section */}
      <section
        aria-labelledby="ai-security-heading"
        className="rounded-2xl border border-line bg-[var(--surface)] p-6 shadow-xs space-y-4"
      >
        <div className="flex items-center gap-2">
          <ShieldCheck size={20} className="text-[var(--accent)]" />
          <h2 id="ai-security-heading" className="text-lg font-bold text-[var(--text)]">
            AI Engine & Provider Architecture
          </h2>
        </div>

        <p className="text-xs text-muted leading-relaxed">
          CopyCraft implements a zero-leak server-side AI architecture. Secret API keys are never bundled into client JavaScript or stored in browser storage.
        </p>

        <div className="rounded-xl border border-line bg-[var(--surface2)]/60 p-4 space-y-2 text-xs leading-relaxed">
          <div className="font-semibold text-[var(--text)]">Server Configuration (.env.local)</div>
          <p className="text-muted">
            To enable live OpenAI generation, specify <code className="font-mono bg-[var(--surface)] px-1.5 py-0.5 rounded text-[var(--accent)]">OPENAI_API_KEY</code> on your server or hosting provider (e.g. Vercel environment variables).
          </p>
          <div className="mt-2 text-muted">
            When absent, out of credits (429), or unavailable, CopyCraft automatically uses deterministic component-aware Demo Mode.
          </div>
        </div>
      </section>

      {/* Backup & Portability Section */}
      <section
        aria-labelledby="backup-heading"
        className="rounded-2xl border border-line bg-[var(--surface)] p-6 shadow-xs space-y-4"
      >
        <h2 id="backup-heading" className="text-lg font-bold text-[var(--text)]">
          Workspace Portability & Backup
        </h2>
        <p className="text-xs text-muted">
          Export your entire local workspace (projects, brand voices, generations) as a JSON backup or restore from a previous file.
        </p>

        <div className="flex flex-wrap gap-3 pt-2">
          <Button variant="secondary" onClick={handleExportBackup}>
            <Download size={15} />
            <span>Download Workspace JSON</span>
          </Button>

          <Button variant="secondary" onClick={() => setImportJsonModalOpen(true)}>
            <Upload size={15} />
            <span>Import Workspace Backup</span>
          </Button>
        </div>
      </section>

      {/* Workspace Reset Danger Zone */}
      <section
        aria-labelledby="danger-heading"
        className="rounded-2xl border border-[var(--danger)]/30 bg-[var(--danger)]/5 p-6 shadow-xs space-y-4"
      >
        <div className="flex items-center gap-2 text-[var(--danger)]">
          <AlertTriangle size={20} />
          <h2 id="danger-heading" className="text-lg font-bold">
            Reset Workspace Data
          </h2>
        </div>

        <p className="text-xs text-muted leading-relaxed">
          Resetting clears all custom projects, saved generations, and custom brand voices from this browser and restores the default starter dataset.
        </p>

        <div className="pt-2">
          <Button variant="danger" onClick={() => setResetModalOpen(true)}>
            <RotateCcw size={15} />
            <span>Reset Local Workspace</span>
          </Button>
        </div>
      </section>

      {/* Confirmation Modal: Reset */}
      {resetModalOpen ? (
        <Modal
          open={resetModalOpen}
          onClose={() => setResetModalOpen(false)}
          title="Reset Workspace to Default?"
          description="Are you sure? All custom projects, history, and brand voices created in this browser will be wiped and replaced with the clean starter dataset."
        >
          <div className="flex items-center justify-end gap-3 pt-4">
            <Button variant="secondary" onClick={() => setResetModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={handleConfirmReset}>
              <RotateCcw size={15} />
              <span>Confirm & Reset</span>
            </Button>
          </div>
        </Modal>
      ) : null}

      {/* Modal: Import Backup JSON */}
      {importJsonModalOpen ? (
        <Modal
          open={importJsonModalOpen}
          onClose={() => setImportJsonModalOpen(false)}
          title="Import Workspace Backup JSON"
          description="Paste the contents of your exported workspace JSON file below to restore your projects, voices, and generations."
          maxWidth="max-w-2xl"
        >
          <div className="space-y-4">
            <Field label="Workspace JSON Data" required>
              <textarea
                value={importJsonText}
                onChange={e => setImportJsonText(e.target.value)}
                rows={10}
                className="focus-ring w-full rounded-lg border border-line bg-[var(--surface)] p-3 text-xs font-mono outline-none"
                placeholder='{"projects": [...], "brandVoices": [...], "generations": [...]}'
              />
            </Field>

            <div className="flex items-center justify-end gap-3 border-t border-line pt-4">
              <Button variant="secondary" onClick={() => setImportJsonModalOpen(false)}>
                Cancel
              </Button>
              <Button variant="primary" onClick={handleImportBackup}>
                <Upload size={15} />
                <span>Restore Workspace</span>
              </Button>
            </div>
          </div>
        </Modal>
      ) : null}
    </div>
  );
}
