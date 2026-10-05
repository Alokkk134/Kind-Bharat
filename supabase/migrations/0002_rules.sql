-- Business rules enforced in the database (cannot be bypassed from the browser).

-- True for admin users and for trusted backend roles (service role, migrations, definer functions).
-- NOT security definer on purpose: current_user must reflect the real caller.
create or replace function public.is_privileged() returns boolean
language sql stable set search_path = '' as $$
  select current_user in ('postgres', 'supabase_admin', 'service_role')
      or coalesce((select auth.role()), '') = 'service_role'
      or public.is_admin()
$$;

create or replace function public.today_ist() returns date
language sql stable set search_path = '' as $$
  select (now() at time zone 'Asia/Kolkata')::date
$$;

-- ---------- New user → profile ----------
create or replace function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  insert into public.profiles (id, role, full_name)
  values (
    new.id,
    case when new.raw_user_meta_data ->> 'role' = 'ngo' then 'ngo'::public.user_role else 'donor'::public.user_role end,
    left(coalesce(new.raw_user_meta_data ->> 'full_name', ''), 100)
  );
  return new;
end $$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------- Profiles: role can only be changed by admin/backend ----------
create or replace function public.profiles_guard() returns trigger
language plpgsql set search_path = '' as $$
begin
  if not public.is_privileged() then
    new.id := old.id;
    new.role := old.role;
    new.created_at := old.created_at;
  end if;
  return new;
end $$;
create trigger profiles_guard before update on public.profiles
  for each row execute function public.profiles_guard();

-- ---------- NGOs ----------
create or replace function public.ngos_guard() returns trigger
language plpgsql set search_path = '' as $$
declare
  v_docs int;
begin
  new.updated_at := now();

  if new.logo_path is not null and new.logo_path not like new.id::text || '/%' then
    raise exception 'Invalid logo path';
  end if;

  if public.is_privileged() then
    if tg_op = 'UPDATE' and new.status is distinct from old.status and new.status = 'verified' then
      new.verified_at := now();
      new.rejection_reason := null;
    end if;
    return new;
  end if;

  if tg_op = 'INSERT' then
    if new.owner_id <> (select auth.uid()) then raise exception 'Not allowed'; end if;
    if not exists (select 1 from public.profiles where id = new.owner_id and role = 'ngo') then
      raise exception 'Only NGO accounts can create an NGO profile';
    end if;
    new.status := 'draft';
    new.rejection_reason := null;
    new.has_12a := false; new.has_80g := false; new.has_fcra := false;
    new.submitted_at := null; new.verified_at := null;
    new.created_at := now();
    return new;
  end if;

  -- UPDATE by the NGO owner: system fields stay as they were
  new.id := old.id;
  new.owner_id := old.owner_id;
  new.slug := old.slug;
  new.has_12a := old.has_12a; new.has_80g := old.has_80g; new.has_fcra := old.has_fcra;
  new.verified_at := old.verified_at;
  new.created_at := old.created_at;

  -- Legal identity is locked once verified (changes need admin help)
  if old.status in ('verified', 'suspended') and (
    new.name is distinct from old.name or new.type is distinct from old.type or
    new.registration_number is distinct from old.registration_number or new.pan is distinct from old.pan
  ) then
    raise exception 'LOCKED: name, type, registration number and PAN cannot be changed after verification. Please contact us.';
  end if;

  if new.status is distinct from old.status then
    if not (old.status in ('draft', 'rejected') and new.status = 'pending') then
      raise exception 'Not allowed to change verification status';
    end if;
    select count(*) into v_docs from public.ngo_documents where ngo_id = new.id and doc_type = 'registration';
    if v_docs = 0 then
      raise exception 'MISSING_DOC: upload your registration certificate before submitting';
    end if;
    if coalesce(new.registration_number, '') = '' or coalesce(new.city, '') = '' or coalesce(new.state, '') = ''
       or coalesce(new.about, '') = '' or coalesce(new.contact_person, '') = '' or coalesce(new.contact_phone, '') = '' then
      raise exception 'INCOMPLETE: fill registration number, city, state, about and contact details before submitting';
    end if;
    new.submitted_at := now();
    new.rejection_reason := null;
  else
    new.rejection_reason := old.rejection_reason;
    new.submitted_at := old.submitted_at;
  end if;
  return new;
