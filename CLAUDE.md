@AGENTS.md

# KindBharat — project guide for Claude

Full spec: `SPEC.md` (the agreed plan). This file summarises the rules and decisions. Update it whenever the owner approves a change.

## Working rules (from SPEC §0)
1. **Ask before changing the plan.** Any change to features, libraries, DB design, flow, UI or security → explain what, why, downside/cost, then wait for "yes". Small internal details (names, helpers, file layout inside a folder) don't need approval.
2. **Ask when unclear**, especially anything touching users, money, privacy or cost.
3. **Zero running cost.** No paid services/APIs or anything needing a credit card. Only the domain is paid.
4. **Work in phases** (SPEC §12). Owner asked (2026-10-06) to complete all phases in one go; summarise + testing steps at the end.
5. **Simple English**, step-by-step instructions for dashboards (Supabase, Vercel).
6. Keep this file updated.
7. **Never commit secrets.** Keys live in `.env.local` (git-ignored). `.env.example` has placeholders.

## Core principles (don't change without asking)
- The platform **never touches money**. No gateway, no wallet. Donors pay the NGO directly.
- No fees. Trust is the product. Privacy: email, phone, UTR, screenshots, PAN, NGO docs are never public.
- India-focused: ₹ with Indian grouping (`formatINR`), IST (`todayIST`, `formatDateIST`), Indian donors only.

## Owner decisions
- **Payment details change** → hidden from all projects until admin re-approves (DB trigger `payment_guard`).
- **Funded projects** keep accepting donations until the deadline ("Goal reached — extra funds help more people").
- **Tagline:** "Give directly. See the proof." (chosen by Claude after owner asked for something different, referencing competitors; owner may change it in `src/lib/config.ts`).
- **Home hero (2026-10-09, owner chose after competitor research):** headline “See what your donation became.”, badge “Verified NGOs · Zero fees · Real proof”. Competitors (Milaap, Ketto) already claim 0% fee, so we lead with proof + direct giving. Hero picture = 3-step flow (You donate → Verified NGO receives → Help reaches people in need).
- **UI:** owner asked for a unique look with animations and 3D effects, still phone-friendly (done with CSS 3D + tiny client components, no animation library; respects reduced-motion).
- Supabase project `kindbharat` (ref `sqxkxttkckvrldgeetxz`, Mumbai, free) was created by Claude with owner's approval.

## Tech stack
- Next.js 16 (App Router) + TypeScript + Tailwind CSS v4. **`middleware` is now `proxy`** (`src/proxy.ts`). Read `node_modules/next/dist/docs/` before using Next APIs.
- Supabase free tier via `@supabase/ssr`. Clients: `lib/supabase/client.ts` (browser), `server.ts` (user session, RLS), `public.ts` (guest, no cookies), `admin.ts` (secret key — **only** for guest donation insert + screenshot upload).
- Zod for all server input (`lib/validation.ts`). `browser-image-compression` → WebP before upload (`lib/images.ts`). `lucide-react` icons.
- Hosting: Vercel Hobby. `images.unoptimized` (we compress client-side; stays portable). OG images via `next/og`.

## Architecture notes
- **Security lives in the database**: RLS on every table + `*_guard` triggers enforce status transitions, locked fields, limits, rate limits, the proof blocking rule and funding status. Server actions validate first, but the DB is the source of truth.
- `is_privileged()` = admin user or backend role. Admin actions run as the admin's own session (no secret key).
- Public data comes from 4 owner-rights views: `public_ngos`, `public_projects`, `public_donations`, `public_comments` (Supabase linter flags these as "security definer view" — intentional, they expose only safe columns). Payment details for donors come from RPC `get_payment_details` (only when a project accepts donations).
- Storage buckets: `ngo-docs-images` (private, 300KB), `ngo-docs-pdf` (private, 1MB), `payment-screenshots` (private, 150KB), `media` (public, 200KB: project/proof/past photos), `ngo-logos` (public, 50KB), `upi-qr` (public, 100KB). NGO files live under `<ngo_id>/...`.
- **Sample/demo data** (2026-10-09, owner request): `ngos.is_demo` (admin/backend only, migration 0006). Demo NGOs/projects show “Sample · for reference only”, never accept donations (`project_accepts_donations` excludes them), are `noindex`, and are excluded from home totals. Current sample: NGO `sample-ngo-demo`, project `sample-school-kits-ranchi` (owner account `sample-ngo@kindbharat.invalid` is banned, no password). Photos from Unsplash (free licence).
- **Admin donation oversight** (2026-10-09, owner request): `/admin/donations` lists every donation (filters, per-NGO rejection rate, stale pending > 7 days). Admin can confirm on NGO's behalf, overturn a rejection, uphold it, or reject a fake one — note required. Fields `donations.admin_note` / `admin_reviewed_at` (migration 0007, NGOs can't edit). Overturned donations show publicly as “Verified by KindBharat”. Test: `supabase/tests/donation_override_test.sql` (6 checks PASS).
- Statuses added beyond the spec list: NGO `draft` (before submitting), project `paused` / `removed` (spec 4.2 "pause or remove").
- `PROOF_GRACE_DAYS = 30` in `lib/config.ts` **and** `public.proof_grace_days()` in SQL — keep in sync.
- Forms use `ActionForm` (`components/ui/action-form.tsx`) so React 19 doesn't wipe fields on validation errors.
- Migrations: `supabase/migrations/*.sql` (applied in order). Tests: `supabase/tests/*.sql` (25 RLS + 10 workflow checks, all PASS on 2026-10-06).

## Structure
- `src/app/` routes: public (`/`, `/projects`, `/ngos`, info + legal), `(auth)`, `/dashboard` (donor), `/ngo/*`, `/admin/*`
- `src/components/` — `ui/` (kit), `motion/` (Reveal, Tilt, CountUp, Rangoli, Petals, Aurora, Marquee, ParallaxScene, Confetti), `project/`, `home/`, `dashboard/`, `forms/`, `upload/`, `layout/`

## Phase status
- [x] 1 Setup · [x] 2 Auth & roles · [x] 3 Database & security · [x] 4 NGO profile & verification · [x] 5 Projects · [x] 6 Donations · [x] 7 Comments & reports · [x] 8 Completion proof · [x] 9 Admin panel · [x] 10 Polish (deploy steps in README — owner to do)
