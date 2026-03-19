-- Fix RLS so merchant owner works even if merchant_staff is missing.
-- Also backfill merchant_staff for existing merchants.

-- 1) Backfill: add owner memberships for existing merchants
insert into public.merchant_staff (merchant_id, user_id, role)
select m.id, m.user_id, 'owner'
from public.merchants m
on conflict do nothing;

-- 2) Helper: is current user the merchant owner?
create or replace function public.is_merchant_owner(p_merchant_id uuid)
returns boolean
language sql
stable
security definer
as $$
  select exists (
    select 1
    from public.merchants m
    where m.id = p_merchant_id
      and m.user_id = auth.uid()
  );
$$;

revoke all on function public.is_merchant_owner(uuid) from public;
grant execute on function public.is_merchant_owner(uuid) to authenticated;

-- 3) Update policies to allow owner OR staff
drop policy if exists "programs_all_merchant" on public.loyalty_programs;
create policy "programs_all_merchant" on public.loyalty_programs for all
  using (public.is_merchant_owner(merchant_id) or public.is_merchant_staff(merchant_id))
  with check (public.is_merchant_owner(merchant_id) or public.is_merchant_staff(merchant_id));

drop policy if exists "locations_all_merchant" on public.locations;
create policy "locations_all_merchant" on public.locations for all
  using (public.is_merchant_owner(merchant_id) or public.is_merchant_staff(merchant_id))
  with check (public.is_merchant_owner(merchant_id) or public.is_merchant_staff(merchant_id));

drop policy if exists "customers_all_merchant" on public.customers;
create policy "customers_all_merchant" on public.customers for all
  using (public.is_merchant_owner(merchant_id) or public.is_merchant_staff(merchant_id))
  with check (public.is_merchant_owner(merchant_id) or public.is_merchant_staff(merchant_id));

drop policy if exists "passes_merchant_all" on public.wallet_passes;
create policy "passes_merchant_all" on public.wallet_passes for all
  using (public.is_merchant_owner(merchant_id) or public.is_merchant_staff(merchant_id))
  with check (public.is_merchant_owner(merchant_id) or public.is_merchant_staff(merchant_id));

drop policy if exists "stamp_events_merchant" on public.stamp_events;
create policy "stamp_events_merchant" on public.stamp_events for all
  using (exists (
    select 1
    from public.wallet_passes wp
    where wp.id = pass_id
      and (public.is_merchant_owner(wp.merchant_id) or public.is_merchant_staff(wp.merchant_id))
  ))
  with check (exists (
    select 1
    from public.wallet_passes wp
    where wp.id = pass_id
      and (public.is_merchant_owner(wp.merchant_id) or public.is_merchant_staff(wp.merchant_id))
  ));

drop policy if exists "redemptions_merchant" on public.redemptions;
create policy "redemptions_merchant" on public.redemptions for all
  using (exists (
    select 1
    from public.wallet_passes wp
    where wp.id = pass_id
      and (public.is_merchant_owner(wp.merchant_id) or public.is_merchant_staff(wp.merchant_id))
  ))
  with check (exists (
    select 1
    from public.wallet_passes wp
    where wp.id = pass_id
      and (public.is_merchant_owner(wp.merchant_id) or public.is_merchant_staff(wp.merchant_id))
  ));

-- 4) Allow inserting initial owner membership (in case triggers are off)
drop policy if exists "merchant_staff_owner_bootstrap" on public.merchant_staff;
create policy "merchant_staff_owner_bootstrap" on public.merchant_staff
  for insert
  with check (
    role = 'owner'
    and user_id = auth.uid()
    and exists (
      select 1
      from public.merchants m
      where m.id = merchant_staff.merchant_id
        and m.user_id = auth.uid()
    )
  );

