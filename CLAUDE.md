# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

nanishitakke (何したっけ) is a Japanese activity tracking and reflection app built with React + TypeScript. Users record daily activities, write work memos, and generate AI-powered weekly reports via Google Gemini. Backend is Supabase (PostgreSQL + Auth).

## Commands

```bash
bun install          # Install dependencies (Bun is the primary package manager)
bun run dev          # Start dev server on port 5173
bun run build        # TypeScript check + Vite build
bun run lint         # ESLint
bun run preview      # Preview production build
```

Docker is also available: `docker compose up` runs the dev server.

## Architecture

### Feature-First Module Structure

Each feature under `src/features/` is self-contained with `api/`, `components/`, and `types/` subdirectories:

- **activities** — Activity CRUD with date/time/tags
- **activity-templates** — Reusable activity presets
- **work-memos** — Daily reflection memos (done/good/stuck/cause/improvement)
- **reports** — AI-generated weekly reports (stored in Supabase)
- **calendar** — Calendar view of activities

### Data Fetching Pattern

All data access uses React Query + Supabase. Each feature's `api/` folder exports:
- An async function that queries Supabase directly
- A `useXxx()` hook wrapping it in `useQuery` (keyed by `[entity, userId, params]`, enabled only when user exists)
- `useCreateXxx()`, `useUpdateXxx()`, `useDeleteXxx()` mutation hooks that invalidate the query cache on success

### Key Directories

- `src/app/` — App entry, provider composition (Chakra + React Query + Auth), router with lazy-loaded routes
- `src/lib/` — External service clients: `supabase.ts`, `auth.tsx` (AuthContext + useAuth hook), `gemini.ts`, `query-client.ts`
- `src/components/layouts/` — AppHeader and AppSidebar (responsive sidebar/drawer)
- `src/config/constants.ts` — Activity category definitions with color mappings
- `src/styles/theme.ts` — Chakra UI theme (M PLUS Rounded 1c font, pink/blue brand colors, rounded buttons)

### Auth Flow

Google OAuth via Supabase Auth. `AuthProvider` in `src/lib/auth.tsx` manages session state. Protected routes are guarded in `src/app/routes/app/root.tsx` (redirects to `/login` if unauthenticated).

### Environment Variables

All prefixed with `VITE_` for Vite client-side exposure:
- `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY`
- `VITE_GOOGLE_GEN_AI_API_KEY`

### Tech Stack

- **UI**: Chakra UI 2.x + Emotion + Framer Motion
- **Routing**: React Router DOM v7 with lazy loading via `createBrowserRouter`
- **Charts**: Chart.js + react-chartjs-2 (pie for categories, bar for daily hours)
- **Dates**: date-fns with Japanese locale, react-datepicker
- **Deployment**: Vercel (SPA rewrite in vercel.json)

### TypeScript

Strict mode enabled. Path alias `@/*` maps to `src/*`.
