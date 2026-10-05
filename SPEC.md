# Build Prompt: KindBharat — Verified NGO Project Funding Platform

> **How to use this file:** Save it as `SPEC.md` in an empty project folder. Open Claude Code in that folder and send: *"Read SPEC.md fully and follow it. Start with the Working Rules, then Phase 1."*

---

## 0. Working Rules (read first, follow always)

You are building a web app for me. I am the product owner. Follow these rules for the whole project:

1. **Ask before changing the plan.** This spec is the agreed plan. If you think something can be improved (a feature, a library, the database design, the flow, the UI, security), **do not implement it on your own**. Instead, stop and tell me:
   - what you want to change,
   - why it is better,
   - any downside or extra cost,
   - then wait for my "yes" or "no".
   Small technical details that don't change behavior (variable names, file structure inside a folder, helper functions) don't need approval.
2. **Ask when something is unclear.** If the spec is missing something you need, ask me. Don't guess on anything that affects users, money, privacy, or cost.
3. **Zero running cost.** I can only pay for a custom domain. Do not add any paid service, paid API, or anything that needs a credit card. If a feature truly needs one, ask me first.
4. **Work in phases** (Section 12). After each phase: stop, summarize what you built, tell me how to test it, list anything I need to do (e.g. create a Supabase project, add environment variables), and wait for my approval before the next phase.
5. **Explain in simple English.** I am not a full-time developer. When you need me to do something (Supabase dashboard, Vercel settings), give clear step-by-step instructions.
6. **Create a `CLAUDE.md`** in Phase 1 summarizing these rules, the tech stack, and key decisions, so future sessions follow them too. Update it when we agree on changes.
7. **Never commit secrets.** Keys go in `.env.local` (git-ignored). Provide a `.env.example` with placeholder names.

---

## 1. Project Overview

A non-profit website where **NGOs and social organizations post specific, budgeted social-help projects** (example: "Stationery kits for 100 students — ₹25,000 needed"), and **donors pay the NGO directly** using the NGO's own UPI / bank details.

**Core principles (do not change without asking):**
- **The platform never touches money.** No payment gateway, no wallet, no money passing through the platform. Donors pay the NGO directly.
- **No fees, no earnings** for the platform owner.
- **Trust is the product.** Every design decision should increase donor trust: verification, transparency, proof of completion, and protection against scams.
- **Privacy matters.** Donor and NGO documents/screenshots are private. Only clean, safe information is public.
- **India-focused.** Currency ₹ (INR) with Indian number formatting (e.g. ₹1,25,000), timezone IST, Indian donors only for now.

### Brand
- **Name:** KindBharat (written as one word, capital K and B)
- **Planned domain:** kindbharat.org (main). kindbharat.com may also be bought later and redirected to the .org. Don't hard-code the domain; keep it in an environment variable (`NEXT_PUBLIC_SITE_URL`).
- **Tagline options** (show all three on the home page draft and let me choose): *"Verified projects. Direct giving."* / *"Help that reaches, proof that shows."* / *"Small help, real change."*
- **Tone:** warm, simple, trustworthy, and focused on service. Keep it non-political and welcoming to everyone; "Bharat" should feel inclusive, not nationalistic.
- **Visual feel:** clean, calm, and credible (think trustworthy charity, not flashy startup). Propose a color palette and logo-text style in Phase 1 and wait for my approval.

---

## 2. Tech Stack

- **Framework:** Next.js (latest stable, App Router) + TypeScript
- **Styling:** Tailwind CSS (a light component library like shadcn/ui is fine)
- **Backend:** Supabase (free tier): Postgres database, Auth, Storage, Row Level Security (RLS)
- **Hosting:** Vercel (Hobby/free plan) + custom domain kindbharat.org
- **Validation:** Zod for all form and server input
- **Image compression:** `browser-image-compression` (in the browser, before upload)

**Portability rule:** avoid Vercel-only features where possible, so the app can move to Cloudflare later if needed. If a Vercel-specific feature would really help, ask first.

**Supabase free-tier notes:**
- Free projects pause after ~7 days of inactivity. Add a free daily "keep-alive" ping (e.g. a GitHub Actions scheduled workflow that calls a lightweight endpoint/query). Explain how to set it up.
- Storage is limited (1 GB), so compression and file limits (Section 7) are mandatory.

---

## 3. User Roles

