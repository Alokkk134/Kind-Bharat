-- Admin donation oversight test (6 checks). Run in Supabase → SQL Editor. Cleans up after itself.
create temp table if not exists od_results (n serial, test text, actual text, pass boolean);
truncate od_results;
grant all on od_results to authenticated; grant usage on sequence od_results_n_seq to authenticated;
do $$
declare
  a uuid := '00000000-0000-4000-a000-0000000000c1'; adm uuid := '00000000-0000-4000-a000-0000000000c2';
  n uuid := '00000000-0000-4000-b000-0000000000c1'; p uuid := '00000000-0000-4000-c000-0000000000c1';
  did uuid; t text; v int;
begin
  insert into auth.users (id, instance_id, aud, role, email, raw_user_meta_data, created_at, updated_at) values
    (a, '00000000-0000-0000-0000-000000000000','authenticated','authenticated','od-a@test.invalid','{"role":"ngo"}',now(),now()),
    (adm,'00000000-0000-0000-0000-000000000000','authenticated','authenticated','od-adm@test.invalid','{}',now(),now());
  update public.profiles set role='admin' where id=adm;
  insert into public.ngos (id, owner_id, name, slug, status) values (n, a, 'OD NGO', 'od-ngo-test', 'verified');
  insert into public.ngo_payment_details (ngo_id, upi_id, review_status) values (n, 'od@okaxis', 'approved');
  insert into public.projects (id, ngo_id, title, slug, category, goal_amount, deadline, status) values (p, n, 'OD project test', 'od-project-test', 'food', 1000, current_date+10, 'active');
  insert into public.donations (project_id, donor_name, donor_email, amount, utr) values (p, 'Real Donor', 'r@test.invalid', 1000, 'ODUTR00001') returning id into did;

  perform set_config('request.jwt.claims', json_build_object('sub', a, 'role','authenticated')::text, true);
  perform set_config('role','authenticated',true);
  update public.donations set status='rejected', rejection_reason='not received' where id=did;
  begin
    update public.donations set admin_note='fake admin ok', admin_reviewed_at=now() where id=did;
    insert into od_results (test, actual, pass) values ('NGO fakes admin review', 'allowed', false);
  exception when others then
    insert into od_results (test, actual, pass) values ('NGO fakes admin review', 'blocked', true);
  end;
  begin
    update public.donations set status='confirmed' where id=did;
    insert into od_results (test, actual, pass) values ('NGO flips rejected back', 'allowed', false);
  exception when others then
    insert into od_results (test, actual, pass) values ('NGO flips rejected back', 'blocked', true);
  end;

  perform set_config('request.jwt.claims', json_build_object('sub', adm, 'role','authenticated')::text, true);
  update public.donations set status='confirmed', admin_note='UTR verified with bank statement', admin_reviewed_at=now() where id=did;
  get diagnostics v = row_count;
  insert into od_results (test, actual, pass) values ('Admin overturns rejection', v::text, v=1);
  select rejection_reason into t from public.donations where id=did;
  insert into od_results (test, actual, pass) values ('NGO reason kept on record', coalesce(t,'null'), t='not received');
  perform set_config('role','postgres',true);
  select status::text into t from public.projects where id=p;
  insert into od_results (test, actual, pass) values ('Overturned donation counts (project funded)', t, t='funded');
  select verified_by_admin::text into t from public.public_donations where id=did;
  insert into od_results (test, actual, pass) values ('Public shows Verified by KindBharat', t, t='true');

  delete from public.ngos where id=n;
  delete from auth.users where id in (a, adm);
end $$;
select n, test, actual, case when pass then 'PASS' else 'FAIL' end result from od_results order by n;
