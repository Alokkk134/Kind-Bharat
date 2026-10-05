-- KindBharat workflow rules test. Run in Supabase → SQL Editor. Cleans up after itself.

create temp table if not exists wf_results (n serial, test text, actual text, pass boolean);
truncate wf_results;
grant all on wf_results to authenticated, anon;
grant usage on sequence wf_results_n_seq to authenticated, anon;

do $$
declare
  a uuid := '00000000-0000-4000-a000-0000000000aa';
  ngo_a uuid := '00000000-0000-4000-b000-0000000000aa';
  p1 uuid := '00000000-0000-4000-c000-0000000000a1';
  p2 uuid := '00000000-0000-4000-c000-0000000000a2';
  t text;
begin
  delete from public.ngos where id = ngo_a;
  delete from auth.users where id = a;
  insert into auth.users (id, instance_id, aud, role, email, raw_user_meta_data, created_at, updated_at)
    values (a, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'wf-a@test.invalid', '{"role":"ngo","full_name":"Wf A"}', now(), now());

  perform set_config('request.jwt.claims', json_build_object('sub', a, 'role', 'authenticated')::text, true);
  perform set_config('role', 'authenticated', true);

  insert into public.ngos (id, owner_id, name, slug, status, registration_number, city, state, about, contact_person, contact_phone)
    values (ngo_a, a, 'Workflow NGO', 'workflow-ngo-x', 'verified', 'R1', 'Pune', 'Maharashtra', 'about us', 'Wf', '9999999999');
  select status::text into t from public.ngos where id = ngo_a;
  insert into wf_results (test, actual, pass) values ('New NGO forced to draft', t, t = 'draft');

  begin
    update public.ngos set status = 'pending' where id = ngo_a;
    insert into wf_results (test, actual, pass) values ('Submit without registration doc blocked', 'allowed', false);
  exception when others then
    insert into wf_results (test, actual, pass) values ('Submit without registration doc blocked', sqlerrm, sqlerrm like 'MISSING_DOC%');
  end;

  insert into public.projects (id, ngo_id, title, slug, category, goal_amount, deadline, summary, description)
    values (p1, ngo_a, 'Workflow project one', 'workflow-project-one', 'food', 1000, current_date + 10, 'summary', repeat('x', 60));
  insert into public.project_budget_items (project_id, item, quantity, unit_cost) values (p1, 'Rice bags', 10, 90);
  insert into public.project_images (project_id, file_path) values (p1, ngo_a::text || '/projects/x.webp');
  begin
    update public.projects set status = 'under_review' where id = p1;
    insert into wf_results (test, actual, pass) values ('Unverified NGO cannot submit', 'allowed', false);
  exception when others then
    insert into wf_results (test, actual, pass) values ('Unverified NGO cannot submit', sqlerrm, sqlerrm like 'NOT_VERIFIED%');
  end;

  perform set_config('role', 'postgres', true);
  update public.ngos set status = 'verified' where id = ngo_a;
  perform set_config('role', 'authenticated', true);

  begin
    update public.projects set status = 'under_review' where id = p1;
    insert into wf_results (test, actual, pass) values ('Budget 900 != goal 1000 blocked', 'allowed', false);
  exception when others then
    insert into wf_results (test, actual, pass) values ('Budget 900 != goal 1000 blocked', sqlerrm, sqlerrm like 'BUDGET%');
  end;
  update public.project_budget_items set unit_cost = 100 where project_id = p1;
  update public.projects set status = 'under_review' where id = p1;
  select status::text into t from public.projects where id = p1;
  insert into wf_results (test, actual, pass) values ('Valid project submitted', t, t = 'under_review');

  perform set_config('role', 'postgres', true);
  update public.projects set status = 'active' where id = p1;
  update public.projects set deadline = current_date - 40, start_date = current_date - 60 where id = p1;
  perform set_config('role', 'authenticated', true);

  select public.my_ngo_blocked()::text into t;
  insert into wf_results (test, actual, pass) values ('Overdue proof → NGO blocked', t, t = 'true');
  begin
    insert into public.projects (id, ngo_id, title, slug, category, goal_amount) values (p2, ngo_a, 'Second project', 'workflow-project-two', 'food', 500);
    insert into wf_results (test, actual, pass) values ('Blocked NGO cannot create project', 'allowed', false);
  exception when others then
    insert into wf_results (test, actual, pass) values ('Blocked NGO cannot create project', sqlerrm, sqlerrm like 'BLOCKED%');
  end;

  insert into public.completion_proofs (project_id, description, beneficiaries_reached, files)
    values (p1, 'We distributed 10 rice bags to families in the slum area.', 10, array[ngo_a::text || '/proofs/p.webp']);
  select status::text into t from public.projects where id = p1;
  insert into wf_results (test, actual, pass) values ('Proof submitted → project proof_submitted', t, t = 'proof_submitted');
  select public.my_ngo_blocked()::text into t;
  insert into wf_results (test, actual, pass) values ('Block lifted after proof', t, t = 'false');

  perform set_config('role', 'postgres', true);
  update public.completion_proofs set status = 'approved' where project_id = p1;
  select status::text into t from public.projects where id = p1;
  insert into wf_results (test, actual, pass) values ('Proof approved → completed', t, t = 'completed');

  delete from public.ngos where id = ngo_a;
  delete from auth.users where id = a;
end $$;

select n, test, actual, case when pass then 'PASS' else 'FAIL' end as result from wf_results order by n;