| Role | Account needed? | What they can do |
|---|---|---|
| **Visitor** | No | Browse NGOs and projects, read comments, see confirmed donations |
| **Donor (guest)** | No | Donate to an approved project and submit donation details |
| **Donor (registered)** | Yes | Everything a guest can + comment, ask questions, report projects, see own donation history |
| **NGO** | Yes | Manage NGO profile, upload documents, create projects, confirm/reject donations, reply to comments, submit completion proof |
| **Admin (me)** | Yes | Verify NGOs, approve projects, approve completion proof, handle reports, moderate comments, suspend NGOs |

- Admin role is assigned manually in the database (no public way to become admin).
- One user account = one role. An NGO account represents one organization.

---

## 4. Verification & Trust System

### 4.1 NGO verification (one time)
NGO signs up → fills profile → uploads documents → status **Pending**.

Required details:
- Organization name, type (Trust / Society / Section 8 Company / Other), year founded
- Registration number + registration certificate (required)
- NGO Darpan ID (optional field, encourage it)
- PAN of organization (number only, document optional)
- 12A / 80G certificates (optional, show a badge if verified)
- FCRA registration (optional, show a badge if verified)
- Address, city, state, contact person, phone, email, website/social links (optional)
- About the organization, focus areas (Education, Food, Health, Women, Environment, Animals, Disaster Relief, Other)

NGO statuses: `pending` → `verified` / `rejected` (with reason) → can later be `suspended` by admin.

- Admin reviews documents and approves or rejects with a reason (shown to NGO).
- Verified NGOs get a **"Verified NGO"** badge.
- **Unverified NGOs cannot publish projects.** They can prepare drafts.

### 4.2 Project approval (every project)
Project statuses:
`draft` → `under_review` → `active` (approved) or `rejected` (with reason) → `funded` (goal reached) → `proof_submitted` → `completed` (proof approved by admin)

- Admin manually approves every project.
- **Projects that are not approved are not shown publicly with payment details.** Draft/under-review projects are visible only to the NGO and admin.
- Approved projects show a **"Verified Project"** badge.
- Admin can also pause or remove an active project (e.g. after a report).

### 4.3 Proof of completion (mandatory)
- Every project must end with proof: photos, description of what was done, number of beneficiaries, optional bills/receipts.
- Admin reviews and approves proof → project becomes `completed`.
- **Blocking rule:** if a project's deadline has passed (or it's funded) and proof has not been submitted within **30 days**, the NGO **cannot create new projects** until proof is submitted. Show a clear warning in the NGO dashboard. (Make 30 days a config value.)

### 4.4 Past projects (before joining the platform)
- NGOs can add previous projects to their profile: title, date, description, photos, beneficiaries.
- Label these clearly as **"Self-reported (before joining)"** so donors can tell them apart from platform-verified completed projects.

### 4.5 Report system
- Registered users can report a project or NGO: reason (Fake/Scam, Wrong information, Misuse of funds, Inappropriate content, Other) + description.
- Reports go to the admin queue. Admin marks them reviewed / action taken / dismissed.
- Prevent duplicate reports by the same user on the same item.

---

## 5. Donation Flow (platform never handles money)

### 5.1 NGO payment details
- NGO adds payment details in their profile: UPI ID, UPI QR code image, bank account details (account name, number, IFSC, bank name).
- These are shown **only on active (approved) projects of verified NGOs**.
- Show a warning on the donate page: *"Pay only to the details shown on this page. This platform never asks you to pay anyone else."*
- If an NGO changes payment details, flag it for admin review (anti-fraud). Ask me how strict this should be before building it.

### 5.2 Donor steps
1. Donor clicks **Donate** on a project.
2. Sees the NGO's UPI ID / QR / bank details, pays using their own app.
3. Fills a **donation confirmation form**:
   - Name (required), email or phone (at least one required)
   - Amount (₹, required)
   - UTR / transaction ID (required)
   - Payment screenshot (optional but encouraged, auto-compressed)
   - Message (optional)
   - "Show my name as Anonymous" checkbox
4. Donation is saved with status **`pending`**.

Guests can donate without an account. Registered donors get their donations linked to their account.

### 5.3 NGO confirms
- NGO dashboard shows pending donations with amount, UTR, screenshot, donor name.
- NGO clicks **Confirm** or **Reject** (with reason, e.g. "payment not received").
- **Only confirmed donations count** toward the project's progress bar and totals.
- When confirmed total ≥ goal, project becomes `funded` (it may still accept donations; ask me).

