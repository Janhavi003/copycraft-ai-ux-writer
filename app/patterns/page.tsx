'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Search,
  ArrowRight,
  BookOpen,
  Filter,
  CheckCircle2,
  Copy,
  ExternalLink,
  Info,
} from 'lucide-react';
import {
  Button,
  CopyButton,
  Input,
  Select,
  Badge,
  Modal,
} from '@/components/ui';

export interface UXPattern {
  id: string;
  name: string;
  category: 'Safety' | 'Feedback' | 'Empty State' | 'Onboarding' | 'Forms' | 'Guidance';
  component: string;
  desc: string;
  template: string;
  example: string;
  cta: string;
  rules: string[];
  charRecommendation: string;
}

const uxPatterns: UXPattern[] = [
  {
    id: 'destructive-confirmation',
    name: 'Destructive Action Confirmation',
    category: 'Safety',
    component: 'Confirmation',
    desc: 'Make irreversible consequences crystal clear before the user commits to deleting or resetting data.',
    template: 'Delete [Item]? All [associated records] will be permanently removed. This action cannot be undone.',
    example: 'Delete your workspace? All projects, members, and billing history will be permanently removed. This action cannot be undone.',
    cta: 'Delete workspace',
    rules: [
      'Name the specific item being removed',
      'Disclose consequence before user confirms',
      'Never use generic "Yes" or "Proceed" as the CTA',
    ],
    charRecommendation: 'Headline: < 6 words · Body: < 25 words',
  },
  {
    id: 'system-error-recovery',
    name: 'Recoverable System Error',
    category: 'Feedback',
    component: 'Error',
    desc: 'Acknowledge technical failures without blaming the user and offer a direct retry or recovery path.',
    template: 'We couldn’t [complete task]. [Explanation of recovery]. Your [unsaved progress] is still safe.',
    example: 'We couldn’t save your report. Check your connection and try again. Your query parameters are still saved.',
    cta: 'Try again',
    rules: [
      'Avoid "Oops" and "Uh oh"',
      'State what happened and provide the remedy',
      'Preserve user input so they do not start over',
    ],
    charRecommendation: 'Body: < 30 words',
  },
  {
    id: 'empty-state-first-action',
    name: 'Actionable Empty State',
    category: 'Empty State',
    component: 'Empty State',
    desc: 'Explain why the container is empty, communicate the value proposition, and provide a single primary CTA.',
    template: 'No [items] yet. [Explain what creating an item enables for the user].',
    example: 'No reports created yet. Build your first query to track real-time funnel conversion and retention.',
    cta: 'Create report',
    rules: [
      'Explain the benefit, not just the absence of items',
      'Provide a primary creation or import action',
      'Optionally link to documentation or starter templates',
    ],
    charRecommendation: 'Headline: < 5 words · Body: < 20 words',
  },
  {
    id: 'onboarding-welcome',
    name: 'Product Onboarding Welcome',
    category: 'Onboarding',
    component: 'Onboarding',
    desc: 'Orient the user to the core value proposition and set clear expectations for the initial configuration.',
    template: 'Welcome to [Product]. Let’s set up your [workspace/team] in under [X minutes].',
    example: 'Welcome to CopyCraft. Let’s configure your first brand voice and team writing rules in under 2 minutes.',
    cta: 'Get started',
    rules: [
      'State expected completion time',
      'Focus on the first milestone',
      'Provide an option to skip for advanced users',
    ],
    charRecommendation: 'Headline: < 6 words · Body: < 20 words',
  },
  {
    id: 'form-validation-inline',
    name: 'Inline Form Field Error',
    category: 'Forms',
    component: 'Form',
    desc: 'Locate the exact constraint failure and instruct the user on the precise syntax or condition needed.',
    template: '[Field name] needs [exact requirement or format].',
    example: 'Password must include at least 12 characters, including one number and one symbol.',
    cta: 'Save password',
    rules: [
      'Do not say "Invalid format" without specifying the valid format',
      'Display inline below the affected input',
      'Clear the message as soon as criteria are met',
    ],
    charRecommendation: '< 15 words',
  },
  {
    id: 'permission-request',
    name: 'Device / Context Permission Request',
    category: 'Safety',
    component: 'Permission',
    desc: 'Explain the user benefit of granting access and assure them of privacy safeguards.',
    template: 'Allow [Product] to access [Capability]? We use this strictly to [user benefit].',
    example: 'Allow CopyCraft to access your clipboard? We use this strictly to paste interface snippets for analysis.',
    cta: 'Allow access',
    rules: [
      'State the explicit purpose for requesting access',
      'Explain that permission can be revoked in settings',
      'Provide a non-destructive dismissal ("Not now")',
    ],
    charRecommendation: 'Headline: < 8 words · Body: < 25 words',
  },
  {
    id: 'payment-failure',
    name: 'Payment Method Failure',
    category: 'Feedback',
    component: 'Error',
    desc: 'Alert users to billing issues without causing panic or using accusatory phrasing.',
    template: 'We couldn’t process payment with [Card/Account]. [Reassurance of grace period].',
    example: 'We couldn’t process payment with your card ending in 4242. Update your billing details by Oct 1 to maintain uninterrupted access.',
    cta: 'Update payment method',
    rules: [
      'Disclose specific card digits or provider if available',
      'Give a clear deadline or grace period',
      'Lead directly to payment management',
    ],
    charRecommendation: 'Headline: < 6 words · Body: < 30 words',
  },
  {
    id: 'success-confirmation',
    name: 'Asynchronous Task Success',
    category: 'Feedback',
    component: 'Success',
    desc: 'Confirm that a background job or submission succeeded and indicate where output can be retrieved.',
    template: '[Task] completed successfully. [Next step or location of output].',
    example: 'Export completed successfully. Your team audit report is ready to download.',
    cta: 'Download CSV',
    rules: [
      'State past-tense completion clearly',
      'Provide immediate access to the result',
      'Offer dismissal or secondary navigation',
    ],
    charRecommendation: 'Headline: < 5 words · Body: < 20 words',
  },
  {
    id: 'loading-state',
    name: 'Expectation-Setting Loading State',
    category: 'Guidance',
    component: 'Loading',
    desc: 'Inform the user what the system is doing without generating false progress percentages.',
    template: '[Verifying/Syncing/Generating] your [asset]…',
    example: 'Analyzing interface copy against accessibility and clarity heuristics…',
    cta: 'Cancel',
    rules: [
      'Use active present participle ("Analyzing", "Preparing")',
      'Avoid vague "Please wait" alone',
      'Offer cancel path for requests taking > 5 seconds',
    ],
    charRecommendation: '< 10 words',
  },
  {
    id: 'account-deactivation',
    name: 'Account Deactivation & Data Retention',
    category: 'Safety',
    component: 'Confirmation',
    desc: 'Explain what happens to user projects, team memberships, and personal data upon departure.',
    template: 'Deactivate account? You will lose access to [X]. Your team will [state impact].',
    example: 'Deactivate your CopyCraft account? You will immediately lose access to all private projects and saved brand voices. Workspace members will keep shared projects.',
    cta: 'Deactivate account',
    rules: [
      'Clarify data retention vs immediate deletion',
      'Clarify impact on team teammates',
      'Require explicit final click',
    ],
    charRecommendation: 'Body: < 35 words',
  },
  {
    id: 'tooltip-microcopy',
    name: 'Clarifying Field Tooltip',
    category: 'Guidance',
    component: 'Tooltip',
    desc: 'Disclose secondary context for complex settings without cluttering the primary layout.',
    template: '[Brief explanation of setting impact and default behavior].',
    example: 'Turning this on runs an automated accessibility audit against WCAG 2.2 AA standards whenever a draft is generated.',
    cta: 'Learn more',
    rules: [
      'Keep strictly to one or two short sentences',
      'Do not put essential instructions in tooltips',
      'Ensure keyboard and screen reader accessibility',
    ],
    charRecommendation: '< 20 words',
  },
  {
    id: 'banner-announcement',
    name: 'Workspace Alert Banner',
    category: 'Guidance',
    component: 'Banner',
    desc: 'Communicate system maintenance or account-wide notices across all active views.',
    template: '[Alert type]: [Key information]. [Action required or timeline].',
    example: 'Scheduled maintenance: CopyCraft AI services will be offline on Sunday from 02:00 to 03:00 UTC. Offline demo mode will remain active.',
    cta: 'View schedule',
    rules: [
      'Include specific timestamps and timezone',
      'Clarify what parts of the service remain functional',
      'Include dismiss button for non-critical alerts',
    ],
    charRecommendation: '< 25 words',
  },
];

