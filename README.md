# CopyCraft

A functional, accessible UX writing workspace built with Next.js, TypeScript, Tailwind CSS 4, Zod and optional OpenAI integration.

## What works
- Dashboard with live local workspace data
- Copy Studio: Generate, Analyze, Improve, Variations
- Demo Mode without an API key
- Optional OpenAI server-side generation
- Copy Inspector with five scores and recommendations
- Save to browser history, copy to clipboard and export text
- Projects with create/detail views
- Brand Voice editor with local persistence
- Pattern Library search and “Use in Studio” action
- History search and deletion
- Settings for theme, AI preference and local reset
- Responsive navigation and mobile layout
- Keyboard focus states, labels, status/alert regions, reduced-motion support

## Setup

```bash
npm install
npm run dev
```

Open http://localhost:3000.

For live OpenAI output, create `.env.local`:

```env
OPENAI_API_KEY=your_key_here
```

Without the key, the complete workflow uses deterministic Demo Mode.

## Quality checks

```bash
npm run typecheck
npm test
npm run build
```

## Persistence

This demo intentionally uses `localStorage` behind `lib/data/store.ts`. For production, replace that adapter with a database and authentication layer.

## Reliability and Demo fallback

CopyCraft keeps the core workflow usable when the OpenAI provider cannot answer. If `OPENAI_API_KEY` is missing, exhausted, temporarily unavailable, or rejected, the API routes return a deterministic Demo Mode result instead of exposing a raw provider error to the user. The Studio explains when it has fallen back so the user can keep generating, analyzing, improving, creating variations, saving, copying, and exporting copy.

This is intentional for local demos and QA. For production, configure a funded server-side OpenAI key and monitor provider usage separately.
