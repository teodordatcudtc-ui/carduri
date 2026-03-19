-- Add business profile fields + staff roles
-- Safe to run after 001_initial_schema.sql

-- 1) Business profile fields
alter table public.merchants
  add column if not exists business_type text,
  add column if not exists address text;

-- 2) Staff membership table (owner + staff)
create table if not exists public.merchant_staff (
  id uuid primary key default uuid_generate_v4(),
  merchant_id uuid not null references public.merchants(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null check (role in ('owner','staff')),
  created_at timestamptz default now(),
  unique(merchant_id, user_id)
);

alter table public.merchant_staff enable row level security;

-- 3) Helper: is current user staff of merchant?
create or replace function public.is_merchant_staff(p_merchant_id uuid)
returns boolean
language sql
stable
security definer
as $$
  select exists (
    select 1
    from public.merchant_staff ms
    where ms.merchant_id = p_merchant_id
      and ms.user_id = auth.uid()
  );
$$;

revoke all on function public.is_merchant_staff(uuid) from public;
grant execute on function public.is_merchant_staff(uuid) to authenticated;

-- 4) Staff policies
-- Staff can read their memberships; owner can manage staff.
drop policy if exists "merchant_staff_select_own" on public.merchant_staff;
create policy "merchant_staff_select_own" on public.merchant_staff
  for select
  using (user_id = auth.uid());

drop policy if exists "merchant_staff_owner_manage" on public.merchant_staff;
create policy "merchant_staff_owner_manage" on public.merchant_staff
  for all
  using (
    exists (
      select 1
      from public.merchant_staff ms
      where ms.merchant_id = merchant_staff.merchant_id
        and ms.user_id = auth.uid()
        and ms.role = 'owner'
    )
  )
  with check (
    exists (
      select 1
      from public.merchant_staff ms
      where ms.merchant_id = merchant_staff.merchant_id
        and ms.user_id = auth.uid()
        and ms.role = 'owner'
    )
  );

-- 5) Extend existing policies to allow staff access where appropriate
-- loyalty_programs
drop policy if exists "programs_all_merchant" on public.loyalty_programs;
create policy "programs_all_merchant" on public.loyalty_programs for all
  using (public.is_merchant_staff(merchant_id));

-- locations
drop policy if exists "locations_all_merchant" on public.locations;
create policy "locations_all_merchant" on public.locations for all
  using (public.is_merchant_staff(merchant_id));

-- customers
drop policy if exists "customers_all_merchant" on public.customers;
create policy "customers_all_merchant" on public.customers for all
  using (public.is_merchant_staff(merchant_id));

-- wallet_passes
drop policy if exists "passes_merchant_all" on public.wallet_passes;
create policy "passes_merchant_all" on public.wallet_passes for all
  using (public.is_merchant_staff(merchant_id));

-- stamp_events / redemptions
drop policy if exists "stamp_events_merchant" on public.stamp_events;
create policy "stamp_events_merchant" on public.stamp_events for all
  using (exists (
    select 1
    from public.wallet_passes wp
    where wp.id = pass_id
      and public.is_merchant_staff(wp.merchant_id)
  ));

drop policy if exists "redemptions_merchant" on public.redemptions;
create policy "redemptions_merchant" on public.redemptions for all
  using (exists (
    select 1
    from public.wallet_passes wp
    where wp.id = pass_id
      and public.is_merchant_staff(wp.merchant_id)
  ));

-- 6) Ensure owner gets added to merchant_staff on merchant creation
create or replace function public.add_owner_to_staff()
returns trigger as $$
begin
  insert into public.merchant_staff (merchant_id, user_id, role)
  values (new.id, new.user_id, 'owner')
  on conflict do nothing;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists after_merchant_insert_add_owner on public.merchants;
create trigger after_merchant_insert_add_owner
  after insert on public.merchants
  for each row execute function public.add_owner_to_staff();

