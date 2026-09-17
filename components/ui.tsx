'use client';

import React, { useEffect, useId, useState } from 'react';
import { Check, Copy, Loader2, AlertCircle, ChevronDown, X, Info, AlertTriangle, CheckCircle2 } from 'lucide-react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
}

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  ...p
}: ButtonProps) {
  const baseStyles = 'focus-ring inline-flex items-center justify-center gap-2 rounded-lg font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 select-none';

  const sizeStyles = {
    sm: 'min-h-8 px-2.5 py-1 text-xs',
    md: 'min-h-10 px-4 py-2 text-sm',
    lg: 'min-h-12 px-5 py-3 text-base',
  };

  const variantStyles = {
    primary: 'bg-[var(--accent)] text-white border border-[var(--accent)] hover:opacity-90 active:scale-[0.99]',
    secondary: 'bg-[var(--surface)] text-[var(--text)] border border-line hover:bg-[var(--surface2)] active:scale-[0.99]',
    outline: 'bg-transparent text-[var(--text)] border border-line hover:bg-[var(--surface2)]',
    ghost: 'bg-transparent text-[var(--text)] border border-transparent hover:bg-[var(--surface2)]',
    danger: 'bg-[var(--danger)] text-white border border-[var(--danger)] hover:opacity-90 active:scale-[0.99]',
  };

  return (
    <button
      {...p}
      disabled={loading || p.disabled}
      className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${p.className || ''}`}
    >
      {loading ? <Loader2 className="animate-spin shrink-0" size={size === 'sm' ? 14 : 16} aria-hidden="true" /> : null}
      {children}
    </button>
  );
}

export function Field({
  label,
  children,
  hint,
  error,
  required,
  htmlFor,
}: {
  label: string;
  children: React.ReactNode;
  hint?: string;
  error?: string;
  required?: boolean;
  htmlFor?: string;
}) {
  const autoId = useId();
  const id = htmlFor || autoId;
  const hintId = hint ? `${id}-hint` : undefined;
  const errorId = error ? `${id}-error` : undefined;

  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="block text-sm font-semibold text-[var(--text)]">
        {label}
        {required ? <span className="text-[var(--danger)] ml-0.5" aria-hidden="true">*</span> : null}
      </label>
      {React.isValidElement(children)
        ? React.cloneElement(children as React.ReactElement<{ id?: string; 'aria-describedby'?: string; 'aria-invalid'?: boolean }>, {
            id,
            'aria-describedby': [hintId, errorId].filter(Boolean).join(' ') || undefined,
            'aria-invalid': error ? true : undefined,
          })
        : children}
      {hint ? <p id={hintId} className="text-xs muted">{hint}</p> : null}
      {error ? <p id={errorId} role="alert" className="text-xs text-[var(--danger)] font-medium">{error}</p> : null}
    </div>
  );
}

export function Input(p: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...p}
      className={`focus-ring min-h-11 w-full rounded-lg border border-line bg-[var(--surface)] px-3.5 text-sm text-[var(--text)] outline-none transition placeholder:text-muted/60 focus:border-[var(--accent)] disabled:bg-[var(--surface2)] disabled:opacity-60 ${p.className || ''}`}
    />
  );
}

export function Textarea(p: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...p}
      className={`focus-ring min-h-28 w-full rounded-lg border border-line bg-[var(--surface)] px-3.5 py-3 text-sm text-[var(--text)] outline-none transition placeholder:text-muted/60 focus:border-[var(--accent)] disabled:bg-[var(--surface2)] disabled:opacity-60 ${p.className || ''}`}
    />
  );
}

export function Select(p: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <div className="relative">
      <select
        {...p}
        className={`focus-ring min-h-11 w-full appearance-none rounded-lg border border-line bg-[var(--surface)] px-3.5 pr-9 text-sm text-[var(--text)] outline-none transition focus:border-[var(--accent)] disabled:bg-[var(--surface2)] disabled:opacity-60 ${p.className || ''}`}
      />
      <ChevronDown aria-hidden="true" className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 muted" size={16} />
    </div>
  );
}

export function Score({ value, label }: { value: number; label: string }) {
  const color =
    value >= 90
      ? 'bg-[var(--success)]'
      : value >= 75
      ? 'bg-[var(--accent)]'
      : 'bg-[var(--warn)]';

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-xs">
        <span className="font-medium muted">{label}</span>
        <strong className="font-bold text-[var(--text)]">{value}/100</strong>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-[var(--surface2)]">
        <div
          className={`h-full rounded-full transition-all duration-300 ${color}`}
          style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
          role="progressbar"
          aria-valuenow={value}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`${label} score: ${value} out of 100`}
        />
      </div>
    </div>
  );
}

export function CopyButton({ text, label = 'Copy' }: { text: string; label?: string }) {
  const [done, setDone] = useState(false);

  const handleCopy = async () => {
    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
      } else {
        // Fallback for older browsers
        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      }
      setDone(true);
      window.setTimeout(() => setDone(false), 1800);
    } catch {
      // Ignore clipboard permission errors gracefully
    }
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleCopy}
      aria-label={`${done ? 'Copied' : label} text to clipboard`}
      title={done ? 'Copied!' : 'Copy to clipboard'}
    >
      {done ? <Check size={14} className="text-[var(--success)]" aria-hidden="true" /> : <Copy size={14} aria-hidden="true" />}
      <span>{done ? 'Copied' : label}</span>
    </Button>
  );
}

export function Notice({
  children,
  kind = 'info',
  onClose,
}: {
  children: React.ReactNode;
  kind?: 'error' | 'info' | 'success' | 'warn';
  onClose?: () => void;
}) {
  const icons = {
    error: <AlertCircle size={18} className="shrink-0 text-[var(--danger)]" aria-hidden="true" />,
    warn: <AlertTriangle size={18} className="shrink-0 text-[var(--warn)]" aria-hidden="true" />,
    success: <CheckCircle2 size={18} className="shrink-0 text-[var(--success)]" aria-hidden="true" />,
    info: <Info size={18} className="shrink-0 text-[var(--accent)]" aria-hidden="true" />,
  };

  const borderClasses = {
    error: 'border-[var(--danger)]/30 bg-[var(--danger)]/5 text-[var(--text)]',
    warn: 'border-[var(--warn)]/30 bg-[var(--warn)]/5 text-[var(--text)]',
    success: 'border-[var(--success)]/30 bg-[var(--success)]/5 text-[var(--text)]',
    info: 'border-[var(--accent)]/30 bg-[var(--accent)]/5 text-[var(--text)]',
  };

  return (
    <div
      role={kind === 'error' ? 'alert' : 'status'}
      aria-live="polite"
      className={`flex items-start justify-between gap-3 rounded-xl border p-4 text-sm ${borderClasses[kind]}`}
    >
      <div className="flex items-start gap-3 min-w-0">
        {icons[kind]}
        <div className="leading-relaxed">{children}</div>
      </div>
      {onClose ? (
        <button
          onClick={onClose}
          className="focus-ring -mr-1 -mt-1 rounded-md p-1.5 text-muted hover:text-[var(--text)]"
          aria-label="Dismiss notice"
        >
          <X size={15} />
        </button>
      ) : null}
    </div>
  );
}

export function Badge({
  children,
  variant = 'default',
}: {
  children: React.ReactNode;
  variant?: 'default' | 'accent' | 'success' | 'warn' | 'danger';
}) {
  const styles = {
    default: 'bg-[var(--surface2)] text-muted border-line',
    accent: 'bg-[var(--accent)]/10 text-[var(--accent)] border-[var(--accent)]/20',
    success: 'bg-[var(--success)]/10 text-[var(--success)] border-[var(--success)]/20',
    warn: 'bg-[var(--warn)]/10 text-[var(--warn)] border-[var(--warn)]/20',
    danger: 'bg-[var(--danger)]/10 text-[var(--danger)] border-[var(--danger)]/20',
  };

  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${styles[variant]}`}>
      {children}
    </span>
  );
}

export function Modal({
  open,
  onClose,
  title,
  description,
  children,
  maxWidth = 'max-w-xl',
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  maxWidth?: string;
}) {
  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      aria-describedby={description ? 'modal-description' : undefined}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
    >
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        className={`relative w-full ${maxWidth} rounded-2xl border border-line bg-[var(--surface)] p-6 shadow-2xl transition-all`}
      >
        <div className="flex items-start justify-between gap-4 border-b border-line pb-4">
          <div>
            <h2 id="modal-title" className="text-lg font-bold text-[var(--text)]">
              {title}
            </h2>
            {description ? (
              <p id="modal-description" className="mt-1 text-sm muted">
                {description}
              </p>
            ) : null}
          </div>
          <button
            onClick={onClose}
            className="focus-ring -mr-1 -mt-1 rounded-lg p-2 text-muted hover:bg-[var(--surface2)] hover:text-[var(--text)]"
            aria-label="Close dialog"
          >
            <X size={18} />
          </button>
        </div>
        <div className="mt-4">{children}</div>
      </div>
    </div>
  );
}
