-- Rueckwaertskompatibler Schema-Fix fuer Datenbanken, die nur aus fruehen
-- Migrationen aufgebaut wurden. Bestehende Werte bleiben erhalten.

alter table public.groups
  add column if not exists invite_code text;

update public.groups
set invite_code = upper(substr(md5(id::text || clock_timestamp()::text), 1, 8))
where invite_code is null;

with duplicate_invite_codes as (
  select
    id,
    row_number() over (partition by invite_code order by created_at, id) as duplicate_index
  from public.groups
  where invite_code is not null
)
update public.groups groups_to_fix
set invite_code = upper(substr(md5(groups_to_fix.id::text || duplicate_invite_codes.duplicate_index::text || clock_timestamp()::text), 1, 8))
from duplicate_invite_codes
where duplicate_invite_codes.id = groups_to_fix.id
  and duplicate_invite_codes.duplicate_index > 1;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conrelid = 'public.groups'::regclass
      and conname = 'groups_invite_code_key'
  ) then
    alter table public.groups
      add constraint groups_invite_code_key unique (invite_code);
  end if;
end $$;

alter table public.groups
  alter column invite_code set not null;

alter table public.tickets
  add column if not exists main_matches int,
  add column if not exists euro_matches int,
  add column if not exists prize_rank text,
  add column if not exists evaluated_at timestamptz,
  add column if not exists ticket_image_path text;

update public.tickets
set
  main_matches = coalesce(main_matches, 0),
  euro_matches = coalesce(euro_matches, 0);

alter table public.tickets
  alter column main_matches set default 0,
  alter column main_matches set not null,
  alter column euro_matches set default 0,
  alter column euro_matches set not null;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conrelid = 'public.tickets'::regclass
      and conname = 'tickets_main_matches_check'
  ) then
    alter table public.tickets
      add constraint tickets_main_matches_check check (main_matches between 0 and 5) not valid;
  end if;

  if not exists (
    select 1
    from pg_constraint
    where conrelid = 'public.tickets'::regclass
      and conname = 'tickets_euro_matches_check'
  ) then
    alter table public.tickets
      add constraint tickets_euro_matches_check check (euro_matches between 0 and 2) not valid;
  end if;
end $$;

alter table public.winnings
  add column if not exists source text;

update public.winnings
set source = 'manual'
where source is null;

alter table public.winnings
  alter column source set default 'manual',
  alter column source set not null;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conrelid = 'public.winnings'::regclass
      and conname = 'winnings_source_check'
  ) then
    alter table public.winnings
      add constraint winnings_source_check check (source in ('manual', 'auto')) not valid;
  end if;
end $$;
