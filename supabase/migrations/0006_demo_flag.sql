-- Sample/demo NGOs: shown with a "Sample — for reference only" label, never accept donations,
-- and are left out of public totals. Only admin/backend can set the flag.

alter table public.ngos add column if not exists is_demo boolean not null default false;

create or replace function public.ngos_demo_guard() returns trigger
language plpgsql set search_path = '' as $$
begin
  if not public.is_privileged() then
    new.is_demo := case when tg_op = 'INSERT' then false else old.is_demo end;
  end if;
  return new;
end $$;
drop trigger if exists ngos_demo_guard on public.ngos;
create trigger ngos_demo_guard before insert or update on public.ngos
  for each row execute function public.ngos_demo_guard();

-- Demo projects never show payment details or accept donations
create or replace function public.project_accepts_donations(p_project_id uuid) returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (
    select 1
    from public.projects p
    join public.ngos n on n.id = p.ngo_id
    join public.ngo_payment_details pd on pd.ngo_id = n.id
    where p.id = p_project_id
      and p.status in ('active', 'funded')
      and (p.deadline is null or p.deadline >= public.today_ist())
      and n.status = 'verified'
      and not n.is_demo
      and pd.review_status = 'approved'
  )
$$;

create or replace view public.public_ngos with (security_barrier) as
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
  (select count(*) from public.projects p where p.ngo_id = n.id and p.status = 'completed')::int as completed_projects,
  n.is_demo
from public.ngos n
where n.status = 'verified';

create or replace view public.public_projects with (security_barrier) as
select
  p.id, p.ngo_id, p.title, p.slug, p.category, p.summary, p.description,
  p.beneficiaries_desc, p.beneficiaries_count, p.city, p.state, p.goal_amount,
  p.start_date, p.deadline, p.status, p.approved_at, p.funded_at, p.completed_at, p.created_at,
  n.name as ngo_name, n.slug as ngo_slug, n.logo_path as ngo_logo_path,
  n.has_80g as ngo_has_80g,
  coalesce(s.raised, 0)::bigint as raised,
  coalesce(s.donors, 0)::int as donor_count,
  (select i.file_path from public.project_images i where i.project_id = p.id order by i.sort_order, i.id limit 1) as cover_path,
  n.is_demo as ngo_is_demo
from public.projects p
join public.ngos n on n.id = p.ngo_id and n.status = 'verified'
left join lateral (
  select sum(d.amount) as raised, count(*) as donors
  from public.donations d where d.project_id = p.id and d.status = 'confirmed'
) s on true
where p.status in ('active','funded','proof_submitted','completed');