end $$;
create trigger ngos_guard before insert or update on public.ngos
  for each row execute function public.ngos_guard();

-- ---------- NGO documents: max 5, path inside own folder ----------
create or replace function public.ngo_documents_guard() returns trigger
language plpgsql set search_path = '' as $$
begin
  if new.file_path not like new.ngo_id::text || '/%' then raise exception 'Invalid file path'; end if;
  if (select count(*) from public.ngo_documents where ngo_id = new.ngo_id) >= 5 then
    raise exception 'LIMIT: maximum 5 documents per NGO';
  end if;
  new.uploaded_at := now();
  return new;
end $$;
create trigger ngo_documents_guard before insert on public.ngo_documents
  for each row execute function public.ngo_documents_guard();

-- ---------- Payment details: any change needs admin re-approval ----------
create or replace function public.payment_guard() returns trigger
language plpgsql set search_path = '' as $$
begin
  new.updated_at := now();
  if new.qr_path is not null and new.qr_path not like new.ngo_id::text || '/%' then
    raise exception 'Invalid QR path';
  end if;

  if public.is_privileged() then
    if tg_op = 'UPDATE' and new.review_status is distinct from old.review_status then
      new.reviewed_at := now();
    end if;
    return new;
  end if;

  if tg_op = 'UPDATE' then
    new.ngo_id := old.ngo_id;
  end if;
  if tg_op = 'INSERT' or (
    new.upi_id, new.qr_path, new.bank_account_name, new.account_number, new.ifsc, new.bank_name
  ) is distinct from (
    old.upi_id, old.qr_path, old.bank_account_name, old.account_number, old.ifsc, old.bank_name
  ) then
    new.review_status := 'pending';
    new.review_note := null;
    new.reviewed_at := null;
  else
    new.review_status := old.review_status;
    new.review_note := old.review_note;
    new.reviewed_at := old.reviewed_at;
  end if;
  return new;
end $$;
create trigger payment_guard before insert or update on public.ngo_payment_details
  for each row execute function public.payment_guard();

-- ---------- Projects ----------
create or replace function public.projects_guard() returns trigger
language plpgsql set search_path = '' as $$
declare
  v_ngo_status public.ngo_status;
  v_budget bigint;
  v_items int;
  v_images int;
  v_tmp public.projects;
begin
  new.updated_at := now();

  if public.is_privileged() then
    if tg_op = 'UPDATE' and new.status is distinct from old.status then
      if new.status = 'active' and old.status = 'under_review' then
        new.approved_at := now();
        new.rejection_reason := null;
      elsif new.status = 'completed' then
        new.completed_at := coalesce(new.completed_at, now());
      end if;
    end if;
    return new;
  end if;

  if tg_op = 'INSERT' then
    if public.ngo_is_blocked(new.ngo_id) then
      raise exception 'BLOCKED: submit completion proof for your overdue project before creating new ones';
    end if;
    new.status := 'draft';
    new.rejection_reason := null;
    new.submitted_at := null; new.approved_at := null; new.funded_at := null; new.completed_at := null;
    new.created_at := now();
    return new;
  end if;

  -- UPDATE by NGO owner
  new.id := old.id;
  new.ngo_id := old.ngo_id;
  new.approved_at := old.approved_at;
  new.funded_at := old.funded_at;
  new.completed_at := old.completed_at;
  new.created_at := old.created_at;

  if old.status = 'under_review' then
    -- Only allowed action: withdraw back to draft, without other edits
    v_tmp := new;
    v_tmp.status := old.status;
    v_tmp.updated_at := old.updated_at;
    if new.status <> 'draft' or v_tmp is distinct from old then
      raise exception 'LOCKED: project is under review. Withdraw it to edit.';
    end if;
    new.submitted_at := null;
    return new;
  end if;

  if old.status not in ('draft', 'rejected') then
    raise exception 'LOCKED: approved projects cannot be edited';
  end if;

  if new.status is distinct from old.status then
    if new.status <> 'under_review' then
      raise exception 'Not allowed to change project status';
    end if;
    select status into v_ngo_status from public.ngos where id = new.ngo_id;
    if v_ngo_status <> 'verified' then
      raise exception 'NOT_VERIFIED: your NGO must be verified before projects can be submitted';
    end if;
    if public.ngo_is_blocked(new.ngo_id) then
      raise exception 'BLOCKED: submit completion proof for your overdue project first';
    end if;
    select coalesce(sum(total), 0), count(*) into v_budget, v_items
      from public.project_budget_items where project_id = new.id;
    if v_items = 0 or v_budget <> new.goal_amount then
      raise exception 'BUDGET: budget items must add up exactly to the goal amount';
    end if;
    select count(*) into v_images from public.project_images where project_id = new.id;
    if v_images = 0 then
      raise exception 'PHOTOS: add at least one photo';
    end if;
    if new.deadline is null or new.deadline < public.today_ist() then
      raise exception 'DEADLINE: deadline must be today or later';
    end if;
    if coalesce(new.summary, '') = '' or char_length(new.description) < 50 then
      raise exception 'INCOMPLETE: add a summary and a description (at least 50 characters)';
    end if;
    new.submitted_at := now();
    new.rejection_reason := null;
  else
    new.rejection_reason := old.rejection_reason;
    new.submitted_at := old.submitted_at;
  end if;
  return new;
