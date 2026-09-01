-- Neue Gruppen sollen keinen festen Monatsbetrag mehr als Fallback vorgeben.
alter table public.groups
  alter column monthly_amount set default 0;