### 5.4 What the public sees
- Progress bar: confirmed amount / goal, number of confirmed donors, days left.
- Donation list: `₹500 · Rahul S. · ✅ Confirmed by NGO · 2 days ago` (or "Anonymous").
- Show **first name + last initial only**. Never show public: email, phone, UTR, screenshot.
- Payment screenshots and UTRs are visible **only to that NGO and the admin**.

---

## 6. Comments / Questions

- Each project has a Q&A/comment section.
- Registered users can comment; NGO can reply (replies show an **"NGO"** badge).
- Admin can hide/delete comments.
- Basic spam protection: length limit, simple rate limit (e.g. max N comments per user per hour). If you want to add a free CAPTCHA (e.g. Cloudflare Turnstile), ask me first.

---

## 7. File Uploads & Storage

All images are **compressed in the browser before upload** (users upload normal phone photos; the site shrinks them). Convert images to **WebP**.

| File type | Max size (after compression) | Max count | Bucket |
|---|---|---|---|
| Registration & other certificates | 300 KB (images) | 5 per NGO | **Private** |
| Certificates as PDF | 1 MB (no compression, reject if larger) | (included above) | **Private** |
| Payment screenshots | 150 KB | 1 per donation | **Private** |
| Project photos | 200 KB | 8 per project | Public |
| Proof of completion photos/bills | 200 KB | 10 per project | Public |
| Past project photos | 200 KB | 5 per past project | Public |
| NGO logo | 50 KB | 1 | Public |
| UPI QR code | 100 KB | 1 | Public (shown only on active projects) |

Rules:
- **Certificates must stay readable:** compress to around 1600 px width with decent quality. Photos can be compressed more (around 1200 px).
- For PDFs, show a message: *"PDF max 1 MB, or upload a clear photo instead."*
- **Enforce limits on the server too:** set file size limits and allowed MIME types (JPG, PNG, WebP, PDF) on each Supabase bucket, plus RLS storage policies. Browser checks alone are not enough.
- Private files are accessed via short-lived signed URLs, only by the owner NGO and admin.
- Show a friendly error if a file is too large or the wrong type.

---

## 8. Pages

**Public**
- Home: short mission explanation, how it works (3 steps), featured active projects, trust points
- Browse projects: filter by city/state, cause, status (active/completed); search; sort (newest, ending soon, most funded)
- Project page: details, budget breakdown, photos, NGO card, progress, donate button, confirmed donations, comments, report button, completion proof (when completed)
- NGO profile page: badges, about, documents verified (not the files), active projects, completed projects with proof, past self-reported projects, total confirmed funds raised, member since
- Browse NGOs
- How it works / FAQ (for donors and NGOs)
- About, Contact
- Terms of Use, Privacy Policy, Disclaimer

**Auth**
- Sign up (choose Donor or NGO), log in, forgot password, email verification (Supabase built-in emails)

**Donor dashboard**
- My donations with status

**NGO dashboard**
- Verification status + profile editing + documents
- Payment details
- My projects (create, edit drafts, submit for review, status)
- Pending donations to confirm/reject
- Comments to reply to
- Submit completion proof
- Past projects

**Admin panel**
- Overview counts (pending NGOs, pending projects, pending proofs, open reports)
- NGO verification queue (view documents, approve/reject with reason, suspend)
- Project approval queue
- Completion proof queue
- Reports queue
- Comment moderation

### Project creation form
Title, cause category, short summary, full description, beneficiaries (who + how many), location (city, state), **goal amount**, **budget breakdown** (line items: item, quantity, unit cost, total, must sum to goal), start date, deadline, photos.

---

## 9. Database (starting design)

Suggested tables (improve if needed, but **explain changes and ask first**):

- `profiles` — id (= auth user id), role (donor / ngo / admin), full_name, phone, created_at
- `ngos` — id, owner_id, name, type, registration_number, darpan_id, pan, year_founded, address, city, state, contact details, about, focus_areas, logo_url, status, rejection_reason, badges (has_12a, has_80g, has_fcra), verified_at, created_at
- `ngo_documents` — id, ngo_id, doc_type, file_path, uploaded_at
- `ngo_payment_details` — id, ngo_id, upi_id, qr_path, bank_account_name, account_number, ifsc, bank_name, updated_at
- `projects` — id, ngo_id, title, slug, category, summary, description, beneficiaries_desc, beneficiaries_count, city, state, goal_amount, start_date, deadline, status, rejection_reason, approved_at, funded_at, completed_at, created_at
- `project_budget_items` — id, project_id, item, quantity, unit_cost, total
- `project_images` — id, project_id, file_path, sort_order
- `donations` — id, project_id, donor_user_id (nullable for guests), donor_name, donor_email, donor_phone, amount, utr, screenshot_path, message, is_anonymous, status (pending / confirmed / rejected), rejection_reason, confirmed_at, created_at
- `comments` — id, project_id, user_id, parent_id (for replies), body, is_hidden, created_at
- `reports` — id, reporter_id, target_type (project / ngo), target_id, reason, description, status, admin_note, created_at
- `completion_proofs` — id, project_id, description, beneficiaries_reached, files, status, admin_note, submitted_at, reviewed_at
- `past_projects` — id, ngo_id, title, date, description, beneficiaries, images

