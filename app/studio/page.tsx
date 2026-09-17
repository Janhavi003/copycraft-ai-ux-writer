'use client';

import { Suspense, useEffect, useMemo, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import {
  Sparkles,
  Save,
  Download,
  Check,
  ChevronRight,
  ChevronDown,
  ArrowRight,
  RotateCcw,
  SlidersHorizontal,
  Info,
  Layers,
  ArrowLeftRight,
} from 'lucide-react';
import {
  Button,
  CopyButton,
  Field,
  Input,
  Notice,
  Score,
  Select,
  Textarea,
  Badge,
  Modal,
} from '@/components/ui';
import { loadStore, saveStore, upsertGeneration } from '@/lib/data/store';
import type {
  CopyGeneration,
  Tone,
  Audience,
  ComponentType,
  AppStore,
  Alternative,
  ScoreDimension,
} from '@/types';

const components: ComponentType[] = [
  'Button',
  'Confirmation',
  'Error',
  'Empty State',
  'Toast',
  'Form',
  'Tooltip',
  'Banner',
  'Dialog',
  'Navigation',
  'Onboarding',
  'Success',
  'Permission',
  'Loading',
  'Login',
  'Signup',
  'Checkout',
  'Search',
  'Settings',
  'Account',
];

const tones: Tone[] = [
  'Friendly',
  'Professional',
  'Confident',
  'Empathetic',
  'Playful',
  'Minimal',
  'Direct',
];

const audiences: Audience[] = [
  'General',
  'Consumers',
  'Developers',
  'Designers',
  'Business',
  'Enterprise',
];

const initialForm = {
  component: 'Confirmation' as ComponentType,
  product: 'Pulse Banking',
  goal: 'Delete a linked bank account safely',
  action: 'User clicks delete account',
  audience: 'Consumers' as Audience,
  tone: 'Empathetic' as Tone,
  context: 'The action permanently removes transaction history and account links. User must understand it cannot be undone.',
  voiceId: 'pulse',
  projectId: 'pulse',
  constraints: '',
  characterLimit: '',
  platform: 'Mobile & Web',
  locale: 'en-US',
  accessibilityReqs: '',
};

function StudioContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [mode, setMode] = useState<'generate' | 'analyze'>('generate');
  const [form, setForm] = useState(initialForm);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [analyzeText, setAnalyzeText] = useState('');
  const [result, setResult] = useState<CopyGeneration | null>(null);
  const [alternatives, setAlternatives] = useState<Alternative[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState('');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState<{ msg: string; kind: 'info' | 'success' | 'warn' } | null>(null);
  const [store, setStore] = useState<AppStore | null>(null);

  // Comparison Modal state for Improvements
  const [comparisonModalOpen, setComparisonModalOpen] = useState(false);
  const [improvementCandidate, setImprovementCandidate] = useState<CopyGeneration | null>(null);
  const [improvementInstruction, setImprovementInstruction] = useState('');

  // Selected Inspector dimension for detailed view
  const [activeDimension, setActiveDimension] = useState<string | null>('Clarity');

  useEffect(() => {
    const loadedStore = loadStore();
    setStore(loadedStore);

    // Check query params: ?projectId=..., ?pattern=..., ?generationId=...
    const qProjectId = searchParams.get('projectId');
    const qPattern = searchParams.get('pattern');
    const qGenId = searchParams.get('generationId');

    if (qGenId) {
      const existing = loadedStore.generations.find(g => g.id === qGenId);
      if (existing) {
        setResult(existing);
        setAlternatives(existing.alternatives || []);
        setForm(f => ({
          ...f,
          component: existing.component,
          product: existing.product,
          goal: existing.goal,
          action: existing.action,
          audience: existing.audience,
          tone: existing.tone,
          context: existing.constraints || f.context,
          projectId: existing.projectId || '',
          voiceId: existing.brandVoiceId || f.voiceId,
        }));
        setNotice({ msg: `Loaded saved copy: "${existing.headline}"`, kind: 'info' });
      }
    } else if (qPattern) {
      setMode('analyze');
      setAnalyzeText(qPattern);
      setNotice({ msg: 'Loaded pattern template into Inspector.', kind: 'info' });
    } else if (qProjectId) {
      const proj = loadedStore.projects.find(p => p.id === qProjectId);
      if (proj) {
        setForm(f => ({
          ...f,
          projectId: proj.id,
          product: proj.product || proj.name,
          audience: proj.audience,
          voiceId: proj.brandVoiceId || f.voiceId,
        }));
        setNotice({ msg: `Generating copy for project: ${proj.name}`, kind: 'info' });
      }
    } else {
      // Default to first generation in store if available
      if (loadedStore.generations[0]) {
        setResult(loadedStore.generations[0]);
        setAlternatives(loadedStore.generations[0].alternatives || []);
      }
    }
  }, [searchParams]);

  function updateField<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm(prev => ({ ...prev, [key]: value }));
  }

  const selectedVoice = useMemo(() => {
    if (!store) return undefined;
    return store.brandVoices.find(v => v.id === form.voiceId);
  }, [store, form.voiceId]);

  const selectedProject = useMemo(() => {
    if (!store) return undefined;
    return store.projects.find(p => p.id === form.projectId);
  }, [store, form.projectId]);

  async function makeApiCall(endpoint: string, payload: unknown, stepLabel: string) {
    setLoading(true);
    setLoadingStep(stepLabel);
    setError('');
    try {
      const res = await fetch(`/api/${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'The request could not be completed.');
      }
      if (data.demo && data.userNotice) {
        setNotice({ msg: data.userNotice, kind: 'warn' });
      }
      return data;
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Network error occurred.';
      setError(msg);
      return null;
    } finally {
      setLoading(false);
      setLoadingStep('');
    }
  }

  async function handleGenerate() {
    if (!form.product.trim() || !form.goal.trim() || !form.action.trim()) {
      setError('Please provide the product name, user goal, and primary action.');
      return;
    }

    const payload = {
      component: form.component,
      product: form.product,
      goal: form.goal,
      action: form.action,
      audience: form.audience,
      tone: form.tone,
      context: form.context,
      constraints: form.constraints,
      characterLimit: form.characterLimit ? parseInt(form.characterLimit, 10) : undefined,
      platform: form.platform,
      locale: form.locale,
      accessibilityReqs: form.accessibilityReqs,
      brandVoice: selectedVoice
        ? {
            name: selectedVoice.name,
            rules: selectedVoice.rules,
            personality: selectedVoice.personality,
            tone: selectedVoice.tone,
            wordsToUse: selectedVoice.wordsToUse,
            wordsToAvoid: selectedVoice.wordsToAvoid,
          }
        : undefined,
    };

    const res = await makeApiCall('generate', payload, 'Writing your first draft…');
    if (res?.result) {
      const r = res.result;
      const overallScore = Math.round(
        (r.analysis.clarity +
          r.analysis.conciseness +
          r.analysis.tone +
          r.analysis.accessibility +
          r.analysis.specificity +
          r.analysis.actionability +
          r.analysis.confidence) /
          7
      );

      const newGen: CopyGeneration = {
        id: crypto.randomUUID(),
        projectId: form.projectId || undefined,
        projectName: selectedProject?.name,
        component: form.component,
        product: form.product,
        goal: form.goal,
        action: form.action,
        audience: form.audience,
        tone: form.tone,
        brandVoiceId: selectedVoice?.id,
        brandVoiceName: selectedVoice?.name,
        headline: r.headline,
        body: r.body,
        primaryAction: r.primary_action,
        secondaryAction: r.secondary_action,
        supportingText: r.supporting_text,
        errorText: r.error_text,
        constraints: form.constraints,
        score: overallScore,
        analysis: r.analysis,
        alternatives: r.alternatives || [],
        createdAt: 'Just now',
      };

      setResult(newGen);
      setAlternatives(r.alternatives || []);
      if (!res.demo) {
        setNotice({ msg: 'Fresh draft generated with live model.', kind: 'success' });
      }
    }
  }

  async function handleAnalyze() {
    if (!analyzeText.trim()) {
      setError('Please enter or paste the interface copy you wish to analyze.');
      return;
    }

    const payload = {
      text: analyzeText,
      context: form.context || `Component: ${form.component}, Product: ${form.product}`,
    };

    const res = await makeApiCall('analyze', payload, 'Inspecting clarity, tone, and accessibility…');
    if (res?.analysis) {
      const a = res.analysis;
      const overallScore = Math.round(
        (a.clarity + a.conciseness + a.tone + a.accessibility + a.specificity + a.actionability + a.confidence) / 7
      );

      const parsedGen: CopyGeneration = result
        ? {
            ...result,
            headline: analyzeText.split('\n')[0] || result.headline,
            analysis: a,
            score: overallScore,
          }
        : {
            id: crypto.randomUUID(),
            component: form.component,
            product: form.product,
            goal: form.goal,
            action: form.action,
            audience: form.audience,
            tone: form.tone,
            headline: analyzeText.split('\n')[0] || analyzeText,
            body: analyzeText.split('\n').slice(1).join(' ') || '',
            primaryAction: 'Confirm',
            score: overallScore,
            analysis: a,
            createdAt: 'Just now',
          };

      setResult(parsedGen);
      setNotice({ msg: 'Inspection complete. Review your scores and recommendations below.', kind: 'info' });
    }
  }

  async function handleImproveAction(instruction: string) {
    if (!result) return;
    setImprovementInstruction(instruction);

    const fullCopy = [
      result.headline,
      result.body,
      result.primaryAction,
      result.secondaryAction,
      result.supportingText,
    ]
      .filter(Boolean)
      .join('\n');

    const res = await makeApiCall(
      'improve',
      { copy: fullCopy, instruction, context: form.context },
      'Applying focused improvement…'
    );

    if (res?.result) {
      const r = res.result;
      const overallScore = Math.round(
        (r.analysis.clarity +
          r.analysis.conciseness +
          r.analysis.tone +
          r.analysis.accessibility +
          r.analysis.specificity +
          r.analysis.actionability +
          r.analysis.confidence) /
          7
      );

      const candidate: CopyGeneration = {
        ...result,
        headline: r.headline,
        body: r.body,
        primaryAction: r.primary_action,
        secondaryAction: r.secondary_action,
        supportingText: r.supporting_text,
        errorText: r.error_text,
        analysis: r.analysis,
        alternatives: r.alternatives || result.alternatives,
        score: overallScore,
        updatedAt: 'Just now',
      };

      setImprovementCandidate(candidate);
      setComparisonModalOpen(true);
    }
  }

  function applyImprovement() {
    if (improvementCandidate) {
      setResult(improvementCandidate);
      if (improvementCandidate.alternatives) {
        setAlternatives(improvementCandidate.alternatives);
      }
      setNotice({ msg: 'Applied improved draft to output.', kind: 'success' });
    }
    setComparisonModalOpen(false);
    setImprovementCandidate(null);
  }

  async function handleFetchVariations() {
    if (!result) return;
    const currentCopy = `${result.headline} | ${result.body} | ${result.primaryAction}`;
    const res = await makeApiCall(
      'variations',
      { copy: currentCopy, context: form.context },
      'Crafting interface alternatives…'
    );

    if (res?.alternatives) {
      setAlternatives(res.alternatives);
      setNotice({ msg: 'Generated three distinct variations.', kind: 'success' });
    }
  }

  function applyVariation(alt: Alternative) {
    if (!result) return;
    const updated = {
      ...result,
      primaryAction: alt.copy.split('—')[1]?.trim() || alt.copy,
      headline: alt.copy.includes('?') ? alt.copy : result.headline,
      score: Math.max(result.score, alt.score),
    };
    setResult(updated);
    setNotice({ msg: `Applied variation: "${alt.label}"`, kind: 'success' });
  }

  function handleSave() {
    if (!result || !store) return;
    const toSave: CopyGeneration = {
      ...result,
      projectId: form.projectId || result.projectId,
      projectName: selectedProject?.name || result.projectName,
      brandVoiceId: selectedVoice?.id || result.brandVoiceId,
      brandVoiceName: selectedVoice?.name || result.brandVoiceName,
    };
    const nextStore = upsertGeneration(store, toSave);
    saveStore(nextStore);
    setStore(nextStore);
    setResult(toSave);
    setNotice({ msg: `Saved to workspace under ${selectedProject ? selectedProject.name : 'General History'}.`, kind: 'success' });
  }

  function handleExport() {
    if (!result) return;
    const lines = [
      `=========================================`,
      `COPYCRAFT UX SPECIFICATION`,
      `=========================================`,
      `Component: ${result.component}`,
      `Product:   ${result.product}`,
      `Goal:      ${result.goal}`,
      `Action:    ${result.action}`,
      `Audience:  ${result.audience}`,
      `Tone:      ${result.tone}`,
      `Brand Voice: ${result.brandVoiceName || 'Default'}`,
      `Score:     ${result.score}/100`,
      `Created:   ${result.createdAt}`,
      `-----------------------------------------`,
      `HEADLINE:`,
      result.headline,
      ``,
      `BODY:`,
      result.body,
      ``,
      `PRIMARY CTA:`,
      result.primaryAction,
      ``,
      result.secondaryAction ? `SECONDARY CTA:\n${result.secondaryAction}\n` : '',
      result.supportingText ? `HELPER / SUPPORTING TEXT:\n${result.supportingText}\n` : '',
      result.errorText ? `ERROR TEXT:\n${result.errorText}\n` : '',
      `-----------------------------------------`,
      `INSPECTOR SCORES:`,
      `Clarity:       ${result.analysis.clarity}/100`,
      `Conciseness:   ${result.analysis.conciseness}/100`,
      `Tone:          ${result.analysis.tone}/100`,
      `Accessibility: ${result.analysis.accessibility}/100`,
      `Specificity:   ${result.analysis.specificity}/100`,
      `Actionability: ${result.analysis.actionability}/100`,
      `Confidence:    ${result.analysis.confidence}/100`,
      ``,
      `STRENGTHS:`,
      ...result.analysis.strengths.map(s => `• ${s}`),
      ``,
      `IMPROVEMENTS:`,
      ...result.analysis.improvements.map(i => `• ${i}`),
      `=========================================`,
    ].filter(l => l !== undefined);

    const blob = new Blob([lines.join('\n')], { type: 'text/plain;charset=utf-8' });
    const slug = result.product.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || 'copy';
    const filename = `copycraft-${result.component.toLowerCase()}-${slug}.txt`;
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setNotice({ msg: `Exported ${filename}`, kind: 'success' });
  }

  const scoreDimensionsList = useMemo(() => {
    if (!result?.analysis) return [];
    return [
      { name: 'Clarity', score: result.analysis.clarity },
      { name: 'Conciseness', score: result.analysis.conciseness },
      { name: 'Tone', score: result.analysis.tone },
      { name: 'Accessibility', score: result.analysis.accessibility },
      { name: 'Specificity', score: result.analysis.specificity },
      { name: 'Actionability', score: result.analysis.actionability },
      { name: 'Confidence', score: result.analysis.confidence },
    ];
  }, [result]);

  const activeDimensionDetail = useMemo(() => {
    if (!result?.analysis?.dimensionFeedback || !activeDimension) return null;
    return result.analysis.dimensionFeedback.find(
      d => d.dimension.toLowerCase() === activeDimension.toLowerCase()
    );
  }, [result, activeDimension]);

  return (
    <div className="space-y-6">
      {/* Studio Header */}
      <header className="border-b border-line pb-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="text-xs font-bold uppercase tracking-[.18em] text-[var(--accent)]">
              Copy Studio
            </div>
            <h1 className="serif mt-1 text-4xl md:text-5xl font-normal text-[var(--text)]">
              Precision UX Writing
            </h1>
            <p className="mt-2 text-sm text-muted max-w-3xl">
              Turn product goals and user states into tested, accessible interface copy. Analyze heuristics and iterate with focused improvements.
            </p>
          </div>

          {/* Mode Switcher */}
          <div
            role="tablist"
            aria-label="Studio mode selection"
            className="flex rounded-xl border border-line bg-[var(--surface)] p-1 shadow-xs"
          >
            <button
              role="tab"
              aria-selected={mode === 'generate'}
              className={`focus-ring rounded-lg px-4 py-2 text-xs font-bold transition ${
                mode === 'generate'
                  ? 'bg-[var(--accent)] text-white shadow-xs'
                  : 'text-muted hover:text-[var(--text)]'
              }`}
              onClick={() => setMode('generate')}
            >
              Create UX Copy
            </button>
            <button
              role="tab"
              aria-selected={mode === 'analyze'}
              className={`focus-ring rounded-lg px-4 py-2 text-xs font-bold transition ${
                mode === 'analyze'
                  ? 'bg-[var(--accent)] text-white shadow-xs'
                  : 'text-muted hover:text-[var(--text)]'
              }`}
              onClick={() => setMode('analyze')}
            >
              Analyze Existing Copy
            </button>
          </div>
        </div>
      </header>

      {/* Notifications */}
      {error ? (
        <Notice kind="error" onClose={() => setError('')}>
          {error}
        </Notice>
      ) : null}

      {notice ? (
        <Notice kind={notice.kind} onClose={() => setNotice(null)}>
          {notice.msg}
        </Notice>
      ) : null}

      {/* Main Studio Grid */}
      <div className="grid gap-6 xl:grid-cols-[440px_minmax(0,1fr)]">
        {/* Left Column: Context & Controls Form */}
        <section
          aria-labelledby="studio-form-heading"
          className="rounded-2xl border border-line bg-[var(--surface)] p-5 md:p-6 shadow-xs flex flex-col justify-between"
        >
          <div className="space-y-5">
            <div className="flex items-center justify-between border-b border-line pb-3">
              <h2 id="studio-form-heading" className="text-xs font-bold uppercase tracking-wider text-muted">
                {mode === 'generate' ? 'Interface Context' : 'Audit Parameters'}
              </h2>
              <Badge variant="accent">{form.component}</Badge>
            </div>

            {mode === 'generate' ? (
              <>
                <Field label="Interface Component" hint="Select the UI pattern you are crafting copy for">
                  <Select
                    value={form.component}
                    onChange={e => updateField('component', e.target.value as ComponentType)}
                  >
                    {components.map(c => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </Select>
                </Field>

                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Product / Feature" required hint="e.g. Mobile Checkout">
                    <Input
                      value={form.product}
                      onChange={e => updateField('product', e.target.value)}
                      placeholder="e.g. Workspace Settings"
                    />
                  </Field>

                  <Field label="Target Audience">
                    <Select
                      value={form.audience}
                      onChange={e => updateField('audience', e.target.value as Audience)}
                    >
                      {audiences.map(a => (
                        <option key={a} value={a}>
                          {a}
                        </option>
                      ))}
                    </Select>
                  </Field>
                </div>

                <Field label="User Goal" required hint="What is the user trying to achieve?">
                  <Input
                    value={form.goal}
                    onChange={e => updateField('goal', e.target.value)}
                    placeholder="e.g. Safely remove an obsolete payment method"
                  />
                </Field>

                <Field label="Primary User Action" required hint="The trigger or click leading to this screen">
                  <Input
                    value={form.action}
                    onChange={e => updateField('action', e.target.value)}
                    placeholder="e.g. Clicks 'Remove Card'"
                  />
                </Field>

                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Tone Profile">
                    <Select
                      value={form.tone}
                      onChange={e => updateField('tone', e.target.value as Tone)}
                    >
                      {tones.map(t => (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      ))}
                    </Select>
                  </Field>

                  <Field label="Brand Voice">
                    <Select
                      value={form.voiceId}
                      onChange={e => updateField('voiceId', e.target.value)}
                    >
                      {store?.brandVoices.map(v => (
                        <option key={v.id} value={v.id}>
                          {v.name} {v.isDefault ? '(Default)' : ''}
                        </option>
                      ))}
                    </Select>
                  </Field>
                </div>

                <Field
                  label="Additional Context"
                  hint="Specify consequences, recovery routes, or required terms"
                >
                  <Textarea
                    value={form.context}
                    onChange={e => updateField('context', e.target.value)}
                    rows={3}
                    placeholder="e.g. Subscription renews in 3 days; user must download invoices first."
                  />
                </Field>

                {/* Progressive Disclosure: Advanced Constraints */}
                <div className="border-t border-line pt-3">
                  <button
                    type="button"
                    onClick={() => setShowAdvanced(v => !v)}
                    className="focus-ring flex items-center gap-1.5 text-xs font-semibold text-[var(--accent)]"
                    aria-expanded={showAdvanced}
                  >
                    <SlidersHorizontal size={14} />
                    <span>{showAdvanced ? 'Hide Constraints & Platform' : 'Add Constraints, Platform & A11y'}</span>
                    <ChevronDown size={14} className={`transition-transform ${showAdvanced ? 'rotate-180' : ''}`} />
                  </button>

                  {showAdvanced ? (
                    <div className="mt-4 space-y-4 rounded-xl bg-[var(--surface2)]/60 p-4">
                      <div className="grid gap-4 sm:grid-cols-2">
                        <Field label="Character Limit" hint="Optional max length">
                          <Input
                            type="number"
                            value={form.characterLimit}
                            onChange={e => updateField('characterLimit', e.target.value)}
                            placeholder="e.g. 40"
                          />
                        </Field>

                        <Field label="Target Platform">
                          <Select
                            value={form.platform}
                            onChange={e => updateField('platform', e.target.value)}
                          >
                            <option value="Mobile & Web">Mobile & Web</option>
                            <option value="iOS App">iOS App</option>
                            <option value="Android App">Android App</option>
                            <option value="Desktop SaaS">Desktop SaaS</option>
                            <option value="Email Notification">Email</option>
                          </Select>
                        </Field>
                      </div>

                      <Field label="Accessibility & Inclusivity Guidance">
                        <Input
                          value={form.accessibilityReqs}
                          onChange={e => updateField('accessibilityReqs', e.target.value)}
                          placeholder="e.g. Screen reader announcements, avoid color-only clues"
                        />
                      </Field>
                    </div>
                  ) : null}
                </div>
              </>
            ) : (
              <>
                <Field
                  label="Interface Copy to Audit"
                  required
                  hint="Paste existing buttons, dialogs, or error messages"
                >
                  <Textarea
                    value={analyzeText}
                    onChange={e => setAnalyzeText(e.target.value)}
                    rows={8}
                    placeholder="e.g. Are you sure you want to proceed? Click OK to submit or Cancel to abort."
                  />
                </Field>

                <Field
                  label="Surrounding Screen Context"
                  hint="Where does this appear? What is the user attempting?"
                >
                  <Textarea
                    value={form.context}
                    onChange={e => updateField('context', e.target.value)}
                    rows={3}
                    placeholder="e.g. Checkout review step before credit card charge."
                  />
                </Field>
              </>
            )}

            {/* Associate with Project */}
            <div className="border-t border-line pt-3">
              <Field label="Save to Project" hint="Keeps copy organized inside your product repository">
                <Select
                  value={form.projectId}
                  onChange={e => updateField('projectId', e.target.value)}
                >
                  <option value="">No Project (Standalone Draft)</option>
                  {store?.projects.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.copyCount} items)
                    </option>
                  ))}
                </Select>
              </Field>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-line">
            <Button
              variant="primary"
              size="lg"
              className="w-full shadow-md"
              loading={loading}
              onClick={mode === 'generate' ? handleGenerate : handleAnalyze}
            >
              <Sparkles size={16} />
              <span>
                {loading
                  ? loadingStep || 'Processing…'
                  : mode === 'generate'
                  ? 'Generate UX Copy'
                  : 'Inspect Copy'}
              </span>
            </Button>
          </div>
        </section>

        {/* Right Column: Output & Inspector */}
        <div className="space-y-6">
          {result ? (
            <>
              {/* Output Preview Card */}
              <section
                aria-labelledby="output-preview-heading"
                className="rounded-2xl border border-line bg-[var(--surface)] p-6 md:p-7 shadow-xs"
              >
                <div className="flex flex-wrap items-center justify-between gap-4 border-b border-line pb-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 id="output-preview-heading" className="text-xs font-bold uppercase tracking-wider text-muted">
                        Structured Output
                      </h2>
                      <Badge variant="default">{result.component}</Badge>
                      {result.projectName ? <Badge variant="accent">{result.projectName}</Badge> : null}
                    </div>
                    <div className="serif mt-2 text-2xl md:text-3xl text-[var(--text)] font-semibold">
                      {result.headline}
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <div className="text-xs text-muted font-medium">Quality Score</div>
                      <div className="text-2xl font-black text-[var(--text)]">{result.score}/100</div>
                    </div>
                    <Button variant="outline" size="sm" onClick={handleSave} title="Save to History and Project">
                      <Save size={15} />
                      <span>Save</span>
                    </Button>
                    <Button variant="outline" size="sm" onClick={handleExport} title="Download text specification">
                      <Download size={15} />
                      <span>Export</span>
                    </Button>
                    <CopyButton
                      text={[
                        result.headline,
                        result.body,
                        `Primary CTA: ${result.primaryAction}`,
                        result.secondaryAction ? `Secondary CTA: ${result.secondaryAction}` : '',
                        result.supportingText ? `Helper: ${result.supportingText}` : '',
                        result.errorText ? `Error: ${result.errorText}` : '',
                      ]
                        .filter(Boolean)
                        .join('\n\n')}
                      label="Copy All"
                    />
                  </div>
                </div>

                {/* Interface Preview Rendering Box */}
                <div className="mt-6 rounded-xl border border-line bg-[var(--surface2)]/80 p-6">
                  <div className="text-xs font-bold uppercase tracking-wider text-muted mb-2">
                    Live UI Preview
                  </div>
                  <div className="rounded-xl border border-line bg-[var(--surface)] p-5 shadow-xs max-w-xl">
                    <div className="font-bold text-base text-[var(--text)]">{result.headline}</div>
                    <p className="mt-2 text-sm leading-relaxed text-muted">{result.body}</p>

                    {/* CTAs */}
                    <div className="mt-5 flex flex-wrap items-center gap-3">
                      <button
                        type="button"
                        className="focus-ring inline-flex min-h-10 items-center justify-center rounded-lg bg-[var(--accent)] px-4 py-2 text-sm font-bold text-white shadow-xs"
                      >
                        {result.primaryAction}
                      </button>

                      {result.secondaryAction ? (
                        <button
                          type="button"
                          className="focus-ring inline-flex min-h-10 items-center justify-center rounded-lg border border-line bg-[var(--surface)] px-4 py-2 text-sm font-semibold text-[var(--text)] hover:bg-[var(--surface2)]"
                        >
                          {result.secondaryAction}
                        </button>
                      ) : null}
                    </div>

                    {result.supportingText ? (
                      <p className="mt-3.5 text-xs text-muted leading-normal">
                        {result.supportingText}
                      </p>
                    ) : null}

                    {result.errorText ? (
                      <p className="mt-2 text-xs text-[var(--danger)] font-medium">
                        {result.errorText}
                      </p>
                    ) : null}
                  </div>
                </div>

                {/* Quick Improvement Action Bar */}
                <div className="mt-6 border-t border-line pt-5">
                  <div className="text-xs font-bold uppercase tracking-wider text-muted mb-3">
                    Focused Improvement Actions
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => handleImproveAction('Shorten the copy significantly while keeping the primary consequence clear.')}
                    >
                      <RotateCcw size={14} />
                      <span>Shorten</span>
                    </Button>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => handleImproveAction('Make the primary action verb clearer and outcome-oriented instead of generic.')}
                    >
                      <Sparkles size={14} />
                      <span>Make Action Clearer</span>
                    </Button>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => handleImproveAction('Make the tone more empathetic, supportive, and reassure the user about their data.')}
                    >
                      <span>More Empathetic</span>
                    </Button>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => handleImproveAction('Make the tone confident, direct, and authoritative.')}
                    >
                      <span>More Confident</span>
                    </Button>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => handleImproveAction('Improve accessibility: simplify reading level, avoid idioms, and ensure screen reader clarity.')}
                    >
                      <span>Boost Accessibility</span>
                    </Button>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={handleFetchVariations}
                    >
                      <Layers size={14} />
                      <span>Generate Variations</span>
                    </Button>
                  </div>
                </div>
              </section>

              {/* Copy Inspector Section */}
              <section
                aria-labelledby="inspector-heading"
                className="rounded-2xl border border-line bg-[var(--surface)] p-6 md:p-7 shadow-xs"
              >
                <div className="flex items-center justify-between border-b border-line pb-4">
                  <div>
                    <h2 id="inspector-heading" className="text-lg font-bold text-[var(--text)]">
                      Copy Inspector
                    </h2>
                    <p className="text-xs text-muted">
                      7 UX writing dimensions with granular heuristic scoring and concrete fixes.
                    </p>
                  </div>
                  <span className="text-xs font-bold text-muted uppercase">Interactive Audit</span>
                </div>

                {/* Score Dimension Grid */}
                <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {scoreDimensionsList.map(dim => (
                    <button
                      key={dim.name}
                      type="button"
                      onClick={() => setActiveDimension(dim.name)}
                      className={`focus-ring rounded-xl border p-3.5 text-left transition ${
                        activeDimension?.toLowerCase() === dim.name.toLowerCase()
                          ? 'border-[var(--accent)] bg-[var(--accent)]/5 shadow-xs'
                          : 'border-line bg-[var(--surface)] hover:bg-[var(--surface2)]'
                      }`}
                    >
                      <Score label={dim.name} value={dim.score} />
                      <div className="mt-2 flex items-center justify-between text-[11px] text-[var(--accent)] font-semibold">
                        <span>Inspect detail</span>
                        <ChevronRight size={13} />
                      </div>
                    </button>
                  ))}
                </div>

                {/* Active Dimension Deep Dive Card */}
                {activeDimensionDetail ? (
                  <div className="mt-4 rounded-xl border border-[var(--accent)]/30 bg-[var(--accent)]/5 p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Info size={16} className="text-[var(--accent)]" />
                        <h3 className="font-bold text-sm text-[var(--text)]">
                          {activeDimensionDetail.dimension} Heuristic ({activeDimensionDetail.score}/100)
                        </h3>
                      </div>
                    </div>
                    <div className="mt-2 grid gap-2 md:grid-cols-2 text-xs">
                      <div>
                        <strong className="text-muted block">Why this score was given:</strong>
                        <p className="mt-0.5 text-[var(--text)] leading-relaxed">
                          {activeDimensionDetail.rationale}
                        </p>
                      </div>
                      <div>
                        <strong className="text-muted block">Concrete Recommendation:</strong>
                        <p className="mt-0.5 text-[var(--text)] leading-relaxed font-medium">
                          {activeDimensionDetail.recommendation}
                        </p>
                      </div>
                    </div>
                  </div>
                ) : null}

                {/* Strengths and Next Steps */}
                <div className="mt-6 grid gap-4 md:grid-cols-2">
                  <div className="rounded-xl border border-line bg-[var(--surface2)]/50 p-4">
                    <h3 className="font-bold text-sm text-[var(--text)] flex items-center gap-2">
                      <Check size={16} className="text-[var(--success)]" />
                      <span>What Works Well</span>
                    </h3>
                    <ul className="mt-3 space-y-2 text-xs text-[var(--text)]">
                      {result.analysis.strengths.map(st => (
                        <li key={st} className="flex items-start gap-2">
                          <span className="text-[var(--success)] font-bold">•</span>
                          <span>{st}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="rounded-xl border border-line bg-[var(--surface2)]/50 p-4">
                    <h3 className="font-bold text-sm text-[var(--text)] flex items-center gap-2">
                      <ChevronRight size={16} className="text-[var(--warn)]" />
                      <span>Recommended Refinements</span>
                    </h3>
                    <ul className="mt-3 space-y-2 text-xs text-[var(--text)]">
                      {result.analysis.improvements.map(im => (
                        <li key={im} className="flex items-start gap-2">
                          <span className="text-[var(--warn)] font-bold">•</span>
                          <span>{im}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </section>

              {/* Variations Section */}
              {alternatives.length > 0 ? (
                <section
                  aria-labelledby="variations-heading"
                  className="rounded-2xl border border-line bg-[var(--surface)] p-6 shadow-xs"
                >
                  <div className="flex items-center justify-between border-b border-line pb-4">
                    <div>
                      <h2 id="variations-heading" className="text-lg font-bold text-[var(--text)]">
                        Interface Variations
                      </h2>
                      <p className="text-xs text-muted">
                        Test different tones, angles, and constraints. Apply directly to the output.
                      </p>
                    </div>
                    <Badge variant="accent">{alternatives.length} ready</Badge>
                  </div>

                  <div className="mt-5 grid gap-4 md:grid-cols-3">
                    {alternatives.map((alt, idx) => (
                      <article
                        key={idx}
                        className="rounded-xl border border-line bg-[var(--surface2)]/40 p-4 flex flex-col justify-between"
                      >
                        <div>
                          <div className="flex items-center justify-between gap-2">
                            <span className="font-bold text-xs text-[var(--text)]">{alt.label}</span>
                            <Badge variant={alt.score >= 92 ? 'success' : 'default'}>
                              {alt.score}/100
                            </Badge>
                          </div>
                          {alt.tone ? (
                            <div className="mt-1 text-[11px] text-muted">Tone: {alt.tone}</div>
                          ) : null}
                          <div className="mt-3 rounded-lg border border-line bg-[var(--surface)] p-3 text-sm font-medium text-[var(--text)] leading-snug">
                            {alt.copy}
                          </div>
                          <p className="mt-2 text-xs text-muted leading-relaxed">{alt.reason}</p>
                        </div>

                        <div className="mt-4 pt-3 border-t border-line flex items-center justify-between gap-2">
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => applyVariation(alt)}
                            aria-label={`Apply variation ${alt.label}`}
                          >
                            <span>Apply</span>
                          </Button>
                          <CopyButton text={alt.copy} label="Copy" />
                        </div>
                      </article>
                    ))}
                  </div>
                </section>
              ) : null}
            </>
          ) : (
            /* Empty State */
            <div className="grid min-h-[520px] place-items-center rounded-2xl border border-dashed border-line bg-[var(--surface)] p-8 text-center">
              <div className="max-w-md space-y-4">
                <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-[var(--surface2)] text-[var(--accent)] shadow-xs">
                  <Sparkles size={28} />
                </div>
                <h2 className="serif text-3xl font-normal text-[var(--text)]">
                  Start with user intent, not generic prompts
                </h2>
                <p className="text-sm text-muted leading-relaxed">
                  Fill in the interface context on the left and click <strong>Generate UX Copy</strong>. CopyCraft evaluates seven heuristics, guarantees specific CTAs, and produces production-ready microcopy.
                </p>
                <div className="pt-2">
                  <Button variant="primary" onClick={handleGenerate} loading={loading}>
                    Generate Demo Draft
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Comparison Modal for Improvements */}
      {comparisonModalOpen && improvementCandidate && result ? (
        <Modal
          open={comparisonModalOpen}
          onClose={() => setComparisonModalOpen(false)}
          title="Compare & Apply Improvement"
          description={`Instruction: "${improvementInstruction}"`}
          maxWidth="max-w-3xl"
        >
          <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              {/* Before */}
              <div className="rounded-xl border border-line bg-[var(--surface2)]/50 p-4">
                <div className="flex items-center justify-between border-b border-line pb-2 text-xs font-bold uppercase text-muted">
                  <span>Current Draft</span>
                  <Badge variant="default">{result.score}/100</Badge>
                </div>
                <div className="mt-3 space-y-3">
                  <div>
                    <span className="text-[11px] text-muted block font-semibold">Headline</span>
                    <p className="text-sm font-bold text-[var(--text)]">{result.headline}</p>
                  </div>
                  <div>
                    <span className="text-[11px] text-muted block font-semibold">Body</span>
                    <p className="text-xs text-[var(--text)] leading-relaxed">{result.body}</p>
                  </div>
                  <div>
                    <span className="text-[11px] text-muted block font-semibold">Primary CTA</span>
                    <span className="inline-block rounded-md bg-[var(--surface)] border border-line px-2.5 py-1 text-xs font-bold">
                      {result.primaryAction}
                    </span>
                  </div>
                  {result.supportingText ? (
                    <div>
                      <span className="text-[11px] text-muted block font-semibold">Supporting</span>
                      <p className="text-xs text-muted">{result.supportingText}</p>
                    </div>
                  ) : null}
                </div>
              </div>

              {/* After */}
              <div className="rounded-xl border border-[var(--accent)]/40 bg-[var(--accent)]/5 p-4">
                <div className="flex items-center justify-between border-b border-[var(--accent)]/20 pb-2 text-xs font-bold uppercase text-[var(--accent)]">
                  <span>Improved Version</span>
                  <Badge variant="accent">{improvementCandidate.score}/100</Badge>
                </div>
                <div className="mt-3 space-y-3">
                  <div>
                    <span className="text-[11px] text-[var(--accent)] block font-semibold">Headline</span>
                    <p className="text-sm font-bold text-[var(--text)]">{improvementCandidate.headline}</p>
                  </div>
                  <div>
                    <span className="text-[11px] text-[var(--accent)] block font-semibold">Body</span>
                    <p className="text-xs text-[var(--text)] leading-relaxed">{improvementCandidate.body}</p>
                  </div>
                  <div>
                    <span className="text-[11px] text-[var(--accent)] block font-semibold">Primary CTA</span>
                    <span className="inline-block rounded-md bg-[var(--accent)] text-white px-2.5 py-1 text-xs font-bold">
                      {improvementCandidate.primaryAction}
                    </span>
                  </div>
                  {improvementCandidate.supportingText ? (
                    <div>
                      <span className="text-[11px] text-[var(--accent)] block font-semibold">Supporting</span>
                      <p className="text-xs text-muted">{improvementCandidate.supportingText}</p>
                    </div>
                  ) : null}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 border-t border-line pt-4">
              <Button variant="secondary" onClick={() => setComparisonModalOpen(false)}>
                Keep Original
              </Button>
              <Button variant="primary" onClick={applyImprovement}>
                <Check size={16} />
                <span>Apply Improvement</span>
              </Button>
            </div>
          </div>
        </Modal>
      ) : null}
    </div>
  );
}

export default function StudioPage() {
  return (
    <Suspense fallback={<div className="py-20 text-center muted">Loading Copy Studio…</div>}>
      <StudioContent />
    </Suspense>
  );
}
