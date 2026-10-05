-- KindBharat core schema. Money is stored as whole rupees (bigint).

create extension if not exists citext;

-- ---------- Types ----------
create type public.user_role as enum ('donor', 'ngo', 'admin');
create type public.ngo_status as enum ('draft', 'pending', 'verified', 'rejected', 'suspended');
create type public.ngo_type as enum ('trust', 'society', 'section8', 'other');
create type public.project_status as enum (
  'draft', 'under_review', 'active', 'rejected', 'funded',
  'proof_submitted', 'completed', 'paused', 'removed'
);
create type public.donation_status as enum ('pending', 'confirmed', 'rejected');
create type public.review_status as enum ('pending', 'approved', 'rejected');
create type public.report_status as enum ('open', 'reviewed', 'action_taken', 'dismissed');
create type public.report_reason as enum ('fake_scam', 'wrong_info', 'misuse_of_funds', 'inappropriate', 'other');
create type public.report_target as enum ('project', 'ngo');

-- ---------- Settings ----------
-- Days an NGO has to submit proof after deadline/funding before new projects are blocked (SPEC 4.3).
create or replace function public.proof_grace_days() returns int
language sql immutable as $$ select 30 $$;

-- ---------- Tables ----------
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  role public.user_role not null default 'donor',
  full_name text not null default '' check (char_length(full_name) <= 100),
  phone text check (char_length(phone) <= 20),
  created_at timestamptz not null default now()
);

create table public.ngos (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null unique references public.profiles (id) on delete cascade,
  name text not null check (char_length(name) between 3 and 150),
  slug text not null unique check (slug ~ '^[a-z0-9-]{3,80}$'),
  type public.ngo_type not null default 'trust',
  year_founded int check (year_founded between 1800 and 2100),
  registration_number text check (char_length(registration_number) <= 80),
  darpan_id text check (char_length(darpan_id) <= 40),
  pan text check (pan is null or pan ~ '^[A-Z]{5}[0-9]{4}[A-Z]$'),
  address text check (char_length(address) <= 300),
  city text check (char_length(city) <= 80),
  state text check (char_length(state) <= 80),
  contact_person text check (char_length(contact_person) <= 100),
  contact_phone text check (char_length(contact_phone) <= 20),
  contact_email citext check (char_length(contact_email) <= 200),
  website text check (char_length(website) <= 300),
  social_links text check (char_length(social_links) <= 600),
  about text check (char_length(about) <= 4000),
  focus_areas text[] not null default '{}',
  logo_path text,
  status public.ngo_status not null default 'draft',
  rejection_reason text check (char_length(rejection_reason) <= 1000),
  has_12a boolean not null default false,
  has_80g boolean not null default false,
  has_fcra boolean not null default false,
  submitted_at timestamptz,
  verified_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint focus_areas_valid check (
    focus_areas <@ array['education','food','health','women','environment','animals','disaster_relief','other']::text[]
  )
);

create table public.ngo_documents (
  id uuid primary key default gen_random_uuid(),
  ngo_id uuid not null references public.ngos (id) on delete cascade,
  doc_type text not null check (doc_type in ('registration','pan','12a','80g','fcra','darpan','other')),
  bucket text not null check (bucket in ('ngo-docs-images','ngo-docs-pdf')),
  file_path text not null,
  uploaded_at timestamptz not null default now()
);

create table public.ngo_payment_details (
  id uuid primary key default gen_random_uuid(),
  ngo_id uuid not null unique references public.ngos (id) on delete cascade,
  upi_id text check (upi_id is null or upi_id ~ '^[a-zA-Z0-9._-]{2,256}@[a-zA-Z]{2,64}$'),
  qr_path text,
  bank_account_name text check (char_length(bank_account_name) <= 150),
  account_number text check (account_number is null or account_number ~ '^[0-9]{6,20}$'),
  ifsc text check (ifsc is null or ifsc ~ '^[A-Z]{4}0[A-Z0-9]{6}$'),
  bank_name text check (char_length(bank_name) <= 100),
  review_status public.review_status not null default 'pending',
  review_note text check (char_length(review_note) <= 1000),
  reviewed_at timestamptz,
  updated_at timestamptz not null default now()
);

create table public.projects (
  id uuid primary key default gen_random_uuid(),
  ngo_id uuid not null references public.ngos (id) on delete cascade,
  title text not null check (char_length(title) between 5 and 120),
  slug text not null unique check (slug ~ '^[a-z0-9-]{3,120}$'),
  category text not null check (category in ('education','food','health','women','environment','animals','disaster_relief','other')),
  summary text not null default '' check (char_length(summary) <= 300),
  description text not null default '' check (char_length(description) <= 8000),
  beneficiaries_desc text not null default '' check (char_length(beneficiaries_desc) <= 300),
  beneficiaries_count int check (beneficiaries_count between 1 and 10000000),
  city text not null default '' check (char_length(city) <= 80),
  state text not null default '' check (char_length(state) <= 80),
  goal_amount bigint not null check (goal_amount between 100 and 100000000),
  start_date date,
  deadline date,
  status public.project_status not null default 'draft',
  rejection_reason text check (char_length(rejection_reason) <= 1000),
  submitted_at timestamptz,
  approved_at timestamptz,
  funded_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint deadline_after_start check (deadline is null or start_date is null or deadline >= start_date)
);
create index projects_ngo_idx on public.projects (ngo_id);
create index projects_status_idx on public.projects (status);

