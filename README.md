# KindBharat

Verified NGO projects. Donors pay NGOs directly — the platform never handles money.

- Plan: `SPEC.md` · Rules & decisions: `CLAUDE.md`
- Database: `supabase/migrations/` · Security tests: `supabase/tests/`

---

## 1. Run it on your computer

1. Install Node.js 20 or newer.
2. In this folder: `npm install`
3. `.env.local` already has the Supabase URL and publishable key. Add the two missing values (see step 2.2 below).
4. `npm run dev` → open http://localhost:3000
5. Check the database connection: http://localhost:3000/api/health should show `"ok": true`.

## 2. One-time Supabase setup (dashboard: supabase.com → project **kindbharat**)

The database tables, security rules and storage buckets are **already created**. You only need to do these:

### 2.1 Login links (so email links open your site)
Authentication → **URL Configuration**:
- **Site URL**: `http://localhost:3000` for now (change to `https://kindbharat.org` after launch)
- **Redirect URLs** → Add: `http://localhost:3000/**` and later `https://kindbharat.org/**`

### 2.2 Secret key (needed for guest donations)
Project Settings → **API Keys** → under "Secret keys" click **Reveal**/copy the `sb_secret_...` key.
Paste it into `.env.local` as `SUPABASE_SECRET_KEY=...`. Also set `RATE_LIMIT_SALT=` to any long random text.
Restart `npm run dev`.

### 2.3 Make yourself admin
Sign up on the site as a **Donor**, confirm your email, then run `supabase/admin_setup.sql` in **SQL Editor** (change the email first). Log out and in again → you'll land on `/admin`.

### 2.4 Email limits (important before launch)
Supabase's built-in email sender only sends a few emails per hour — fine for testing, not for real users.
Free fix (no card): create a free [Resend](https://resend.com) or [Brevo](https://brevo.com) account, then in
Authentication → **Emails → SMTP Settings** enter their SMTP details. (Ask Claude for step-by-step help when ready.)

### 2.5 Run the security tests (optional, recommended)
SQL Editor → paste `supabase/tests/rls_test.sql` → Run → every row should say **PASS**. Same for `workflow_test.sql`.

## 3. Put it online (Vercel, free)

1. Create a free GitHub account → New repository `kindbharat` (Private) → push this folder:
   ```bash
   git add -A
   git commit -m "KindBharat v1"
   git branch -M main
   git remote add origin https://github.com/YOUR-NAME/kindbharat.git
   git push -u origin main
   ```
2. vercel.com → Sign in with GitHub → **Add New → Project** → import `kindbharat` → Framework: Next.js.
3. Before clicking Deploy, open **Environment Variables** and add all 5 from `.env.example`
   (use `NEXT_PUBLIC_SITE_URL=https://kindbharat.org`). Click **Deploy**.
4. Domain: Project → Settings → **Domains** → add `kindbharat.org` (and `www.kindbharat.org`). Vercel shows DNS records — add them at the company where you bought the domain. Wait for "Valid configuration".
5. Optional `kindbharat.com`: add it in the same Domains screen and choose **Redirect to kindbharat.org**.
6. Back in Supabase (2.1): set Site URL to `https://kindbharat.org` and add `https://kindbharat.org/**` to Redirect URLs.

## 4. Keep the free database awake

Free Supabase projects pause after ~7 days without activity. `.github/workflows/keep-alive.yml` pings the site daily.
After pushing to GitHub: repo → **Settings → Secrets and variables → Actions → Variables → New repository variable**
`SITE_URL` = `https://kindbharat.org`. Test it: **Actions → Keep Supabase awake → Run workflow**.

## Scripts

`npm run dev` · `npm run build` · `npm run lint`
