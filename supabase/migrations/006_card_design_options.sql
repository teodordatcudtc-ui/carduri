-- Card design customization options for Loyalty Programs

alter table loyalty_programs
  add column if not exists card_template text,
  add column if not exists card_palette text,
  add column if not exists card_stamp_shape text,
  add column if not exists card_stamp_style text,
  add column if not exists card_custom_bg_color text,
  add column if not exists card_custom_bg2_color text;

update loyalty_programs
set
  card_template = coalesce(card_template, 'minimal'),
  card_palette = coalesce(card_palette, 'ink'),
  card_stamp_shape = coalesce(card_stamp_shape, 'circle'),
  card_stamp_style = coalesce(card_stamp_style, 'solid')
where true;

alter table loyalty_programs alter column card_template set default 'minimal';
alter table loyalty_programs alter column card_palette set default 'ink';
alter table loyalty_programs alter column card_stamp_shape set default 'circle';
alter table loyalty_programs alter column card_stamp_style set default 'solid';