Store money as integers (whole rupees) or numeric, never floats.

**Row Level Security is required on every table.** Key rules:
- Public can read only verified NGOs, active/funded/completed projects, confirmed donations (safe columns only, via a view), visible comments.
- NGOs can only read/write their own data and donations to their own projects.
- Donors can read their own donations.
- Admin can read/write everything.
- Sensitive columns (email, phone, UTR, screenshot path) must never be exposed in public queries. Use a public view with safe columns.

---

## 10. Security & Quality

- RLS on all tables and storage buckets (test it: try to read another NGO's donations and confirm it fails).
- Validate all input with Zod on the server.
- Never trust the client for role checks; check roles on the server.
- Basic rate limiting on donation forms, comments, and reports.
- Sanitize user text (no raw HTML).
- Mobile-first and responsive (most users will be on phones).
- Fast pages: optimized images, server rendering for public pages.
- Accessibility basics: labels, contrast, keyboard navigation.
- SEO: page titles, meta descriptions, Open Graph images for project pages (so shared links look good on WhatsApp), sitemap, robots.txt.
- Clean, trustworthy design: simple, calm colors, clear badges and statuses.

---

## 11. Legal & Info Pages (placeholders)

Create clear placeholder content and mark each with **"To be reviewed by a legal professional before launch."** Include:
- **Disclaimer:** the platform is a listing service only, does not collect or handle money, and is not responsible for how NGOs use funds. Donors should do their own checks.
- **Indian donors only** for now (NGOs need FCRA registration to accept foreign donations).
- **Tax receipts (80G)** are issued by the NGO, not the platform.
- **Privacy Policy:** what data is collected, why, who can see it, how to request deletion (in line with India's DPDP Act).
- **Terms of Use** for donors and NGOs, including that false information leads to suspension.

---

## 12. Build Phases (stop and wait for approval after each)

1. **Setup:** Next.js + TypeScript + Tailwind, Supabase connection, folder structure, `CLAUDE.md`, `.env.example`, basic layout (header, footer) with the KindBharat name, propose colors/typography for my approval. Give me step-by-step Supabase setup instructions.
2. **Auth & roles:** sign up (donor/NGO), login, password reset, profiles table, role-based route protection, admin role setup instructions.
3. **Database & security:** all tables, RLS policies, storage buckets with size/type limits, public safe views. Show me how to test RLS.
4. **NGO profile & verification:** NGO profile form, document upload with compression, payment details, past projects, admin verification queue.
5. **Projects:** create/edit/submit project with budget breakdown and photos, admin approval queue, public project pages, browse/filter/search.
6. **Donations:** donate page, confirmation form, NGO confirm/reject, progress bar, public donation list, donor history.
7. **Comments & reports:** Q&A section, NGO replies, reports, admin moderation.
8. **Completion proof:** proof submission, admin approval, blocking rule, completed projects on NGO profile.
9. **Admin panel polish:** dashboard counts and all queues in one place.
10. **Polish & launch:** home page, How it works/FAQ, legal pages, SEO, Open Graph images, mobile testing, keep-alive ping, deploy to Vercel, connect kindbharat.org (and optional kindbharat.com redirect) with step-by-step instructions.

---

## 13. Not in Version 1 (don't build unless I ask)

- Payment gateway or automatic payment tracking
- In-kind/item donations ("sponsor 10 notebooks")
- Volunteer sign-ups
- Trust scores / ratings
- Email notifications beyond Supabase auth emails (ask me if you think some are essential)
- Hindi or other languages
- Mobile app

If you think any of these should be in version 1, **suggest it and ask me first.**

---

## 14. Definition of Done (per phase)

- Feature works on mobile and desktop
- No TypeScript or lint errors
- RLS tested for the new tables
- No secrets in code
- `CLAUDE.md` updated if anything changed
- Summary + testing steps given to me