const categories = ['All', 'Safety', 'Feedback', 'Empty State', 'Onboarding', 'Forms', 'Guidance'];

export default function PatternsPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [activePatternDetail, setActivePatternDetail] = useState<UXPattern | null>(null);

  const filteredPatterns = useMemo(() => {
    return uxPatterns.filter(p => {
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        !q ||
        p.name.toLowerCase().includes(q) ||
        p.desc.toLowerCase().includes(q) ||
        p.template.toLowerCase().includes(q) ||
        p.example.toLowerCase().includes(q) ||
        p.component.toLowerCase().includes(q);

      const matchesCat = selectedCategory === 'All' || p.category === selectedCategory;

      return matchesSearch && matchesCat;
    });
  }, [searchQuery, selectedCategory]);

  function handleUseInStudio(p: UXPattern) {
    // Navigate to Studio prefilling the pattern template in the query parameter
    router.push(`/studio?pattern=${encodeURIComponent(p.example)}`);
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <header className="border-b border-line pb-6">
        <div className="text-xs font-bold uppercase tracking-[.18em] text-[var(--accent)]">
          Design System Heuristics
        </div>
        <h1 className="serif mt-1 text-4xl md:text-5xl font-normal text-[var(--text)]">
          UX Writing Pattern Library
        </h1>
        <p className="mt-2 text-sm text-muted max-w-2xl">
          Tested, accessible microcopy patterns for critical product states. Copy directly to clipboard or load immediately into Copy Studio for tailored generation.
        </p>
      </header>

      {/* Search and Category Filters */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 muted" size={16} />
          <Input
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search error, confirmation, empty state, permission…"
            className="pl-10"
            aria-label="Search UX patterns"
          />
        </div>

        {/* Category Pills */}
        <div
          role="tablist"
          aria-label="Filter patterns by category"
          className="flex flex-wrap gap-1.5"
        >
          {categories.map(cat => (
            <button
              key={cat}
              role="tab"
              aria-selected={selectedCategory === cat}
              onClick={() => setSelectedCategory(cat)}
              className={`focus-ring rounded-lg px-3 py-1.5 text-xs font-bold transition ${
                selectedCategory === cat
                  ? 'bg-[var(--accent)] text-white shadow-xs'
                  : 'border border-line bg-[var(--surface)] text-muted hover:bg-[var(--surface2)] hover:text-[var(--text)]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Patterns Grid */}
      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {filteredPatterns.map(p => (
          <article
            key={p.id}
            className="rounded-2xl border border-line bg-[var(--surface)] p-6 shadow-xs flex flex-col justify-between transition hover:border-[var(--accent)]/40 hover:shadow-md"
          >
            <div>
              <div className="flex items-start justify-between gap-3 border-b border-line pb-3">
                <div>
                  <Badge variant="accent">{p.component}</Badge>
                  <h2 className="font-bold text-base text-[var(--text)] mt-2">{p.name}</h2>
                </div>
                <Badge variant="default">{p.category}</Badge>
              </div>

              <p className="mt-3 text-xs text-muted leading-relaxed">{p.desc}</p>

              {/* Template Box */}
              <div className="mt-4 rounded-xl border border-dashed border-line bg-[var(--surface2)]/40 p-3">
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted block mb-1">
                  Pattern Blueprint
                </span>
                <p className="text-xs text-[var(--text)]/90 font-mono leading-relaxed">
                  {p.template}
                </p>
              </div>

              {/* Real Example */}
              <div className="mt-3 rounded-xl border border-line bg-[var(--surface2)]/80 p-3.5">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted">
                    Canonical Example
                  </span>
                  <CopyButton text={p.example} label="Copy" />
                </div>
                <p className="text-xs text-[var(--text)] font-medium leading-relaxed">
                  &ldquo;{p.example}&rdquo;
                </p>
                <div className="mt-2.5">
                  <span className="inline-block rounded-md bg-[var(--surface)] border border-line px-2 py-0.5 text-[11px] font-bold text-[var(--text)]">
                    CTA: {p.cta}
                  </span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="mt-5 border-t border-line pt-4 flex items-center justify-between gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setActivePatternDetail(p)}
                aria-label={`View details for ${p.name}`}
              >
                <Info size={14} />
                <span>Guidelines</span>
              </Button>

              <Button
                variant="primary"
                size="sm"
                onClick={() => handleUseInStudio(p)}
                aria-label={`Use ${p.name} in Copy Studio`}
              >
                <span>Use in Studio</span>
                <ArrowRight size={14} />
              </Button>
            </div>
          </article>
        ))}
      </div>

      {/* Empty Search State */}
      {filteredPatterns.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-line bg-[var(--surface)] p-12 text-center">
          <p className="text-sm text-muted">No UX patterns match your search query.</p>
          <div className="mt-4">
            <Button
              variant="secondary"
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('All');
              }}
            >
              Reset Filters
            </Button>
          </div>
        </div>
      ) : null}

      {/* Pattern Detail Modal */}
      {activePatternDetail ? (
        <Modal
          open={Boolean(activePatternDetail)}
          onClose={() => setActivePatternDetail(null)}
          title={activePatternDetail.name}
          description={`Category: ${activePatternDetail.category} · Component: ${activePatternDetail.component}`}
          maxWidth="max-w-2xl"
        >
          <div className="space-y-4">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-muted">Strategic Purpose</h3>
              <p className="mt-1 text-sm text-[var(--text)] leading-relaxed">
                {activePatternDetail.desc}
              </p>
            </div>

            <div className="rounded-xl border border-line bg-[var(--surface2)]/60 p-4">
              <span className="text-xs font-bold uppercase tracking-wider text-muted block mb-1">
                Blueprint Template
              </span>
              <p className="text-sm font-mono text-[var(--text)] leading-relaxed">
                {activePatternDetail.template}
              </p>
            </div>

            <div className="rounded-xl border border-line bg-[var(--surface)] p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-muted">
                  Production Sample
                </span>
                <CopyButton text={activePatternDetail.example} />
              </div>
              <p className="text-sm text-[var(--text)] font-semibold leading-relaxed">
                &ldquo;{activePatternDetail.example}&rdquo;
              </p>
              <div className="mt-3">
                <span className="rounded-lg bg-[var(--accent)] text-white px-3 py-1.5 text-xs font-bold inline-block">
                  {activePatternDetail.cta}
                </span>
              </div>
            </div>

            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-muted mb-2">
                UX Writing Rules
              </h3>
              <ul className="space-y-2 text-xs text-[var(--text)]">
                {activePatternDetail.rules.map((rule, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <CheckCircle2 size={15} className="text-[var(--success)] shrink-0 mt-0.5" />
                    <span>{rule}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-xl bg-[var(--surface2)] p-3 text-xs text-muted flex items-center justify-between">
              <span>Scannability Recommendation:</span>
              <strong className="text-[var(--text)]">{activePatternDetail.charRecommendation}</strong>
            </div>

            <div className="flex items-center justify-end gap-3 border-t border-line pt-4">
              <Button variant="secondary" onClick={() => setActivePatternDetail(null)}>
                Close
              </Button>
              <Button
                variant="primary"
                onClick={() => {
                  const p = activePatternDetail;
                  setActivePatternDetail(null);
                  handleUseInStudio(p);
                }}
              >
                <span>Use in Studio</span>
                <ArrowRight size={15} />
              </Button>
            </div>
          </div>
        </Modal>
      ) : null}
    </div>
  );
}
