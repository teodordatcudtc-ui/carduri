-- Extended card customization: hero footer, mesh/noise, badge, stamp icons

alter table public.loyalty_programs
  add column if not exists card_layout text,
  add column if not exists card_noise boolean,
  add column if not exists card_mesh_gradient boolean,
  add column if not exists card_footer_color text,
  add column if not exists card_badge_color text,
  add column if not exists card_badge_letter text,
  add column if not exists card_stamp_variant text,
  add column if not exists card_stamp_empty_icon text,
  add column if not exists card_stamp_filled_icon text;

update public.loyalty_programs
set
  card_layout = coalesce(card_layout, 'compact'),
  card_noise = coalesce(card_noise, false),
  card_mesh_gradient = coalesce(card_mesh_gradient, false),
  card_stamp_variant = coalesce(card_stamp_variant, 'brand'),
  card_stamp_empty_icon = coalesce(card_stamp_empty_icon, 'coffee'),
  card_stamp_filled_icon = coalesce(card_stamp_filled_icon, 'check')
where true;

alter table public.loyalty_programs alter column card_layout set default 'compact';
alter table public.loyalty_programs alter column card_noise set default false;
alter table public.loyalty_programs alter column card_mesh_gradient set default false;
alter table public.loyalty_programs alter column card_stamp_variant set default 'brand';
alter table public.loyalty_programs alter column card_stamp_empty_icon set default 'coffee';
alter table public.loyalty_programs alter column card_stamp_filled_icon set default 'check';
