alter extension citext set schema extensions;
alter function public.proof_grace_days() set search_path = '';

-- Trigger functions are never meant to be called as RPC
revoke execute on function public.handle_new_user() from public, anon, authenticated;
revoke execute on function public.donations_after() from public, anon, authenticated;
revoke execute on function public.proofs_after() from public, anon, authenticated;

-- Not needed by guests
revoke execute on function public.my_ngo_blocked() from public, anon;
revoke execute on function public.ngo_is_blocked(uuid) from public, anon;
revoke execute on function public.project_accepts_donations(uuid) from public, anon;
revoke execute on function public.my_ngo_id() from public, anon;
grant execute on function public.my_ngo_blocked(), public.ngo_is_blocked(uuid),
  public.project_accepts_donations(uuid), public.my_ngo_id() to authenticated, service_role;

-- Note: the four public_* views intentionally run with owner rights (Supabase linter flags them).
-- They expose only safe columns and filter rows themselves. See SPEC §9.
