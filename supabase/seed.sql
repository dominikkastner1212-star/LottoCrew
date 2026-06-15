insert into public.profiles (id, email, display_name)
values
  ('00000000-0000-0000-0000-000000000001', 'anna@firma.de', 'Anna Keller'),
  ('00000000-0000-0000-0000-000000000002', 'jonas@firma.de', 'Jonas Weber')
on conflict (id) do nothing;

insert into public.groups (id, name, slug, created_by)
values ('10000000-0000-0000-0000-000000000001', 'AbteilungsJackpot', 'abteilungsjackpot', '00000000-0000-0000-0000-000000000001')
on conflict (slug) do nothing;

insert into public.group_members (group_id, profile_id, role, status)
values
  ('10000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 'admin', 'active'),
  ('10000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000002', 'participant', 'active')
on conflict (group_id, profile_id) do nothing;