end $$;
create trigger projects_guard before insert or update on public.projects
  for each row execute function public.projects_guard();

-- ---------- Project images: max 8, own folder ----------
create or replace function public.project_images_guard() returns trigger
language plpgsql set search_path = '' as $$
declare v_ngo uuid;
begin
  select ngo_id into v_ngo from public.projects where id = new.project_id;
  if new.file_path not like v_ngo::text || '/%' then raise exception 'Invalid file path'; end if;
  if tg_op = 'INSERT' and (select count(*) from public.project_images where project_id = new.project_id) >= 8 then
    raise exception 'LIMIT: maximum 8 photos per project';
  end if;
  return new;
end $$;
create trigger project_images_guard before insert or update on public.project_images
  for each row execute function public.project_images_guard();

-- ---------- Funding status ----------
create or replace function public.refresh_project_funding(p_project_id uuid) returns void
language plpgsql security definer set search_path = '' as $$
declare
  v_raised bigint;
begin
  select coalesce(sum(amount), 0) into v_raised
    from public.donations where project_id = p_project_id and status = 'confirmed';

  update public.projects set status = 'funded', funded_at = now()
    where id = p_project_id and status = 'active' and v_raised >= goal_amount;

  update public.projects set status = 'active', funded_at = null
    where id = p_project_id and status = 'funded' and v_raised < goal_amount;
end $$;
revoke execute on function public.refresh_project_funding(uuid) from public, anon, authenticated;

-- ---------- Donations ----------
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
      and pd.review_status = 'approved'
  )
$$;

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
    new.created_at := now();
    return new;
  end if;

  if not public.is_privileged() then
    -- NGO may only confirm or reject a pending donation
    if (new.id, new.project_id, new.donor_user_id, new.donor_name, new.donor_email, new.donor_phone,
        new.amount, new.utr, new.screenshot_path, new.message, new.is_anonymous, new.ip_hash, new.created_at)
       is distinct from
       (old.id, old.project_id, old.donor_user_id, old.donor_name, old.donor_email, old.donor_phone,
        old.amount, old.utr, old.screenshot_path, old.message, old.is_anonymous, old.ip_hash, old.created_at) then
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
    if new.status <> 'rejected' then new.rejection_reason := null; end if;
  end if;
  return new;
end $$;
create trigger donations_guard before insert or update on public.donations
  for each row execute function public.donations_guard();

create or replace function public.donations_after() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  if tg_op = 'INSERT' or new.status is distinct from old.status or new.amount is distinct from old.amount then
    perform public.refresh_project_funding(new.project_id);
  end if;
  return null;
end $$;
create trigger donations_after after insert or update on public.donations
  for each row execute function public.donations_after();

-- ---------- Comments ----------
create or replace function public.comments_guard() returns trigger
language plpgsql set search_path = '' as $$
declare
  v_parent public.comments;
