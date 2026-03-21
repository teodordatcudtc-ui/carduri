-- A treia culoare pentru design card (mesh, accente)

alter table public.loyalty_programs
  add column if not exists card_custom_bg3_color text;

update public.loyalty_programs
set card_custom_bg3_color = coalesce(card_custom_bg3_color, card_custom_bg2_color, card_color)
where card_custom_bg3_color is null;
