-- Abonament Stripe + trial local 30 zile

alter table public.merchants
  add column if not exists trial_ends_at timestamptz;

alter table public.merchants
  add column if not exists subscription_status text not null default 'none';

alter table public.merchants
  add column if not exists stripe_customer_id text;

alter table public.merchants
  add column if not exists stripe_subscription_id text;

alter table public.merchants
  add column if not exists subscription_interval text;

alter table public.merchants
  add column if not exists subscription_current_period_end timestamptz;

-- Trial: 30 zile de la creare (implicit pentru rânduri noi)
alter table public.merchants
  alter column trial_ends_at set default (now() + interval '30 days');

-- Backfill conturi existente: 30 zile de la created_at
update public.merchants
set trial_ends_at = created_at + interval '30 days'
where trial_ends_at is null;

alter table public.merchants
  alter column trial_ends_at set not null;

create index if not exists idx_merchants_stripe_customer on public.merchants (stripe_customer_id)
  where stripe_customer_id is not null;
