-- Postgres regex repetition counts max out at 255, so {2,256} failed at runtime.
alter table public.ngo_payment_details drop constraint if exists ngo_payment_details_upi_id_check;
alter table public.ngo_payment_details add constraint ngo_payment_details_upi_id_check
  check (upi_id is null or upi_id ~ '^[a-zA-Z0-9._-]{2,200}@[a-zA-Z]{2,64}$');
