update public.groups
set default_lottery = 'eurojackpot'
where default_lottery is distinct from 'eurojackpot';

update public.draws
set lottery_type = 'eurojackpot'
where lottery_type is distinct from 'eurojackpot';

alter table public.groups
  drop constraint if exists groups_default_lottery_check,
  add constraint groups_default_lottery_check check (default_lottery = 'eurojackpot');

alter table public.draws
  alter column lottery_type set default 'eurojackpot',
  drop constraint if exists draws_lottery_type_check,
  add constraint draws_lottery_type_check check (lottery_type = 'eurojackpot');

delete from public.ticket_numbers
where not (
  (kind = 'main' and position between 1 and 5 and number between 1 and 50)
  or (kind = 'extra' and position between 1 and 2 and number between 1 and 12)
);

alter table public.ticket_numbers
  drop constraint if exists eurojackpot_number_ranges,
  add constraint eurojackpot_number_ranges check (
    (kind = 'main' and position between 1 and 5 and number between 1 and 50)
    or (kind = 'extra' and position between 1 and 2 and number between 1 and 12)
  );
