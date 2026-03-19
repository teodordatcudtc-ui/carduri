-- Per-card fields: name and color

alter table public.loyalty_programs
  add column if not exists card_name text,
  add column if not exists card_color text;

-- Backfill defaults for existing rows
update public.loyalty_programs
set
  card_name = coalesce(card_name, reward_description, 'Card fidelitate'),
  card_color = coalesce(card_color, '#ea751a');

alter table public.loyalty_programs
  alter column card_name set not null,
  alter column card_color set not null;

