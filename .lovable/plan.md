# Sonar GTM Dashboard — Build Plan

## Stack adaptation
Your prompt targets Next.js 14, but this project is **TanStack Start + Vite + Tailwind v4** (the Lovable modern stack). I'll keep every visual/functional requirement and translate the framework bits:
- Routing: TanStack Router file routes (`src/routes/`) instead of Next App Router
- Data: TanStack Query (already wired) with 30s refetch instead of SWR
- Supabase: your external project URL + anon key, read-only client (`VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY`)
- No auth (per spec: internal tool, single team)

## Design system (in `src/styles.css`)
Define exact tokens as OKLCH-equivalents of your hex palette under `@theme inline`:
`--background #050a12`, `--panel #0a1320`, `--panel-elevated #0e1928`, `--signal #1CB7FF`, `--success #37d399`, `--warning #ffb547`, `--danger #ff5d6c`, `--text #e8f4ff`, `--text-muted #5a7a9a`, `--text-dim #3a5a7a`, border tokens at 10%/30% Signal Blue. Inter + DM Mono loaded via `<link>` in `__root.tsx`. Global `tabular-nums` utility.

## Layout shell
`src/routes/__root.tsx` → 220px fixed sidebar + 56px topbar + content area.
- Sidebar: animated concentric-ring SONAR logo (SVG + framer-motion), nav items (Overview, Signal Engine, Outreach, Pipeline, Accounts, Settings), active = Signal Blue left border
- Topbar: logo text, live UTC clock, "SYSTEM ACTIVE" pulsing dot, avatar
- Mobile (<1024px): sidebar collapses to icons; bottom nav with 5 icons

## Routes
1. `/` Overview — 4 KPI cards, 7-day signal area chart (Recharts), High-Intent Opportunities table (60%) + Agent Activity feed (40%), 30s auto-refresh
2. `/signal-engine` — "Run Now" + last scan, 3 stat cards, Live Account Scanner table (50 rows) with signal-type badges, score bars, status dropdown, "Add to Outreach"
3. `/outreach` — 4 campaign metric cards, campaigns table with "Sync Instantly" button, slide-over with Email 1→4 mock + LinkedIn touchpoint flow
4. `/pipeline` — KPI row, 6-column Kanban (drag-and-drop via dnd-kit) updating `pipeline_accounts.stage`, slide-over deal detail
5. `/accounts` — filter bar (search, status, score range, sort), accounts table with HIGH FIT/QUALIFIED/WATCH/PASS badges, per-row actions, Add Lead modal (POST to n8n webhook — URL placeholder configurable)
6. `/settings` — API connections, n8n workflows toggles (display-only), team, Telegram prefs

## Data layer
- `src/integrations/sonar-supabase.ts` — separate publishable client pointing at your external Supabase (not the Lovable Cloud client)
- Query hooks per table: `leads`, `signals`, `campaigns`, `pipeline_accounts`, `meetings`, `agent_logs`, `metrics_snapshots`
- All reads via anon key. Writes (status updates, kanban moves, Add Lead) go through the same client — works if your RLS allows it; otherwise we surface the error.

## Components
Reusable: `KpiCard`, `Panel`, `DataTable`, `StatusBadge`, `ScoreBar`, `SignalTypeBadge`, `AgentBadge`, `SlideOver`, `EmptyState`, `SkeletonRow`. All styled via semantic tokens — zero hard-coded color classes in components.

## UX details
- Page transitions: framer-motion fade 150ms
- Loading: skeleton shimmer
- Empty states: icon + title + one-line description
- Numbers: `toLocaleString()`; dates: `date-fns` relative
- Error banner at top, dismissible

## What I'll skip / call out
- **n8n webhooks** ("Run Now", Add Lead, Research): wired as POST calls to env-configurable URLs. If you don't set them, buttons show a toast "Webhook URL not configured." Tell me the URLs and I'll bake them in.
- **Instantly sync**: button calls a placeholder server function — actual `scripts/instantly-report.ts` integration needs the Instantly API key (I'll add it as a secret when you confirm).
- **Auth**: none, per spec.
- **Schema**: I assume your Supabase already has the tables (`leads`, `signals`, `campaigns`, `pipeline_accounts`, `meetings`, `agent_logs`, `metrics_snapshots`) with the columns referenced in the prompt. If any are missing I'll surface graceful empty states rather than crash.

## Delivery order
Given the scope (6 screens + shell + design system), I'll ship in one large pass: design system + shell + all 6 routes + Supabase client + shared components. Expect ~25-30 new files.

Confirm and I'll build it.