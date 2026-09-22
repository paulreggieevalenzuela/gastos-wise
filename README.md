# GastosWise — Personal Expense Tracker

A personal-first expense and finance tracker, built from the architecture
roadmap in this project. This is the **web MVP** — the "first real
milestone" the roadmap describes: sign in, create accounts, record
expenses and income, transfer money between accounts, and see correct
balances and a dashboard.

## What's implemented

- **Accounts** — cash, bank, e-wallet, savings, credit card, other. Balances
  are always _derived_ from initial balance + transaction history, never
  trusted from a stored column (architecture doc, section 7 & principle 1).
- **Categories** — expense/income, with subcategories, icons and colors.
- **Transactions** — expense, income, and a proper transfer type that moves
  money between two accounts without inflating income/expense totals
  (section 8).
- **Budgets** — monthly/weekly/yearly per-category budgets with usage,
  near-limit and over-budget states.
- **Dashboard** — total balance, this month's income/expense/net, spending
  by category, a 6-month income-vs-expense chart, recent activity.
- **Auth** — a single-user login (see "Authentication" below), session via
  a signed, HttpOnly cookie.
- **Theming** — light/dark + 4 curated accent colors, personalized to your
  name and saved to your account.

Not built yet (left for later phases, per the roadmap's own phasing):
recurring transaction automation, CSV/PDF reports and export, the mobile
app, and multi-user production hardening (rate limiting, email
verification, etc.).

## Why Drizzle instead of Prisma

The roadmap allows either. Drizzle was used here because it needs no
native binary (Prisma's query engine download was blocked by this
sandbox's network policy, which would have made it impossible to verify
anything). Drizzle also pairs naturally with Neon over a plain Postgres
connection string — nothing edge/HTTP-specific is required for a normal
Node.js deployment. If you'd rather use Prisma, the schema in
`src/lib/db/schema.ts` maps directly to the data model in the roadmap and
is a small, mechanical port.

## Tech stack

Next.js 14 (App Router) · TypeScript · Tailwind CSS · Drizzle ORM ·
PostgreSQL (Neon) · Zod · TanStack Query · React Hook Form · Recharts ·
next-themes · Vitest.

## Project structure

```
src/
├── app/                  # Routes (App Router)
│   ├── (app)/            # Authenticated shell: dashboard, transactions, …
│   ├── api/               # Route handlers (REST-ish, mirrors the roadmap's API design)
│   └── login/
├── components/            # UI, feature components, theme
├── hooks/                  # TanStack Query hooks per resource
├── lib/
│   ├── domain/             # Pure financial logic — no DB, no framework. Unit tested.
│   ├── services/            # DB + domain glue (the "service layer" from the roadmap)
│   ├── db/                  # Drizzle schema, client, migration & seed scripts
│   ├── validation/           # Zod schemas
│   └── auth/                  # Session + password hashing
└── types/                     # Client-side API/form types
drizzle/                        # Generated SQL migrations
```

The most important file if you want to understand the money logic is
`src/lib/domain/balance.ts` — it's where the roadmap's "Financial Rules"
(section 12) actually live, as small pure functions with unit tests in
`*.test.ts` next to each one. `pnpm test` runs all 25 of them.

## Getting started

### 1. Install dependencies

```bash
pnpm install   # or npm install / yarn
```

### 2. Configure environment variables

```bash
cp .env.example .env
```

Fill in:

- `DATABASE_URL` / `DIRECT_URL` — your Neon connection strings (see below).
- `AUTH_SECRET` — a random 32+ byte string: `openssl rand -base64 32`.
- `MOCK_USER_EMAIL` / `MOCK_USER_PASSWORD` / `MOCK_USER_NAME` — only used
  by the seed script (see "Authentication").

### 3. Database setup (Neon project `dawn-poetry-54427459`)

This was built and verified in a sandboxed environment that could not
reach `neon.tech` over the network, so the schema was generated and
tested against a local Postgres instead (the same SQL — every table,
index, and foreign key — was created and round-tripped with real
inserts/updates through the app's API before this was handed off). To
apply it to your actual Neon project, pick one:

**Option A — Neon SQL Editor (no local setup needed)**

1. Open your project in the [Neon console](https://console.neon.tech) →
   SQL Editor.
2. Paste the contents of `drizzle/0000_worthless_tigra.sql` and run it.

**Option B — from a machine with normal internet access**

```bash
pnpm db:migrate
```

This runs `src/lib/db/migrate.ts`, which applies everything in `drizzle/`
to `DATABASE_URL`.

Either way, then seed the mock user and starter data:

```bash
pnpm db:seed
```

This creates one user (from `MOCK_USER_EMAIL`/`MOCK_USER_PASSWORD`), four
starter accounts (Cash, BDO, GCash, Savings — edit or delete these
anytime), and the default category set from the roadmap's examples
(Food, Transportation, Bills, …). It's safe to re-run.

### 4. Run it

```bash
pnpm dev
```

Open http://localhost:3000 and sign in.

### 5. (Optional) Look at the data directly

```bash
pnpm db:studio
```

## Authentication

This is a personal, single-user app for now (per the roadmap's "personal
MVP" scope), so there's no sign-up flow yet — just one login, seeded by
you:

- **username:** whatever you set `MOCK_USER_EMAIL` to (default
  `paulreggie05`)
- **password:** whatever you set `MOCK_USER_PASSWORD` to (default
  `123456789`)

The password is bcrypt-hashed in the database and the session is a
signed, HttpOnly, SameSite cookie (`src/lib/auth/session.ts`) — not
NextAuth/Auth.js, to keep the single-user case simple and dependency-free.
When you get to Phase 11 (multi-user/public release) this is the piece
to swap for Auth.js/Clerk/Supabase Auth as the roadmap suggests, since
every table already has `userId` ownership baked in (principle 5).

To change the login later, update `MOCK_USER_EMAIL`/`MOCK_USER_PASSWORD`
in `.env` and re-run `pnpm db:seed` — it updates the existing user's
password rather than creating a duplicate.

## Design

Light/dark theme plus four accent colors (emerald, navy, plum, rust) —
change them under Settings → Appearance. Choices are saved instantly to
this device and synced to your account. The visual language deliberately
avoids the generic "AI dashboard" look (cream + terracotta, or
near-black + neon): it leans on a ledger/ink palette, a serif display
face (Fraunces) for headings and numbers paired with IBM Plex Sans for
UI text, and thin hairline dividers instead of heavy card shadows.

## What to build next

Following the roadmap's own "Recommended First Build Order" (section 30),
in rough priority:

1. Recurring transactions (the model exists in the schema; the scheduled
   job that generates transactions from it doesn't yet).
2. CSV export / reports (section 8 in the roadmap).
3. The mobile app (Phase 9) — the domain layer in `src/lib/domain` and
   validation in `src/lib/validation` are already framework-agnostic and
   ready to be extracted into a shared package once that starts.
4. Production hardening (Phase 10) before anyone but you uses this.
