# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

ChatBotMK (chat-mk-studio) is a landing page / marketing site for a chatbot product. It's a React SPA built with Vite, scaffolded via Lovable (lovable.dev).

## Commands

All commands run from the `chat-mk-studio/` directory:

```bash
npm run dev          # Start dev server on port 8080
npm run build        # Production build
npm run build:dev    # Development build
npm run lint         # ESLint
npm run test         # Vitest (single run)
npm run test:watch   # Vitest (watch mode)
```

## Architecture

- **Framework**: React 18 + TypeScript, bundled with Vite (SWC plugin)
- **Routing**: React Router v6 — routes defined in `src/App.tsx`. Add custom routes above the `"*"` catch-all.
- **Styling**: Tailwind CSS with CSS variables for theming (defined in `src/index.css`). Fonts: Plus Jakarta Sans (display), Inter (body).
- **UI Components**: shadcn/ui (Radix primitives) in `src/components/ui/`. Configured via `components.json` (default style, no RSC, CSS variables enabled).
- **Path alias**: `@/` maps to `src/`
- **State/Data**: TanStack React Query for async state. Framer Motion for animations.
- **Testing**: Vitest with jsdom + React Testing Library. Tests live alongside source as `*.test.{ts,tsx}`. Setup file: `src/test/setup.ts`.
- **E2E**: Playwright (config uses `lovable-agent-playwright-config`).

## Page Structure

Single-page landing at `/` (`src/pages/Index.tsx`) composed of section components in `src/components/`: Navbar, HeroSection, MarketingSection, FeaturesSection, HowItWorksSection, PricingSection, FAQSection, CTASection, Footer.
