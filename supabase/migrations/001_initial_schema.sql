-- StampIO: multi-tenant loyalty with digital stamps (Google/Apple Wallet)
-- Run this in Supabase SQL Editor or via Supabase CLI

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Merchants (one per account; links to auth.users)
create table public.merchants (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  business_name text not null,
  slug text unique not null,
  logo_url text,
  brand_color text default '#ea751a',
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(user_id)
);

-- Loyalty program config (one per merchant for now; can extend to multiple later)
create table public.loyalty_programs (
  id uuid primary key default uuid_generate_v4(),
  merchant_id uuid not null references public.merchants(id) on delete cascade,
  stamps_required int not null default 8 check (stamps_required > 0),
  reward_description text not null default 'Recompensă gratuită',
  google_pass_class_id text,
  apple_pass_type_id text,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(merchant_id)
);

-- Locations (optional; one default per merchant; QR can be per location)
create table public.locations (
  id uuid primary key default uuid_generate_v4(),
  merchant_id uuid not null references public.merchants(id) on delete cascade,
  name text not null default 'Locația principală',
  qr_secret text not null default encode(gen_random_bytes(32), 'hex'),
  created_at timestamptz default now()
);

-- Customers (enrolled at a merchant; identified by phone)
create table public.customers (
  id uuid primary key default uuid_generate_v4(),
  merchant_id uuid not null references public.merchants(id) on delete cascade,
  full_name text not null,
  phone text not null,
  email text,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(merchant_id, phone)
);

-- Wallet passes (one per customer per merchant; links to Google/Apple pass)
create table public.wallet_passes (
  id uuid primary key default uuid_generate_v4(),
  customer_id uuid not null references public.customers(id) on delete cascade,
  merchant_id uuid not null references public.merchants(id) on delete cascade,
  program_id uuid not null references public.loyalty_programs(id) on delete cascade,
  barcode_value text not null unique,
  stamp_count int not null default 0 check (stamp_count >= 0),
  reward_available boolean not null default false,
  google_pass_object_id text,
  apple_serial_number text,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(customer_id, merchant_id)
);

-- Stamp events (audit trail; optional for analytics)
create table public.stamp_events (
  id uuid primary key default uuid_generate_v4(),
  pass_id uuid not null references public.wallet_passes(id) on delete cascade,
  created_at timestamptz default now()
);

-- Redemption events (when reward was claimed)
create table public.redemptions (
  id uuid primary key default uuid_generate_v4(),
  pass_id uuid not null references public.wallet_passes(id) on delete cascade,
  redeemed_at timestamptz default now()
);

-- RLS
alter table public.merchants enable row level security;
alter table public.loyalty_programs enable row level security;
alter table public.locations enable row level security;
alter table public.customers enable row level security;
alter table public.wallet_passes enable row level security;
alter table public.stamp_events enable row level security;
alter table public.redemptions enable row level security;

-- Merchants: own row only
create policy "merchants_select_own" on public.merchants for select using (auth.uid() = user_id);
create policy "merchants_insert_own" on public.merchants for insert with check (auth.uid() = user_id);
create policy "merchants_update_own" on public.merchants for update using (auth.uid() = user_id);

-- Programs: via merchant
create policy "programs_all_merchant" on public.loyalty_programs for all
  using (exists (select 1 from public.merchants m where m.id = merchant_id and m.user_id = auth.uid()));

-- Locations: via merchant
create policy "locations_all_merchant" on public.locations for all
  using (exists (select 1 from public.merchants m where m.id = merchant_id and m.user_id = auth.uid()));

-- Customers: via merchant
create policy "customers_all_merchant" on public.customers for all
  using (exists (select 1 from public.merchants m where m.id = merchant_id and m.user_id = auth.uid()));

-- Wallet passes: merchant can read/update; anon can insert (enrollment) and read by barcode
create policy "passes_merchant_all" on public.wallet_passes for all
  using (exists (select 1 from public.merchants m where m.id = merchant_id and m.user_id = auth.uid()));

create policy "passes_anon_insert" on public.wallet_passes for insert with check (true);
create policy "passes_anon_select_barcode" on public.wallet_passes for select using (true);

-- Stamp events / redemptions: via pass -> merchant
create policy "stamp_events_merchant" on public.stamp_events for all
  using (exists (
    select 1 from public.wallet_passes wp
    join public.merchants m on m.id = wp.merchant_id
    where wp.id = pass_id and m.user_id = auth.uid()
  ));
create policy "redemptions_merchant" on public.redemptions for all
  using (exists (
    select 1 from public.wallet_passes wp
    join public.merchants m on m.id = wp.merchant_id
    where wp.id = pass_id and m.user_id = auth.uid()
  ));

-- Indexes
create index idx_wallet_passes_barcode on public.wallet_passes(barcode_value);
create index idx_wallet_passes_merchant on public.wallet_passes(merchant_id);
create index idx_customers_merchant_phone on public.customers(merchant_id, phone);
create index idx_merchants_slug on public.merchants(slug);
create index idx_merchants_user_id on public.merchants(user_id);

-- Default location per merchant (trigger or do in app)
-- Optional: function to create default location when merchant is created
create or replace function public.create_default_location()
returns trigger as $$
begin
  insert into public.locations (merchant_id, name)
  values (new.id, 'Locația principală');
  return new;
end;
$$ language plpgsql security definer;

create trigger after_merchant_insert
  after insert on public.merchants
  for each row execute function public.create_default_location();
