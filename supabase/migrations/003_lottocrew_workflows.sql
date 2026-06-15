alter table public.tickets
  add column if not exists main_matches int not null default 0 check (main_matches between 0 and 5),
  add column if not exists euro_matches int not null default 0 check (euro_matches between 0 and 2),
  add column if not exists prize_rank text,
  add column if not exists evaluated_at timestamptz,
  add column if not exists ticket_image_path text;

alter table public.winnings
  add column if not exists source text not null default 'manual' check (source in ('manual', 'auto'));

drop policy if exists "tickets_manage_admins" on public.tickets;
create policy "tickets_manage_admins"
  on public.tickets for all
  using (app_private.is_group_admin(group_id))
  with check (app_private.is_group_admin(group_id));

create policy "tickets_insert_active_members"
  on public.tickets for insert
  with check (
    created_by = auth.uid()
    and status in ('planned', 'submitted')
    and app_private.is_group_member(group_id)
  );

create policy "tickets_update_own_planned"
  on public.tickets for update
  using (
    created_by = auth.uid()
    and status in ('planned', 'submitted')
    and app_private.is_group_member(group_id)
  )
  with check (
    created_by = auth.uid()
    and app_private.is_group_member(group_id)
  );

drop policy if exists "ticket_numbers_manage_admins" on public.ticket_numbers;
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

create policy "ticket_numbers_insert_own_tickets"
  on public.ticket_numbers for insert
  with check (
    exists (
      select 1
      from public.tickets t
      where t.id = ticket_numbers.ticket_id
        and t.created_by = auth.uid()
        and app_private.is_group_member(t.group_id)
    )
  );

create policy "ticket_numbers_update_own_tickets"
  on public.ticket_numbers for update
  using (
    exists (
      select 1
      from public.tickets t
      where t.id = ticket_numbers.ticket_id
        and t.created_by = auth.uid()
        and t.status in ('planned', 'submitted')
        and app_private.is_group_member(t.group_id)
    )
  )
  with check (
    exists (
      select 1
      from public.tickets t
      where t.id = ticket_numbers.ticket_id
        and t.created_by = auth.uid()
        and t.status in ('planned', 'submitted')
        and app_private.is_group_member(t.group_id)
    )
  );

insert into storage.buckets (id, name, public)
values ('ticket-documents', 'ticket-documents', false)
on conflict (id) do nothing;

create policy "ticket_documents_select_members"
  on storage.objects for select
  using (
    bucket_id = 'ticket-documents'
    and exists (
      select 1
      from public.group_members gm
      where gm.group_id::text = split_part(name, '/', 1)
        and gm.profile_id = auth.uid()
        and gm.status = 'active'
    )
  );

create policy "ticket_documents_insert_admins"
  on storage.objects for insert
  with check (
    bucket_id = 'ticket-documents'
    and app_private.is_group_admin(split_part(name, '/', 1)::uuid)
  );

create policy "ticket_documents_update_admins"
  on storage.objects for update
  using (
    bucket_id = 'ticket-documents'
    and app_private.is_group_admin(split_part(name, '/', 1)::uuid)
  )
  with check (
    bucket_id = 'ticket-documents'
    and app_private.is_group_admin(split_part(name, '/', 1)::uuid)
  );

create policy "ticket_documents_delete_admins"
  on storage.objects for delete
  using (
    bucket_id = 'ticket-documents'
    and app_private.is_group_admin(split_part(name, '/', 1)::uuid)
  );
