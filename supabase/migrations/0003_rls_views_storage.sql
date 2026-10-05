-- Row Level Security, public safe views, RPCs and storage buckets.

-- ---------- Enable RLS everywhere ----------
alter table public.profiles enable row level security;
alter table public.ngos enable row level security;
alter table public.ngo_documents enable row level security;
alter table public.ngo_payment_details enable row level security;
alter table public.projects enable row level security;
alter table public.project_budget_items enable row level security;
alter table public.project_images enable row level security;
alter table public.donations enable row level security;
alter table public.comments enable row level security;
alter table public.reports enable row level security;
alter table public.completion_proofs enable row level security;
alter table public.past_projects enable row level security;

-- Guests never write directly. Donations are inserted by the server (secret key) only.
revoke insert, update, delete on all tables in schema public from anon;

-- Helper (RLS on ngos would hide rows inside policies for guests)
create or replace function public.ngo_is_verified(p_ngo_id uuid) returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.ngos where id = p_ngo_id and status = 'verified')
$$;

-- ---------- profiles ----------
create policy "profiles: read own or admin" on public.profiles for select to authenticated
  using (id = (select auth.uid()) or (select public.is_admin()));
create policy "profiles: update own or admin" on public.profiles for update to authenticated
  using (id = (select auth.uid()) or (select public.is_admin()));

-- ---------- ngos (public reads go through public_ngos view) ----------
create policy "ngos: read own or admin" on public.ngos for select to authenticated
  using (owner_id = (select auth.uid()) or (select public.is_admin()));
create policy "ngos: create own" on public.ngos for insert to authenticated
  with check (owner_id = (select auth.uid()));
create policy "ngos: update own or admin" on public.ngos for update to authenticated
  using (owner_id = (select auth.uid()) or (select public.is_admin()));

-- ---------- ngo_documents (private) ----------
create policy "docs: read own or admin" on public.ngo_documents for select to authenticated
  using (ngo_id = (select public.my_ngo_id()) or (select public.is_admin()));
create policy "docs: add own" on public.ngo_documents for insert to authenticated
  with check (ngo_id = (select public.my_ngo_id()));
create policy "docs: delete own unless verified, or admin" on public.ngo_documents for delete to authenticated
  using (
    (select public.is_admin())
    or (ngo_id = (select public.my_ngo_id())
        and exists (select 1 from public.ngos n where n.id = ngo_id and n.status in ('draft','rejected','pending')))
  );

-- ---------- ngo_payment_details (public reads only via get_payment_details RPC) ----------
create policy "pay: read own or admin" on public.ngo_payment_details for select to authenticated
  using (ngo_id = (select public.my_ngo_id()) or (select public.is_admin()));
create policy "pay: add own" on public.ngo_payment_details for insert to authenticated
  with check (ngo_id = (select public.my_ngo_id()));
create policy "pay: update own or admin" on public.ngo_payment_details for update to authenticated
  using (ngo_id = (select public.my_ngo_id()) or (select public.is_admin()));

-- ---------- projects ----------
create policy "projects: public read approved" on public.projects for select to anon, authenticated
  using (
    status in ('active','funded','proof_submitted','completed')
    and (select public.ngo_is_verified(ngo_id))
  );
create policy "projects: owner or admin read all" on public.projects for select to authenticated
  using (ngo_id = (select public.my_ngo_id()) or (select public.is_admin()));
create policy "projects: owner create" on public.projects for insert to authenticated
  with check (ngo_id = (select public.my_ngo_id()));
create policy "projects: owner or admin update" on public.projects for update to authenticated
  using (ngo_id = (select public.my_ngo_id()) or (select public.is_admin()));
create policy "projects: owner delete draft" on public.projects for delete to authenticated
  using (ngo_id = (select public.my_ngo_id()) and status in ('draft','rejected'));

-- ---------- budget items & images (editable only while draft/rejected) ----------
create policy "budget: read visible" on public.project_budget_items for select to anon, authenticated
  using ((select public.project_is_public(project_id)) or (select public.owns_project(project_id)) or (select public.is_admin()));
create policy "budget: owner write draft" on public.project_budget_items for all to authenticated
  using (exists (select 1 from public.projects p where p.id = project_id and p.ngo_id = (select public.my_ngo_id()) and p.status in ('draft','rejected')))
  with check (exists (select 1 from public.projects p where p.id = project_id and p.ngo_id = (select public.my_ngo_id()) and p.status in ('draft','rejected')));

create policy "images: read visible" on public.project_images for select to anon, authenticated
  using ((select public.project_is_public(project_id)) or (select public.owns_project(project_id)) or (select public.is_admin()));
