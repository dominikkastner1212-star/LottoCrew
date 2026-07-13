alter table public.draws
  add column if not exists closed_at timestamptz,
  add column if not exists closed_by uuid references public.profiles(id) on delete set null;

create index if not exists idx_draws_group_closed
  on public.draws(group_id, closed_at);