begin
  if tg_op = 'UPDATE' then
    if not public.is_privileged() then raise exception 'Not allowed'; end if;
    return new;
  end if;

  if public.is_privileged() and (select auth.uid()) is null then
    return new; -- backend/seed
  end if;

  new.user_id := (select auth.uid());
  new.is_hidden := false;
  new.created_at := now();
  new.body := btrim(new.body);

  if not public.project_is_public(new.project_id) then
    raise exception 'Comments are closed for this project';
  end if;

  if (select count(*) from public.comments where user_id = new.user_id and created_at > now() - interval '1 hour') >= 5 then
    raise exception 'RATE_LIMIT: you can post up to 5 comments per hour';
  end if;

  new.is_ngo_reply := public.owns_project(new.project_id);

  if new.parent_id is not null then
    select * into v_parent from public.comments where id = new.parent_id;
    if v_parent.id is null or v_parent.project_id <> new.project_id or v_parent.parent_id is not null then
      raise exception 'Invalid reply';
    end if;
    if not (new.is_ngo_reply or public.is_admin()) then
      raise exception 'Only the NGO can reply to questions';
    end if;
  end if;
  return new;
end $$;
create trigger comments_guard before insert or update on public.comments
  for each row execute function public.comments_guard();

-- ---------- Reports ----------
create or replace function public.reports_guard() returns trigger
language plpgsql set search_path = '' as $$
begin
  if tg_op = 'UPDATE' then
    if not public.is_privileged() then raise exception 'Not allowed'; end if;
    return new;
  end if;
  if public.is_privileged() and (select auth.uid()) is null then return new; end if;

  new.reporter_id := (select auth.uid());
  new.status := 'open';
  new.admin_note := null;
  new.created_at := now();

  if (select count(*) from public.reports where reporter_id = new.reporter_id and created_at > now() - interval '1 day') >= 10 then
    raise exception 'RATE_LIMIT: you can send up to 10 reports per day';
  end if;
  if new.target_type = 'project' and not exists (select 1 from public.projects where id = new.target_id) then
    raise exception 'Project not found';
  end if;
  if new.target_type = 'ngo' and not exists (select 1 from public.ngos where id = new.target_id) then
    raise exception 'NGO not found';
  end if;
  return new;
end $$;
create trigger reports_guard before insert or update on public.reports
  for each row execute function public.reports_guard();

-- ---------- Completion proofs ----------
create or replace function public.proofs_guard() returns trigger
language plpgsql set search_path = '' as $$
declare
  v_ngo uuid;
  v_status public.project_status;
  f text;
begin
  select ngo_id, status into v_ngo, v_status from public.projects where id = new.project_id;
  foreach f in array new.files loop
    if f not like v_ngo::text || '/%' then raise exception 'Invalid file path'; end if;
  end loop;

  if public.is_privileged() then
    if tg_op = 'UPDATE' and new.status is distinct from old.status then
      new.reviewed_at := now();
    end if;
    return new;
  end if;

  if tg_op = 'INSERT' then
    if v_status not in ('active', 'funded') then
      raise exception 'Proof can only be submitted for active or funded projects';
    end if;
  else
    new.project_id := old.project_id;
    if old.status <> 'rejected' then
      raise exception 'LOCKED: proof is already submitted';
    end if;
  end if;
  new.status := 'pending';
  new.admin_note := null;
  new.reviewed_at := null;
  new.submitted_at := now();
  return new;
end $$;
create trigger proofs_guard before insert or update on public.completion_proofs
  for each row execute function public.proofs_guard();

create or replace function public.proofs_after() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  if new.status = 'pending' then
    update public.projects set status = 'proof_submitted' where id = new.project_id;
  elsif new.status = 'approved' then
    update public.projects set status = 'completed', completed_at = now() where id = new.project_id;
  elsif new.status = 'rejected' then
    update public.projects
      set status = case when funded_at is not null then 'funded'::public.project_status else 'active'::public.project_status end
      where id = new.project_id and status in ('proof_submitted', 'completed');
  end if;
  return null;
end $$;
create trigger proofs_after after insert or update on public.completion_proofs
  for each row execute function public.proofs_after();

-- ---------- Past projects: images in own folder ----------
create or replace function public.past_projects_guard() returns trigger
language plpgsql set search_path = '' as $$
declare f text;
begin
  if tg_op = 'UPDATE' then new.ngo_id := old.ngo_id; end if;
  foreach f in array new.images loop
    if f not like new.ngo_id::text || '/%' then raise exception 'Invalid file path'; end if;
  end loop;
  return new;
end $$;
create trigger past_projects_guard before insert or update on public.past_projects
  for each row execute function public.past_projects_guard();
