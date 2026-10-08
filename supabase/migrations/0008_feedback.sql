-- Feedback from visitors and users (feature ideas, bugs, other). Anyone can send; only admin can read.

create type public.feedback_kind as enum ('feature', 'bug', 'other');
create type public.feedback_status as enum ('new', 'planned', 'done', 'dismissed');

create table public.feedback (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles (id) on delete set null,
  kind public.feedback_kind not null,
  message text not null check (char_length(btrim(message)) between 10 and 2000),
  name text check (char_length(name) <= 100),
  email extensions.citext check (char_length(email) <= 200),
  page text check (char_length(page) <= 200),
  status public.feedback_status not null default 'new',
  admin_note text check (char_length(admin_note) <= 1000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index feedback_status_idx on public.feedback (status, created_at desc);
create index feedback_user_idx on public.feedback (user_id, created_at);

alter table public.feedback enable row level security;
grant insert on public.feedback to anon;

create policy "feedback: anyone can send" on public.feedback for insert to anon, authenticated
  with check (user_id is null or user_id = (select auth.uid()));
create policy "feedback: admin reads" on public.feedback for select to authenticated
  using ((select public.is_admin()));
create policy "feedback: admin updates" on public.feedback for update to authenticated
  using ((select public.is_admin()));
create policy "feedback: admin deletes" on public.feedback for delete to authenticated
  using ((select public.is_admin()));

-- Counts recent feedback (runs with owner rights so the limit works for guests, who can't read the table)
create or replace function public.feedback_recent_count(p_user uuid) returns int
language sql stable security definer set search_path = '' as $$
  select count(*)::int from public.feedback
  where created_at > now() - interval '1 hour'
    and (case when p_user is null then user_id is null else user_id = p_user end)
$$;
revoke execute on function public.feedback_recent_count(uuid) from public, anon, authenticated;
grant execute on function public.feedback_recent_count(uuid) to anon, authenticated;

create or replace function public.feedback_guard() returns trigger
language plpgsql set search_path = '' as $$
begin
  if tg_op = 'UPDATE' then
    if not public.is_privileged() then raise exception 'Not allowed'; end if;
    new.id := old.id; new.user_id := old.user_id; new.kind := old.kind; new.message := old.message;
    new.name := old.name; new.email := old.email; new.page := old.page; new.created_at := old.created_at;
    new.updated_at := now();
    return new;
  end if;

  -- INSERT: senders can't set admin fields or pretend to be someone else
  new.user_id := (select auth.uid());
  new.status := 'new';
  new.admin_note := null;
  new.created_at := now();
  new.updated_at := now();
  new.message := btrim(new.message);

  if new.user_id is not null then
    if public.feedback_recent_count(new.user_id) >= 5 then
      raise exception 'RATE_LIMIT: you can send up to 5 feedback messages per hour';
    end if;
  else
    -- guests: overall cap to stop floods
    if public.feedback_recent_count(null) >= 30 then
      raise exception 'RATE_LIMIT: we are receiving a lot of feedback right now. Please try again in a while';
    end if;
  end if;
  return new;
end $$;
create trigger feedback_guard before insert or update on public.feedback
  for each row execute function public.feedback_guard();
