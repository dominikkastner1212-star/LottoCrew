-- Einladungscodes fuer Gruppen: Kollegen koennen bei der Registrierung
-- mit diesem Code direkt der bestehenden Gruppe beitreten, statt
-- versehentlich eine eigene leere Gruppe zu gruenden.

alter table public.groups
  add column if not exists invite_code text unique;

-- Codes fuer bestehende Gruppen erzeugen (8 Zeichen aus md5, pro Zeile
-- garantiert unterschiedlich).
update public.groups
set invite_code = upper(substr(md5(id::text || clock_timestamp()::text), 1, 8))
where invite_code is null;

alter table public.groups
  alter column invite_code set not null;