create policy "images: owner write draft" on public.project_images for all to authenticated
  using (exists (select 1 from public.projects p where p.id = project_id and p.ngo_id = (select public.my_ngo_id()) and p.status in ('draft','rejected')))
  with check (exists (select 1 from public.projects p where p.id = project_id and p.ngo_id = (select public.my_ngo_id()) and p.status in ('draft','rejected')));

-- ---------- donations (public reads only via public_donations view) ----------
create policy "donations: NGO, donor or admin read" on public.donations for select to authenticated
  using ((select public.owns_project(project_id)) or donor_user_id = (select auth.uid()) or (select public.is_admin()));
create policy "donations: NGO or admin update" on public.donations for update to authenticated
  using ((select public.owns_project(project_id)) or (select public.is_admin()));

-- ---------- comments ----------
create policy "comments: read visible" on public.comments for select to anon, authenticated
  using ((not is_hidden and (select public.project_is_public(project_id))) or user_id = (select auth.uid()) or (select public.is_admin()));
create policy "comments: registered users post" on public.comments for insert to authenticated
  with check (user_id = (select auth.uid()));
create policy "comments: admin moderate" on public.comments for update to authenticated
  using ((select public.is_admin()));
create policy "comments: delete own or admin" on public.comments for delete to authenticated
  using (user_id = (select auth.uid()) or (select public.is_admin()));

-- ---------- reports ----------
create policy "reports: create own" on public.reports for insert to authenticated
  with check (reporter_id = (select auth.uid()));
create policy "reports: read own or admin" on public.reports for select to authenticated
  using (reporter_id = (select auth.uid()) or (select public.is_admin()));
create policy "reports: admin update" on public.reports for update to authenticated
  using ((select public.is_admin()));

-- ---------- completion proofs ----------
create policy "proofs: public read approved" on public.completion_proofs for select to anon, authenticated
  using (status = 'approved' and (select public.project_is_public(project_id)));
create policy "proofs: owner or admin read" on public.completion_proofs for select to authenticated
  using ((select public.owns_project(project_id)) or (select public.is_admin()));
create policy "proofs: owner submit" on public.completion_proofs for insert to authenticated
  with check ((select public.owns_project(project_id)));
create policy "proofs: owner resubmit or admin review" on public.completion_proofs for update to authenticated
  using ((select public.owns_project(project_id)) or (select public.is_admin()));

-- ---------- past projects ----------
create policy "past: public read verified NGOs" on public.past_projects for select to anon, authenticated
  using ((select public.ngo_is_verified(ngo_id)));
create policy "past: owner or admin read" on public.past_projects for select to authenticated
  using (ngo_id = (select public.my_ngo_id()) or (select public.is_admin()));
create policy "past: owner write" on public.past_projects for all to authenticated
  using (ngo_id = (select public.my_ngo_id()))
  with check (ngo_id = (select public.my_ngo_id()));

-- ---------- Public safe views ----------
-- These run with the view owner's rights on purpose: they expose only safe columns
-- and filter rows themselves (verified NGOs, approved projects, confirmed donations).

create view public.public_ngos with (security_barrier) as
select
  n.id, n.name, n.slug, n.type, n.year_founded, n.city, n.state, n.website, n.social_links,
  n.contact_email, n.about, n.focus_areas, n.logo_path,
  n.has_12a, n.has_80g, n.has_fcra,
  (n.registration_number is not null) as has_registration,
  (n.darpan_id is not null and n.darpan_id <> '') as has_darpan,
  n.verified_at, n.created_at,
  coalesce((
    select sum(d.amount) from public.donations d join public.projects p on p.id = d.project_id
    where p.ngo_id = n.id and d.status = 'confirmed'
      and p.status in ('active','funded','proof_submitted','completed')
  ), 0)::bigint as total_raised,
  (select count(*) from public.projects p where p.ngo_id = n.id and p.status in ('active','funded'))::int as active_projects,
  (select count(*) from public.projects p where p.ngo_id = n.id and p.status = 'completed')::int as completed_projects
from public.ngos n
where n.status = 'verified';

create view public.public_projects with (security_barrier) as
select
  p.id, p.ngo_id, p.title, p.slug, p.category, p.summary, p.description,
  p.beneficiaries_desc, p.beneficiaries_count, p.city, p.state, p.goal_amount,
  p.start_date, p.deadline, p.status, p.approved_at, p.funded_at, p.completed_at, p.created_at,
  n.name as ngo_name, n.slug as ngo_slug, n.logo_path as ngo_logo_path,
  n.has_80g as ngo_has_80g,
  coalesce(s.raised, 0)::bigint as raised,
  coalesce(s.donors, 0)::int as donor_count,
  (select i.file_path from public.project_images i where i.project_id = p.id order by i.sort_order, i.id limit 1) as cover_path
