-- KindBharat security test. Run in Supabase → SQL Editor. Creates throwaway users/data,
-- tries allowed and forbidden actions as each role, prints PASS/FAIL, then deletes the test data.

create temp table if not exists rls_results (n serial, test text, expected text, actual text, pass boolean);
truncate rls_results;
grant all on rls_results to authenticated, anon;
grant usage on sequence rls_results_n_seq to authenticated, anon;

do $$
declare
  a uuid := '00000000-0000-4000-a000-00000000000a'; -- NGO A owner
  b uuid := '00000000-0000-4000-a000-00000000000b'; -- NGO B owner
  d uuid := '00000000-0000-4000-a000-00000000000d'; -- donor
  ngo_a uuid := '00000000-0000-4000-b000-00000000000a';
  ngo_b uuid := '00000000-0000-4000-b000-00000000000b';
  pa uuid := '00000000-0000-4000-c000-00000000000a';
  pb uuid := '00000000-0000-4000-c000-00000000000b';
  v int; t text; ok boolean;
begin
  -- ---------- setup (as postgres) ----------
  delete from public.ngos where id in (ngo_a, ngo_b);
  delete from auth.users where id in (a, b, d);
  insert into auth.users (id, instance_id, aud, role, email, raw_user_meta_data, created_at, updated_at) values
    (a, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'rls-a@test.invalid', '{"role":"ngo","full_name":"Anita A"}', now(), now()),
    (b, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'rls-b@test.invalid', '{"role":"ngo","full_name":"Bala B"}', now(), now()),
    (d, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'rls-d@test.invalid', '{"role":"donor","full_name":"Rahul Sharma"}', now(), now());
  insert into public.ngos (id, owner_id, name, slug, status, registration_number, city, state) values
    (ngo_a, a, 'RLS Test NGO A', 'rls-test-ngo-a', 'verified', 'REG-A', 'Pune', 'Maharashtra'),
    (ngo_b, b, 'RLS Test NGO B', 'rls-test-ngo-b', 'verified', 'REG-B', 'Delhi', 'Delhi');
  insert into public.ngo_payment_details (ngo_id, upi_id, review_status) values (ngo_a, 'ngoa@okaxis', 'approved'), (ngo_b, 'ngob@okaxis', 'approved');
  insert into public.projects (id, ngo_id, title, slug, category, goal_amount, deadline, status, summary, description) values
    (pa, ngo_a, 'RLS test project A', 'rls-test-project-a', 'education', 1000, current_date + 30, 'active', 's', 'd'),
    (pb, ngo_b, 'RLS test project B', 'rls-test-project-b', 'food', 5000, current_date + 30, 'active', 's', 'd');
  insert into public.donations (project_id, donor_user_id, donor_name, donor_email, amount, utr) values
    (pa, d, 'Rahul Sharma', 'rls-d@test.invalid', 1000, 'UTRA00001'),
    (pb, null, 'Guest Giver', 'guest@test.invalid', 300, 'UTRB00001');

  -- helper: switch identity
  -- (set_config with is_local = true lasts until the end of this transaction)

  -- ---------- as NGO A ----------
  perform set_config('request.jwt.claims', json_build_object('sub', a, 'role', 'authenticated')::text, true);
  perform set_config('role', 'authenticated', true);

  select count(*) into v from public.donations where project_id = pb;
  insert into rls_results (test, expected, actual, pass) values ('NGO A reads NGO B donations', '0', v::text, v = 0);
  select count(*) into v from public.donations where project_id = pa;
  insert into rls_results (test, expected, actual, pass) values ('NGO A reads own donations', '1', v::text, v = 1);
  update public.donations set status = 'confirmed' where project_id = pb;
  get diagnostics v = row_count;
  insert into rls_results (test, expected, actual, pass) values ('NGO A confirms NGO B donation', '0 rows', v::text, v = 0);
  select count(*) into v from public.ngo_payment_details where ngo_id = ngo_b;
  insert into rls_results (test, expected, actual, pass) values ('NGO A reads NGO B bank details', '0', v::text, v = 0);
  update public.ngos set has_80g = true where id = ngo_a;
  select has_80g::text into t from public.ngos where id = ngo_a;
  insert into rls_results (test, expected, actual, pass) values ('NGO A gives itself 80G badge', 'false', t, t = 'false');
  begin
    update public.projects set title = 'Hacked title here' where id = pa;
    insert into rls_results (test, expected, actual, pass) values ('NGO A edits approved project', 'blocked', 'allowed', false);
  exception when others then
    insert into rls_results (test, expected, actual, pass) values ('NGO A edits approved project', 'blocked', 'blocked', true);
  end;
  begin
    insert into public.projects (ngo_id, title, slug, category, goal_amount) values (ngo_b, 'Sneaky project', 'sneaky-project-x', 'other', 500);
    insert into rls_results (test, expected, actual, pass) values ('NGO A creates project for NGO B', 'blocked', 'allowed', false);
  exception when others then
    insert into rls_results (test, expected, actual, pass) values ('NGO A creates project for NGO B', 'blocked', 'blocked', true);
  end;
  update public.ngo_payment_details set upi_id = 'changed@okaxis' where ngo_id = ngo_a;
  select review_status::text into t from public.ngo_payment_details where ngo_id = ngo_a;
  insert into rls_results (test, expected, actual, pass) values ('Changed UPI goes back to review', 'pending', t, t = 'pending');
  update public.donations set status = 'confirmed' where project_id = pa;
  get diagnostics v = row_count;
  insert into rls_results (test, expected, actual, pass) values ('NGO A confirms own donation', '1 row', v::text, v = 1);
  begin
    update public.donations set amount = 99999 where project_id = pa;
    insert into rls_results (test, expected, actual, pass) values ('NGO A changes donation amount', 'blocked', 'allowed', false);
  exception when others then
    insert into rls_results (test, expected, actual, pass) values ('NGO A changes donation amount', 'blocked', 'blocked', true);
  end;


  -- ---------- as donor ----------
  perform set_config('role', 'postgres', true);
  -- re-approve so donate checks below are meaningful
  update public.ngo_payment_details set review_status = 'approved' where ngo_id = ngo_a;
  perform set_config('request.jwt.claims', json_build_object('sub', d, 'role', 'authenticated')::text, true);
  perform set_config('role', 'authenticated', true);

  select count(*) into v from public.donations;
  insert into rls_results (test, expected, actual, pass) values ('Donor sees only own donations', '1', v::text, v = 1);
  select count(*) into v from public.ngos;
  insert into rls_results (test, expected, actual, pass) values ('Donor reads private NGO table', '0', v::text, v = 0);
  update public.profiles set role = 'admin' where id = d;
  select role::text into t from public.profiles where id = d;
  insert into rls_results (test, expected, actual, pass) values ('Donor makes self admin', 'donor', t, t = 'donor');
  begin
    insert into public.donations (project_id, donor_name, donor_email, amount, utr) values (pa, 'Fake', 'f@test.invalid', 5, 'FAKEUTR01');
    insert into rls_results (test, expected, actual, pass) values ('Donor inserts donation directly (bypassing server)', 'blocked', 'allowed', false);
  exception when others then
    insert into rls_results (test, expected, actual, pass) values ('Donor inserts donation directly (bypassing server)', 'blocked', 'blocked', true);
  end;
  insert into public.comments (project_id, user_id, body) values (pa, d, 'Is this real?');
  get diagnostics v = row_count;
  insert into rls_results (test, expected, actual, pass) values ('Donor posts a question', '1', v::text, v = 1);
  begin
    insert into public.comments (project_id, user_id, parent_id, body)
      values (pa, d, (select id from public.comments where project_id = pa limit 1), 'Pretending to be NGO');
    insert into rls_results (test, expected, actual, pass) values ('Donor replies as NGO', 'blocked', 'allowed', false);
  exception when others then
    insert into rls_results (test, expected, actual, pass) values ('Donor replies as NGO', 'blocked', 'blocked', true);
  end;

  -- ---------- as guest (anon) ----------
  perform set_config('request.jwt.claims', json_build_object('role', 'anon')::text, true);
  perform set_config('role', 'anon', true);

  select count(*) into v from public.donations;
  insert into rls_results (test, expected, actual, pass) values ('Guest reads donations table', '0', v::text, v = 0);
  select count(*) into v from public.public_donations where project_id in (pa, pb);
  insert into rls_results (test, expected, actual, pass) values ('Guest sees confirmed donations only', '1', v::text, v = 1);
  select display_name into t from public.public_donations where project_id = pa limit 1;
  insert into rls_results (test, expected, actual, pass) values ('Public name is first name + initial', 'Rahul S.', t, t = 'Rahul S.');
  select count(*) into v from public.public_projects where id in (pa, pb);
  insert into rls_results (test, expected, actual, pass) values ('Guest sees approved projects', '2', v::text, v = 2);
  select status::text into t from public.public_projects where id = pa;
  insert into rls_results (test, expected, actual, pass) values ('Goal reached → project funded', 'funded', t, t = 'funded');
  select count(*) into v from public.get_payment_details(pa);
  insert into rls_results (test, expected, actual, pass) values ('Guest gets approved payment details', '1', v::text, v = 1);
  select count(*) into v from public.ngo_payment_details;
  insert into rls_results (test, expected, actual, pass) values ('Guest reads bank details table', '0', v::text, v = 0);
  select count(*) into v from public.ngo_documents;
  insert into rls_results (test, expected, actual, pass) values ('Guest reads NGO documents', '0', v::text, v = 0);
  select count(*) into v from public.profiles;
  insert into rls_results (test, expected, actual, pass) values ('Guest reads profiles', '0', v::text, v = 0);

  -- ---------- cleanup ----------
  perform set_config('role', 'postgres', true);
  delete from public.ngos where id in (ngo_a, ngo_b);
  delete from auth.users where id in (a, b, d);
end $$;

select n, test, expected, actual, case when pass then 'PASS' else 'FAIL' end as result from rls_results order by n;
