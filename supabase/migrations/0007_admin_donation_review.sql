-- Admin oversight of donations: admin can review any donation, overturn an NGO's rejection,
-- or confirm on the NGO's behalf. NGOs cannot touch the admin fields.

alter table public.donations
  add column if not exists admin_note text check (char_length(admin_note) <= 500),
  add column if not exists admin_reviewed_at timestamptz;

create or replace function public.donations_guard() returns trigger
language plpgsql set search_path = '' as $$
begin
  if tg_op = 'INSERT' then
    if not public.project_accepts_donations(new.project_id) then
      raise exception 'CLOSED: this project is not accepting donations right now';
    end if;
    if new.ip_hash is not null and (
      select count(*) from public.donations
      where ip_hash = new.ip_hash and created_at > now() - interval '1 hour'
    ) >= 5 then
      raise exception 'RATE_LIMIT: too many donation forms from your network. Please try again in an hour.';
    end if;
    if new.screenshot_path is not null and new.screenshot_path not like new.project_id::text || '/%' then
      raise exception 'Invalid screenshot path';
    end if;
    new.status := 'pending';
    new.rejection_reason := null;
    new.confirmed_at := null;
    new.reviewed_at := null;
    new.admin_note := null;
    new.admin_reviewed_at := null;
    new.created_at := now();
    return new;
  end if;

  if not public.is_privileged() then
    -- NGO may only confirm or reject a pending donation, and never touch admin fields
    if (new.id, new.project_id, new.donor_user_id, new.donor_name, new.donor_email, new.donor_phone,
        new.amount, new.utr, new.screenshot_path, new.message, new.is_anonymous, new.ip_hash, new.created_at,
        new.admin_note, new.admin_reviewed_at)
       is distinct from
       (old.id, old.project_id, old.donor_user_id, old.donor_name, old.donor_email, old.donor_phone,
        old.amount, old.utr, old.screenshot_path, old.message, old.is_anonymous, old.ip_hash, old.created_at,
        old.admin_note, old.admin_reviewed_at) then
      raise exception 'Not allowed';
    end if;
    if new.status is distinct from old.status
       and not (old.status = 'pending' and new.status in ('confirmed', 'rejected')) then
      raise exception 'Only pending donations can be confirmed or rejected';
    end if;
  end if;

  if new.status is distinct from old.status then
    new.reviewed_at := now();
    new.confirmed_at := case when new.status = 'confirmed' then now() else null end;
    -- keep the NGO's rejection reason on record even if admin later overturns it
  end if;
  return new;
end $$;

-- Public list: mark donations that KindBharat itself verified (e.g. an overturned rejection)
create or replace view public.public_donations with (security_barrier) as
select
  d.id, d.project_id, d.amount, d.confirmed_at,
  public.display_name(d.donor_name, d.is_anonymous) as display_name,
  (d.admin_reviewed_at is not null) as verified_by_admin
from public.donations d
join public.projects p on p.id = d.project_id
join public.ngos n on n.id = p.ngo_id and n.status = 'verified'
where d.status = 'confirmed'
  and p.status in ('active','funded','proof_submitted','completed');

create index if not exists donations_status_reviewed_idx on public.donations (status, admin_reviewed_at);