create table public.project_budget_items (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects (id) on delete cascade,
  item text not null check (char_length(item) between 1 and 150),
  quantity int not null check (quantity between 1 and 1000000),
  unit_cost bigint not null check (unit_cost between 1 and 100000000),
  total bigint generated always as (quantity * unit_cost) stored,
  sort_order int not null default 0
);
create index budget_project_idx on public.project_budget_items (project_id);

create table public.project_images (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects (id) on delete cascade,
  file_path text not null,
  sort_order int not null default 0
);
create index project_images_project_idx on public.project_images (project_id);

create table public.donations (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects (id) on delete cascade,
  donor_user_id uuid references public.profiles (id) on delete set null,
  donor_name text not null check (char_length(donor_name) between 2 and 100),
  donor_email citext check (char_length(donor_email) <= 200),
  donor_phone text check (char_length(donor_phone) <= 20),
  amount bigint not null check (amount between 1 and 100000000),
  utr text not null check (char_length(utr) between 6 and 40),
  screenshot_path text,
  message text check (char_length(message) <= 500),
  is_anonymous boolean not null default false,
  status public.donation_status not null default 'pending',
  rejection_reason text check (char_length(rejection_reason) <= 300),
  ip_hash text,
  confirmed_at timestamptz,
  reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  constraint donor_contact_required check (donor_email is not null or donor_phone is not null),
  constraint utr_unique_per_project unique (project_id, utr)
);
create index donations_project_idx on public.donations (project_id, status);
create index donations_donor_idx on public.donations (donor_user_id);
create index donations_ip_idx on public.donations (ip_hash, created_at);

create table public.comments (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  parent_id uuid references public.comments (id) on delete cascade,
  body text not null check (char_length(btrim(body)) between 2 and 1000),
  is_ngo_reply boolean not null default false,
  is_hidden boolean not null default false,
  created_at timestamptz not null default now()
);
create index comments_project_idx on public.comments (project_id, created_at);
create index comments_user_idx on public.comments (user_id, created_at);

create table public.reports (
  id uuid primary key default gen_random_uuid(),
  reporter_id uuid not null references public.profiles (id) on delete cascade,
  target_type public.report_target not null,
  target_id uuid not null,
  reason public.report_reason not null,
  description text not null check (char_length(btrim(description)) between 10 and 2000),
  status public.report_status not null default 'open',
  admin_note text check (char_length(admin_note) <= 1000),
  created_at timestamptz not null default now(),
  constraint one_report_per_user_target unique (reporter_id, target_type, target_id)
);

create table public.completion_proofs (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null unique references public.projects (id) on delete cascade,
  description text not null check (char_length(btrim(description)) between 30 and 5000),
  beneficiaries_reached int not null check (beneficiaries_reached between 1 and 10000000),
  files text[] not null default '{}' check (cardinality(files) between 1 and 10),
  status public.review_status not null default 'pending',
  admin_note text check (char_length(admin_note) <= 1000),
  submitted_at timestamptz not null default now(),
  reviewed_at timestamptz
);

create table public.past_projects (
  id uuid primary key default gen_random_uuid(),
  ngo_id uuid not null references public.ngos (id) on delete cascade,
  title text not null check (char_length(title) between 3 and 120),
  date date,
  description text not null default '' check (char_length(description) <= 3000),
  beneficiaries int check (beneficiaries between 1 and 10000000),
  images text[] not null default '{}' check (cardinality(images) <= 5),
  created_at timestamptz not null default now()
);

-- ---------- Helper functions (security definer, used inside RLS) ----------
create or replace function public.is_admin() returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.profiles where id = (select auth.uid()) and role = 'admin')
$$;

create or replace function public.my_ngo_id() returns uuid
language sql stable security definer set search_path = '' as $$
  select id from public.ngos where owner_id = (select auth.uid())
$$;

create or replace function public.owns_project(p_project_id uuid) returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.projects p join public.ngos n on n.id = p.ngo_id
    where p.id = p_project_id and n.owner_id = (select auth.uid())
  )
$$;

-- Project is publicly visible (approved at some point, NGO verified).
create or replace function public.project_is_public(p_project_id uuid) returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.projects p join public.ngos n on n.id = p.ngo_id
    where p.id = p_project_id
      and p.status in ('active','funded','proof_submitted','completed')
      and n.status = 'verified'
  )
$$;

-- NGO has an overdue project without proof (SPEC 4.3 blocking rule).
create or replace function public.ngo_is_blocked(p_ngo_id uuid) returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.projects p
    where p.ngo_id = p_ngo_id
      and p.status in ('active','funded','paused')
      and (
        (p.deadline is not null and p.deadline + public.proof_grace_days() < (now() at time zone 'Asia/Kolkata')::date)
        or (p.funded_at is not null and p.funded_at + make_interval(days => public.proof_grace_days()) < now())
      )
  )
$$;

-- Public display name: "Rahul S." or "Anonymous"
create or replace function public.display_name(p_name text, p_anonymous boolean) returns text
language sql immutable set search_path = '' as $$
  select case
    when p_anonymous or p_name is null or btrim(p_name) = '' then 'Anonymous'
    else
      split_part(btrim(p_name), ' ', 1) ||
      case when position(' ' in btrim(p_name)) > 0
        then ' ' || upper(left(regexp_replace(btrim(p_name), '^.*\s', ''), 1)) || '.'
        else '' end
  end
$$;
