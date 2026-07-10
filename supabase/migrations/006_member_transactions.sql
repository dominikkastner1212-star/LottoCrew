create table if not exists public.member_transactions (
  id uuid primary key default gen_random_uuid(),
  group_id uuid not null references public.groups(id) on delete cascade,
  member_id uuid not null references public.group_members(id) on delete cascade,
  type text not null check (type in ('deposit', 'ticket_stake', 'winning_share', 'correction')),
  amount numeric(10,2) not null,
  description text,
  related_payment_id uuid references public.payments(id) on delete set null,
  related_ticket_id uuid references public.tickets(id) on delete set null,
  related_winning_id uuid references public.winnings(id) on delete set null,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  constraint member_transactions_amount_check check (
    (type in ('deposit', 'ticket_stake', 'winning_share') and amount > 0)
    or (type = 'correction' and amount <> 0)
  )
);

alter table public.member_transactions
  add column if not exists related_payment_id uuid references public.payments(id) on delete set null;

alter table public.member_transactions enable row level security;

drop policy if exists "member_transactions_select_member_or_admin" on public.member_transactions;
create policy "member_transactions_select_member_or_admin"
  on public.member_transactions for select
  to authenticated
  using (
    app_private.is_group_admin(group_id)
    or exists (
      select 1
      from public.group_members gm
      where gm.id = member_transactions.member_id
        and gm.group_id = member_transactions.group_id
        and gm.profile_id = (select auth.uid())
        and gm.status = 'active'
    )
  );

drop policy if exists "member_transactions_manage_admins" on public.member_transactions;
create policy "member_transactions_manage_admins"
  on public.member_transactions for all
  to authenticated
  using (app_private.is_group_admin(group_id))
  with check (app_private.is_group_admin(group_id));

create index if not exists idx_member_transactions_group_created
  on public.member_transactions(group_id, created_at desc);

create index if not exists idx_member_transactions_member_created
  on public.member_transactions(member_id, created_at desc);

create index if not exists idx_member_transactions_related_ticket
  on public.member_transactions(related_ticket_id);

create index if not exists idx_member_transactions_related_winning
  on public.member_transactions(related_winning_id);

create unique index if not exists idx_member_transactions_payment_deposit_unique
  on public.member_transactions(related_payment_id)
  where related_payment_id is not null and type = 'deposit';

create unique index if not exists idx_member_transactions_ticket_member_unique
  on public.member_transactions(related_ticket_id, member_id, type)
  where related_ticket_id is not null and type = 'ticket_stake';

create unique index if not exists idx_member_transactions_winning_member_unique
  on public.member_transactions(related_winning_id, member_id, type)
  where related_winning_id is not null and type = 'winning_share';

grant select, insert, update, delete on public.member_transactions to authenticated;

insert into public.member_transactions (
  group_id,
  member_id,
  type,
  amount,
  description,
  related_payment_id,
  created_by,
  created_at
)
select
  payments.group_id,
  payments.member_id,
  'deposit',
  payments.amount,
  'Monatsbeitrag ' || to_char(payments.due_month, 'YYYY-MM'),
  payments.id,
  payments.checked_by,
  coalesce(payments.paid_at, payments.updated_at, payments.created_at)
from public.payments
where payments.status = 'paid'
  and payments.amount > 0
on conflict do nothing;

with active_members as (
  select
    group_members.id as member_id,
    group_members.group_id,
    row_number() over (partition by group_members.group_id order by group_members.joined_at, group_members.id) as member_index,
    (count(*) over (partition by group_members.group_id))::int as member_count
  from public.group_members
  where group_members.status = 'active'
),
ticket_amounts as (
  select
    tickets.id as ticket_id,
    tickets.group_id,
    tickets.label,
    tickets.created_by,
    tickets.created_at,
    round(tickets.stake_amount * 100)::int as total_cents
  from public.tickets
  where tickets.stake_amount > 0
),
ticket_shares as (
  select
    ticket_amounts.group_id,
    active_members.member_id,
    'ticket_stake' as type,
    (
      (
        ticket_amounts.total_cents / active_members.member_count
      ) + case
        when active_members.member_index <= mod(ticket_amounts.total_cents, active_members.member_count) then 1
        else 0
      end
    )::numeric / 100 as amount,
    'Einsatz: ' || ticket_amounts.label as description,
    ticket_amounts.ticket_id as related_ticket_id,
    ticket_amounts.created_by,
    ticket_amounts.created_at
  from ticket_amounts
  join active_members on active_members.group_id = ticket_amounts.group_id
  where active_members.member_count > 0
)
insert into public.member_transactions (
  group_id,
  member_id,
  type,
  amount,
  description,
  related_ticket_id,
  created_by,
  created_at
)
select
  ticket_shares.group_id,
  ticket_shares.member_id,
  ticket_shares.type,
  ticket_shares.amount,
  ticket_shares.description,
  ticket_shares.related_ticket_id,
  ticket_shares.created_by,
  ticket_shares.created_at
from ticket_shares
where ticket_shares.amount > 0
on conflict do nothing;

with active_members as (
  select
    group_members.id as member_id,
    group_members.group_id,
    row_number() over (partition by group_members.group_id order by group_members.joined_at, group_members.id) as member_index,
    (count(*) over (partition by group_members.group_id))::int as member_count
  from public.group_members
  where group_members.status = 'active'
),
winning_amounts as (
  select
    winnings.id as winning_id,
    winnings.group_id,
    winnings.ticket_id,
    winnings.prize_rank,
    winnings.recorded_by,
    winnings.recorded_at,
    round(winnings.amount * 100)::int as total_cents
  from public.winnings
  where winnings.amount > 0
),
winning_shares as (
  select
    winning_amounts.group_id,
    active_members.member_id,
    'winning_share' as type,
    (
      (
        winning_amounts.total_cents / active_members.member_count
      ) + case
        when active_members.member_index <= mod(winning_amounts.total_cents, active_members.member_count) then 1
        else 0
      end
    )::numeric / 100 as amount,
    'Gewinnanteil: ' || coalesce(winning_amounts.prize_rank, 'Gewinn') as description,
    winning_amounts.ticket_id as related_ticket_id,
    winning_amounts.winning_id as related_winning_id,
    winning_amounts.recorded_by as created_by,
    winning_amounts.recorded_at as created_at
  from winning_amounts
  join active_members on active_members.group_id = winning_amounts.group_id
  where active_members.member_count > 0
)
insert into public.member_transactions (
  group_id,
  member_id,
  type,
  amount,
  description,
  related_ticket_id,
  related_winning_id,
  created_by,
  created_at
)
select
  winning_shares.group_id,
  winning_shares.member_id,
  winning_shares.type,
  winning_shares.amount,
  winning_shares.description,
  winning_shares.related_ticket_id,
  winning_shares.related_winning_id,
  winning_shares.created_by,
  winning_shares.created_at
from winning_shares
where winning_shares.amount > 0
on conflict do nothing;