from public.projects p
join public.ngos n on n.id = p.ngo_id and n.status = 'verified'
left join lateral (
  select sum(d.amount) as raised, count(*) as donors
  from public.donations d where d.project_id = p.id and d.status = 'confirmed'
) s on true
where p.status in ('active','funded','proof_submitted','completed');

create view public.public_donations with (security_barrier) as
select
  d.id, d.project_id, d.amount, d.confirmed_at,
  public.display_name(d.donor_name, d.is_anonymous) as display_name
from public.donations d
join public.projects p on p.id = d.project_id
join public.ngos n on n.id = p.ngo_id and n.status = 'verified'
where d.status = 'confirmed'
  and p.status in ('active','funded','proof_submitted','completed');

create view public.public_comments with (security_barrier) as
select
  c.id, c.project_id, c.parent_id, c.body, c.is_ngo_reply, c.created_at,
  case when c.is_ngo_reply then n.name else public.display_name(pr.full_name, false) end as author_name
from public.comments c
join public.projects p on p.id = c.project_id and p.status in ('active','funded','proof_submitted','completed')
join public.ngos n on n.id = p.ngo_id and n.status = 'verified'
left join public.profiles pr on pr.id = c.user_id
where not c.is_hidden;

grant select on public.public_ngos, public.public_projects, public.public_donations, public.public_comments to anon, authenticated;

-- ---------- RPCs ----------
-- Payment details, only for projects currently accepting donations and approved details.
create or replace function public.get_payment_details(p_project_id uuid)
returns table (upi_id text, qr_path text, bank_account_name text, account_number text, ifsc text, bank_name text)
language sql stable security definer set search_path = '' as $$
  select pd.upi_id, pd.qr_path, pd.bank_account_name, pd.account_number, pd.ifsc, pd.bank_name
  from public.projects p
  join public.ngo_payment_details pd on pd.ngo_id = p.ngo_id
  where p.id = p_project_id and public.project_accepts_donations(p.id)
$$;
grant execute on function public.get_payment_details(uuid) to anon, authenticated;

-- Blocking-rule check for the signed-in NGO.
create or replace function public.my_ngo_blocked() returns boolean
language sql stable security definer set search_path = '' as $$
  select coalesce(public.ngo_is_blocked(public.my_ngo_id()), false)
$$;
grant execute on function public.my_ngo_blocked() to authenticated;

-- ---------- Storage buckets (server-side size & type limits) ----------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types) values
  ('ngo-docs-images',     'ngo-docs-images',     false, 307200,  array['image/jpeg','image/png','image/webp']),
  ('ngo-docs-pdf',        'ngo-docs-pdf',        false, 1048576, array['application/pdf']),
  ('payment-screenshots', 'payment-screenshots', false, 153600,  array['image/jpeg','image/png','image/webp']),
  ('media',               'media',               true,  204800,  array['image/jpeg','image/png','image/webp']),
  ('ngo-logos',           'ngo-logos',           true,  51200,   array['image/jpeg','image/png','image/webp']),
  ('upi-qr',              'upi-qr',              true,  102400,  array['image/jpeg','image/png','image/webp'])
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- NGO files live under "<ngo_id>/..." in each bucket.
create policy "ngo files: owner insert" on storage.objects for insert to authenticated
  with check (
    bucket_id in ('ngo-docs-images','ngo-docs-pdf','media','ngo-logos','upi-qr')
    and (storage.foldername(name))[1] = (select public.my_ngo_id())::text
  );
create policy "ngo files: owner update" on storage.objects for update to authenticated
  using (
    bucket_id in ('ngo-docs-images','ngo-docs-pdf','media','ngo-logos','upi-qr')
    and (storage.foldername(name))[1] = (select public.my_ngo_id())::text
  );
create policy "ngo files: owner delete" on storage.objects for delete to authenticated
  using (
    bucket_id in ('ngo-docs-images','ngo-docs-pdf','media','ngo-logos','upi-qr')
    and (storage.foldername(name))[1] = (select public.my_ngo_id())::text
  );
create policy "ngo files: owner or admin read" on storage.objects for select to authenticated
  using (
    bucket_id in ('ngo-docs-images','ngo-docs-pdf','media','ngo-logos','upi-qr')
    and ((storage.foldername(name))[1] = (select public.my_ngo_id())::text or (select public.is_admin()))
  );

-- Payment screenshots: "<project_id>/<file>", written only by the server; read by that NGO and admin.
create policy "screenshots: NGO or admin read" on storage.objects for select to authenticated
  using (
    bucket_id = 'payment-screenshots'
    and ((select public.is_admin()) or exists (
      select 1 from public.projects p join public.ngos n on n.id = p.ngo_id
      where p.id::text = (storage.foldername(name))[1] and n.owner_id = (select auth.uid())
    ))
  );
