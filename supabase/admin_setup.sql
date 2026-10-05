-- Make yourself the KindBharat admin.
-- 1. Sign up on the website normally (as a Donor) and confirm your email.
-- 2. Supabase → SQL Editor → New query → paste this → change the email → Run.
-- There is no way to become admin from the website itself.

update public.profiles
set role = 'admin'
where id = (select id from auth.users where email = 'YOUR-EMAIL@example.com');

-- Check it worked (should show role = admin):
select u.email, p.role from public.profiles p join auth.users u on u.id = p.id where p.role = 'admin';
