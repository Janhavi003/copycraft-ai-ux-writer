# CopyCraft — AI-Powered UX Writing Workspace

CopyCraft is a precision UX writing workspace for product designers, content designers, and product teams. It generates, analyzes, compares, improves, and organizes structured interface microcopy (buttons, modals, errors, empty states, toasts, permissions, onboarding, and forms) with built-in WCAG 2.2 AA heuristics.

---

## Table of Contents
1. [Key Capabilities](#key-capabilities)
2. [Local Installation](#local-installation)
3. [Demo Mode & Provider Fallback](#demo-mode--provider-fallback)
4. [OpenAI Setup & Environment Variables](#openai-setup--environment-variables)
5. [Production Build & Quality Checks](#production-build--quality-checks)
6. [Deployment to Vercel](#deployment-to-vercel)
7. [Automated Testing](#automated-testing)
8. [Architecture](#architecture)
9. [Data Store & Persistence Layer](#data-store--persistence-layer)
10. [Accessibility & WCAG 2.2 Compliance](#accessibility--wcag-22-compliance)
11. [Security Considerations](#security-considerations)

---

## 1. Key Capabilities

- **Copy Studio**: Create structured UX copy (Headline, Body, Primary CTA, Secondary CTA, Helper Text, Error Text) or audit existing copy.
- **Copy Inspector**: Heuristic scoring across 7 critical UX dimensions:
  - **Clarity**
  - **Conciseness**
  - **Tone**
  - **Accessibility**
  - **Specificity**
  - **Actionability**
  - **Confidence**
  Each dimension provides the exact rationale and a concrete recommendation for improvement.
- **Focused Improvement Actions**: Shorten, Make Action Clearer, Make More Empathetic, Make More Confident, or Boost Accessibility with side-by-side **Before & After Comparison Modal** and single-click Apply.
- **Interface Variations**: Generates 3 alternative angles with rationale, tone, and scannability scores.
- **Projects Management**: Organize copy into product repositories with custom writing rules, audience filters, status badges, and aggregate quality tracking.
- **Brand Voice Engine**: Define product personality traits, primary tone, rules, approved vocabulary, banned words, and canonical examples.
- **Pattern Library**: 12+ tested blueprints for errors, destructive modals, empty states, permissions, payments, and onboarding with instant "Use in Studio" routing.
- **Real Workspace Dashboard**: Metrics derived directly from your actual saved data with zero fake metrics.
- **Preferences & Portability**: Theme toggling (Light / Dark / System), full workspace JSON backup export & restore, and safe workspace reset.

---

## 2. Local Installation

Ensure you have Node.js 18.17+ or 20+ installed.

```bash
# Clone the repository
git clone <repo-url>
cd copycraft-ai-ux-writer

# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 3. Demo Mode & Provider Fallback

CopyCraft is fully functional right out of the box **without** an OpenAI API key.

- **Offline / Zero-Config**: If `OPENAI_API_KEY` is not present, CopyCraft automatically uses deterministic, component-aware Demo Mode. It generates tailored headlines, bodies, CTAs, and 7-dimension analysis for Buttons, Modals, Errors, Empty States, Permissions, and more.
- **Quota & Outage Resilience**: If live OpenAI requests return `401 Unauthorized`, `429 Insufficient Quota`, or `504 Timeout`, CopyCraft intercepts the error server-side, gracefully falls back to Demo Mode, and returns a friendly, non-blocking notification:
  > *"Live AI is out of credits or rate limited. CopyCraft switched to Demo Mode — your workspace remains fully functional."*
- Raw stack traces, API keys, or provider errors are **never** shown in the primary UI.

---

## 4. OpenAI Setup & Environment Variables

To enable live OpenAI generation, create a `.env.local` file in the project root:

```env
# Server-side OpenAI API Key
OPENAI_API_KEY=sk-...

# Optional: Model override (defaults to gpt-4o-mini)
OPENAI_MODEL=gpt-4o-mini
```

> **Security Note**: Never prefix with `NEXT_PUBLIC_`. The API key is kept exclusively on the server side. Never commit `.env.local`.

---

## 5. Production Build & Quality Checks

Run the verification pipeline locally:

```bash
# 1. Check TypeScript types
npm run typecheck

# 2. Run automated test suites (Vitest)
npm test

# 3. Create optimized production build
npm run build

# 4. Preview production build locally
npm run start
```

---

## 6. Deployment to Vercel

CopyCraft is optimized for zero-config Vercel deployment:

1. Push your repository to GitHub / GitLab.
2. Import the project into the [Vercel Dashboard](https://vercel.com).
3. Framework Preset: **Next.js**.
4. Build Command: `next build` (default).
5. Output Directory: `.next` (default).
6. Environment Variables:
   - Add `OPENAI_API_KEY` (optional for live AI).
7. Deploy. The project runs seamlessly with static prerendering for marketing and dashboard pages and serverless API route handlers for AI endpoints.

---

## 7. Automated Testing

Automated testing is powered by **Vitest** with path-alias resolution:

```bash
npm test
```

Test suites cover:
- **`tests/schemas.test.ts`**: Zod validation schemas for requests, responses, scores, and brand voices.
- **`tests/provider.test.ts`**: Component-aware Demo Mode generators, heuristic calculations, 429 quota handling, and variation builders.
- **`tests/store.test.ts`**: Local store CRUD, project metrics recalculation, and JSON export/import recovery.
- **`tests/prompts.test.ts`**: Prompt construction verifying that brand voice rules, constraints, and JSON schemas are injected.
- **`tests/smoke.test.ts`**: Critical smoke tests.

---

## 8. Architecture

```
copycraft-ai-ux-writer/
├── app/                        # Next.js 14 App Router
│   ├── api/                    # Server-side Route Handlers
│   │   ├── generate/route.ts   # Copy generation endpoint
│   │   ├── analyze/route.ts    # Copy audit endpoint
│   │   ├── improve/route.ts    # Focused improvement endpoint
│   │   ├── variations/route.ts # Alternative generation endpoint
│   │   └── insights/route.ts   # Workspace insights endpoint
│   ├── studio/page.tsx         # Copy Studio (Main creation & audit tool)
│   ├── projects/               # Projects directory & detail page
│   ├── patterns/page.tsx       # UX Writing Pattern Library
│   ├── history/page.tsx        # Saved generations archive
│   ├── brand-voice/page.tsx    # Brand voice editor
│   ├── dashboard/page.tsx      # Live workspace overview
│   ├── settings/page.tsx       # Theme, backup, and workspace reset
│   ├── layout.tsx              # Root HTML & AppShell wrapper
│   └── globals.css             # Theme variables & accessibility styles
├── components/                 # Reusable Accessible UI Components
│   ├── ui.tsx                  # Button, Field, Score, CopyButton, Modal, Notice
│   └── navigation/app-shell.tsx# Sidebar, mobile drawer, and breadcrumbs
├── lib/
│   ├── ai/provider.ts          # Server AI caller & component Demo generator
│   ├── data/
│   │   ├── seed.ts             # Initial curated seed data
│   │   └── store.ts            # Versioned persistence abstraction
│   ├── prompts/index.ts        # Prompt builders for UX writing heuristics
│   └── schemas/index.ts        # Zod validation schemas
├── types/index.ts              # TypeScript interfaces
└── tests/                      # Vitest test suites
```

---

## 9. Data Store & Persistence Layer

The workspace uses a modular persistence abstraction in `lib/data/store.ts`:
- **Resilient Local Storage**: Automatically handles missing keys, schema migrations (`copycraft-store-v3`), and corrupted JSON.
- **Clean Interface**: Provides atomic functions (`upsertGeneration`, `deleteGeneration`, `upsertProject`, `deleteProject`, `upsertBrandVoice`, `resetStore`) that can easily be swapped with a database (PostgreSQL, Supabase, Prisma) or multi-tenant authentication provider.
- **Reactive Sync**: Dispatches window events so changes reflect immediately across open tabs and routes.

---

## 10. Accessibility & WCAG 2.2 Compliance

- **Semantic HTML**: Proper `<header>`, `<main>`, `<nav>`, `<aside>`, `<section>`, and single `<h1>` per view.
- **Keyboard Navigation**: Full Tab, Shift+Tab, Enter, Space, and Escape key listeners for dialogs and mobile navigation drawers.
- **Visible Focus Rings**: All interactive controls include high-contrast focus rings (`focus-visible`).
- **Screen Reader Support**: Form inputs link explicitly with `<label>` and helper text via `aria-describedby` and `aria-invalid`.
- **Status & Alerts**: Dynamic notices use `role="status"` and `role="alert"` with `aria-live="polite"`.
- **Touch Targets**: All buttons, links, and select menus maintain minimum 44px touch targets.
- **Prefers Reduced Motion**: Animations and transitions automatically respect the user's OS preference.

---

## 11. Security Considerations

- **Server-Side Credentials**: `OPENAI_API_KEY` is never sent to or evaluated by client-side JavaScript.
- **Input Validation**: All client requests are strictly parsed with Zod before processing.
- **Zero XSS**: React JSX escaping is used throughout; no `dangerouslySetInnerHTML`.
- **Zero Tracking**: Workspace data is kept locally on the user's device unless explicitly exported.
