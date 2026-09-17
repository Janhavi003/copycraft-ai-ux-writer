'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import {
  BarChart3,
  BookOpen,
  FolderKanban,
  History,
  Menu,
  Moon,
  PenLine,
  Settings,
  Sun,
  Type,
  Volume2,
  X,
  Sparkles,
} from 'lucide-react';

const navItems = [
  ['/dashboard', 'Dashboard', BarChart3],
  ['/studio', 'Copy Studio', PenLine],
  ['/projects', 'Projects', FolderKanban],
  ['/patterns', 'Pattern Library', BookOpen],
  ['/history', 'History', History],
  ['/brand-voice', 'Brand Voice', Volume2],
  ['/settings', 'Settings', Settings],
] as const;

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [dark, setDark] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const savedTheme = localStorage.getItem('copycraft-theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const isDark = savedTheme === 'dark' || (!savedTheme && prefersDark);
    setDark(isDark);
    document.documentElement.classList.toggle('dark', isDark);

    const handleThemeEvent = () => {
      const current = localStorage.getItem('copycraft-theme');
      const shouldDark = current === 'dark' || (!current && window.matchMedia('(prefers-color-scheme: dark)').matches);
      setDark(shouldDark);
      document.documentElement.classList.toggle('dark', shouldDark);
    };

    window.addEventListener('storage', handleThemeEvent);
    window.addEventListener('copycraft-theme-change', handleThemeEvent);
    return () => {
      window.removeEventListener('storage', handleThemeEvent);
      window.removeEventListener('copycraft-theme-change', handleThemeEvent);
    };
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && open) setOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open]);

  function toggleTheme() {
    const nextDark = !dark;
    setDark(nextDark);
    document.documentElement.classList.toggle('dark', nextDark);
    localStorage.setItem('copycraft-theme', nextDark ? 'dark' : 'light');
    window.dispatchEvent(new Event('copycraft-theme-change'));
  }

  // Allow landing page to use its own layout without sidebar
  if (pathname === '/') {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text)] transition-colors">
      <a
        href="#main-content"
        className="focus-ring sr-only focus:not-sr-only fixed left-4 top-4 z-[100] rounded-lg bg-[var(--accent)] px-4 py-2 text-sm font-bold text-white shadow-xl"
      >
        Skip to main content
      </a>

      {/* Desktop & Mobile Sidebar Drawer */}
      <aside
        id="primary-navigation"
        aria-label="Workspace navigation"
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-line bg-[var(--surface)] p-4 shadow-sm transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between px-2 py-2">
          <Link
            href="/dashboard"
            className="focus-ring flex items-center gap-2.5 font-bold tracking-tight text-lg"
            onClick={() => setOpen(false)}
          >
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-[var(--accent)] text-white shadow-xs">
              <Type size={18} aria-hidden="true" />
            </span>
            <span>CopyCraft</span>
          </Link>
          <button
            type="button"
            className="focus-ring rounded-lg p-1.5 text-muted hover:bg-[var(--surface2)] hover:text-[var(--text)] lg:hidden"
            onClick={() => setOpen(false)}
            aria-label="Close navigation"
          >
            <X size={18} />
          </button>
        </div>

        <p className="px-2 pb-4 pt-1 text-xs muted font-medium">UX Writing Workspace</p>

        <nav aria-label="Main" className="space-y-1">
          {navItems.map(([href, label, Icon]) => {
            const isActive = pathname === href || pathname.startsWith(href + '/');
            return (
              <Link
                key={href}
                href={href}
                onClick={() => setOpen(false)}
                aria-current={isActive ? 'page' : undefined}
                className={`focus-ring flex min-h-10 items-center gap-3 rounded-lg px-3 py-2 text-sm font-semibold transition ${
                  isActive
                    ? 'bg-[var(--accent)]/10 text-[var(--accent)]'
                    : 'text-muted hover:bg-[var(--surface2)] hover:text-[var(--text)]'
                }`}
              >
                <Icon size={17} aria-hidden="true" className="shrink-0" />
                <span>{label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto pt-4">
          <div className="rounded-xl border border-line bg-[var(--surface2)]/70 p-3.5">
            <div className="flex items-center gap-2 text-xs font-bold text-[var(--text)]">
              <Sparkles size={14} className="text-[var(--accent)]" aria-hidden="true" />
              <span>Workspace Mode</span>
            </div>
            <p className="mt-1.5 text-xs muted leading-relaxed">
              Demo mode active. Works offline without external API keys.
            </p>
            <Link
              href="/settings"
              onClick={() => setOpen(false)}
              className="focus-ring mt-2.5 inline-flex items-center text-xs font-semibold text-[var(--accent)] hover:underline"
            >
              Settings & Keys →
            </Link>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="lg:pl-64 flex flex-col min-h-screen">
        <header className="sticky top-0 z-40 flex min-h-16 items-center justify-between border-b border-line bg-[var(--bg)]/95 px-4 backdrop-blur-md md:px-8">
          <div className="flex items-center gap-3">
            <button
              type="button"
              className="focus-ring rounded-lg border border-line bg-[var(--surface)] p-2 text-muted hover:text-[var(--text)] lg:hidden"
              onClick={() => setOpen(true)}
              aria-expanded={open}
              aria-controls="primary-navigation"
              aria-label="Open navigation menu"
            >
              <Menu size={18} />
            </button>
            <nav aria-label="Breadcrumb" className="hidden sm:block text-xs font-medium text-muted">
              <span className="capitalize">{pathname.split('/')[1] || 'Dashboard'}</span>
              {pathname.split('/')[2] ? (
                <>
                  <span className="mx-1.5">/</span>
                  <span>Detail</span>
                </>
              ) : null}
            </nav>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              className="focus-ring grid h-9 w-9 place-items-center rounded-lg border border-line bg-[var(--surface)] text-[var(--text)] hover:bg-[var(--surface2)]"
              onClick={toggleTheme}
              aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'}
              title={dark ? 'Light mode' : 'Dark mode'}
            >
              {mounted && dark ? <Sun size={16} aria-hidden="true" /> : <Moon size={16} aria-hidden="true" />}
            </button>
            <div className="hidden sm:block text-right">
              <div className="text-xs font-bold text-[var(--text)]">Local Workspace</div>
              <div className="text-[11px] text-muted">Zero tracking · Instant save</div>
            </div>
          </div>
        </header>

        <main id="main-content" tabIndex={-1} className="flex-1 outline-none">
          <div className="mx-auto max-w-[1440px] px-4 py-6 md:px-8 md:py-8">{children}</div>
        </main>
      </div>

      {/* Backdrop for mobile drawer */}
      {open ? (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-xs lg:hidden"
          onClick={() => setOpen(false)}
          aria-hidden="true"
        />
      ) : null}
    </div>
  );
}
