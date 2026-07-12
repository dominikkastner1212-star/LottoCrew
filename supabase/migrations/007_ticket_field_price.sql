alter table public.groups
  add column if not exists ticket_field_price numeric(10,2) not null default 2.50 check (ticket_field_price >= 0);
