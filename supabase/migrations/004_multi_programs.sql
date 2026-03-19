-- Allow multiple loyalty programs ("card types") per merchant
-- and one pass per customer per program.

alter table public.loyalty_programs
  drop constraint if exists loyalty_programs_merchant_id_key;

alter table public.wallet_passes
  drop constraint if exists wallet_passes_customer_id_merchant_id_key;

alter table public.wallet_passes
  drop constraint if exists wallet_passes_customer_program_unique;

alter table public.wallet_passes
  add constraint wallet_passes_customer_program_unique unique (customer_id, program_id);

