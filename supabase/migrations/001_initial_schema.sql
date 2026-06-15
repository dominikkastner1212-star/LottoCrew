create schema if not exists app_private;

create extension if not exists pgcrypto;

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  display_name text not null,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.groups (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  default_lottery text not null default 'eurojackpot' check (default_lottery = 'eurojackpot'),
  monthly_amount numeric(10,2) not null default 24.00 check (monthly_amount >= 0),
  currency text not null default 'EUR',
  created_by uuid not null references public.profiles(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.group_members (
  id uuid primary key default gen_random_uuid(),
  group_id uuid not null references public.groups(id) on delete cascade,
  profile_id uuid not null references public.profiles(id) on delete cascade,
  role text not null default 'participant' check (role in ('admin', 'participant')),
  status text not null default 'active' check (status in ('active', 'invited', 'paused')),
  monthly_amount numeric(10,2),
  joined_at timestamptz not null default now(),
  unique (group_id, profile_id)
);

create table public.draws (
  id uuid primary key default gen_random_uuid(),
  group_id uuid not null references public.groups(id) on delete cascade,
  lottery_type text not null default 'eurojackpot' check (lottery_type = 'eurojackpot'),
  draw_date date not null,
  jackpot_amount numeric(14,2) not null default 0 check (jackpot_amount >= 0),
  result_numbers int[],
  result_extra_numbers int[],
  status text not null default 'planned' check (status in ('planned', 'submitted', 'evaluated')),
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.tickets (
  id uuid primary key default gen_random_uuid(),
  group_id uuid not null references public.groups(id) on delete cascade,
  draw_id uuid not null references public.draws(id) on delete cascade,
  label text not null,
  status text not null default 'planned' check (status in ('planned', 'submitted', 'evaluated')),
  stake_amount numeric(10,2) not null default 0 check (stake_amount >= 0),
  submitted_at timestamptz,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.ticket_numbers (
  id uuid primary key default gen_random_uuid(),
  ticket_id uuid not null references public.tickets(id) on delete cascade,
  position int not null check (position > 0),
  kind text not null check (kind in ('main', 'extra')),
  number int not null check (number > 0),
  constraint eurojackpot_number_ranges check (
    (kind = 'main' and position between 1 and 5 and number between 1 and 50)
    or (kind = 'extra' and position between 1 and 2 and number between 1 and 12)
  ),
  unique (ticket_id, kind, position)
);

create table public.payments (
  id uuid primary key default gen_random_uuid(),
  group_id uuid not null references public.groups(id) on delete cascade,
  member_id uuid not null references public.group_members(id) on delete cascade,
  due_month date not null,
  amount numeric(10,2) not null check (amount >= 0),
  status text not null default 'open' check (status in ('open', 'paid')),
  paid_at timestamptz,
  note text,
  checked_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (member_id, due_month)
);

create table public.winnings (
  id uuid primary key default gen_random_uuid(),
  group_id uuid not null references public.groups(id) on delete cascade,
  draw_id uuid not null references public.draws(id) on delete cascade,
  ticket_id uuid not null references public.tickets(id) on delete cascade,
  amount numeric(12,2) not null default 0 check (amount >= 0),
  prize_rank text,
  recorded_by uuid references public.profiles(id) on delete set null,
  recorded_at timestamptz not null default now()
);

create table public.settings (
  id uuid primary key default gen_random_uuid(),
  group_id uuid not null references public.groups(id) on delete cascade,
  key text not null,
  value jsonb not null default '{}'::jsonb,
  updated_by uuid references public.profiles(id) on delete set null,
  updated_at timestamptz not null default now(),
  unique (group_id, key)
);

create or replace function app_private.is_group_member(target_group_id uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1
    from public.group_members gm
    where gm.group_id = target_group_id
      and gm.profile_id = auth.uid()
      and gm.status = 'active'
  );
$$;

create or replace function app_private.is_group_admin(target_group_id uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1
    from public.group_members gm
    where gm.group_id = target_group_id
      and gm.profile_id = auth.uid()
      and gm.role = 'admin'
      and gm.status = 'active'
  );
$$;

create or replace function app_private.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, display_name)
  values (
    new.id,
    coalesce(new.email, ''),
    coalesce(new.raw_user_meta_data ->> 'display_name', split_part(coalesce(new.email, 'Neues Mitglied'), '@', 1))
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function app_private.handle_new_user();

alter table public.profiles enable row level security;
alter table public.groups enable row level security;
alter table public.group_members enable row level security;
alter table public.draws enable row level security;
alter table public.tickets enable row level security;
alter table public.ticket_numbers enable row level security;
alter table public.payments enable row level security;
alter table public.winnings enable row level security;
alter table public.settings enable row level security;

create policy "profiles_select_group_peers"
  on public.profiles for select
  using (
    id = auth.uid()
    or exists (
      select 1
      from public.group_members mine
      join public.group_members peer on peer.group_id = mine.group_id
      where mine.profile_id = auth.uid()
        and peer.profile_id = profiles.id
    )
  );

create policy "profiles_insert_self"
  on public.profiles for insert
  with check (id = auth.uid());

create policy "profiles_update_self"
  on public.profiles for update
  using (id = auth.uid())
  with check (id = auth.uid());

create policy "groups_select_members"
  on public.groups for select
  using (app_private.is_group_member(id));

create policy "groups_insert_authenticated"
  on public.groups for insert
  with check (created_by = auth.uid());

create policy "groups_update_admins"
  on public.groups for update
  using (app_private.is_group_admin(id))
  with check (app_private.is_group_admin(id));

create policy "group_members_select_members"
  on public.group_members for select
  using (app_private.is_group_member(group_id));

create policy "group_members_insert_creator_admin"
  on public.group_members for insert
  with check (
    profile_id = auth.uid()
    and role = 'admin'
    and exists (
      select 1
      from public.groups g
      where g.id = group_members.group_id
        and g.created_by = auth.uid()
    )
  );

create policy "group_members_manage_admins"
  on public.group_members for all
  using (app_private.is_group_admin(group_id))
  with check (app_private.is_group_admin(group_id));

create policy "draws_select_members"
  on public.draws for select
  using (app_private.is_group_member(group_id));

create policy "draws_manage_admins"
  on public.draws for all
  using (app_private.is_group_admin(group_id))
  with check (app_private.is_group_admin(group_id));

create policy "tickets_select_members"
  on public.tickets for select
  using (app_private.is_group_member(group_id));

create policy "tickets_manage_admins"
  on public.tickets for all
  using (app_private.is_group_admin(group_id))
  with check (app_private.is_group_admin(group_id));

create policy "ticket_numbers_select_members"
  on public.ticket_numbers for select
  using (
    exists (
      select 1
      from public.tickets t
      where t.id = ticket_numbers.ticket_id
        and app_private.is_group_member(t.group_id)
    )
  );

create policy "ticket_numbers_manage_admins"
  on public.ticket_numbers for all
  using (
    exists (
      select 1
      from public.tickets t
      where t.id = ticket_numbers.ticket_id
        and app_private.is_group_admin(t.group_id)
    )
  )
  with check (
    exists (
      select 1
      from public.tickets t
      where t.id = ticket_numbers.ticket_id
        and app_private.is_group_admin(t.group_id)
    )
  );

create policy "payments_select_member_or_admin"
  on public.payments for select
  using (
    app_private.is_group_admin(group_id)
    or exists (
      select 1
      from public.group_members gm
      where gm.id = payments.member_id
        and gm.profile_id = auth.uid()
    )
  );

create policy "payments_manage_admins"
  on public.payments for all
  using (app_private.is_group_admin(group_id))
  with check (app_private.is_group_admin(group_id));

create policy "winnings_select_members"
  on public.winnings for select
  using (app_private.is_group_member(group_id));

create policy "winnings_manage_admins"
  on public.winnings for all
  using (app_private.is_group_admin(group_id))
  with check (app_private.is_group_admin(group_id));

create policy "settings_select_members"
  on public.settings for select
  using (app_private.is_group_member(group_id));

create policy "settings_manage_admins"
  on public.settings for all
  using (app_private.is_group_admin(group_id))
  with check (app_private.is_group_admin(group_id));

create index idx_group_members_profile on public.group_members(profile_id);
create index idx_draws_group_date on public.draws(group_id, draw_date desc);
create index idx_tickets_draw on public.tickets(draw_id);
create index idx_payments_group_month on public.payments(group_id, due_month desc);
create index idx_winnings_group_recorded on public.winnings(group_id, recorded_at desc);

grant usage on schema public to authenticated;
grant select, insert, update, delete on all tables in schema public to authenticated;
grant usage on schema app_private to authenticated;
grant execute on all functions in schema app_private to authenticated;
