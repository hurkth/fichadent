-- =====================================================================
-- FICHADENT · Esquema MVP v1 · Supabase (Postgres 15+)
-- Proyecto NUEVO. Ejecutar completo en: Supabase > SQL Editor > Run
-- =====================================================================
-- Reglas del MVP:
--  · 1 doctor = 1 consultorio (clinic). Cada doctor ve SOLO sus datos.
--  · Autoregistro: al crear el usuario en Auth se crea su consultorio
--    con 5 días de prueba (trigger on_auth_user_created).
--  · Al vencer la prueba no se bloquea nada (plan se activa a mano).
--  · Pacientes CRUD: "eliminar" = borrado lógico (deleted_at). Las
--    historias clínicas no se borran físicamente.
--  · Agenda: citas con paciente registrado o con nombre/celular libre.
--  · clinic_id en todo + memberships: preparado para varios doctores
--    por consultorio en el futuro sin rehacer el esquema.
-- =====================================================================


-- ---------------------------------------------------------------------
-- 0. EXTENSIONES
-- ---------------------------------------------------------------------
create extension if not exists pg_trgm  with schema extensions;
create extension if not exists unaccent with schema extensions;

create or replace function public.f_unaccent(text)
returns text
language sql immutable parallel safe strict
set search_path = ''
as $$ select extensions.unaccent('extensions.unaccent'::regdictionary, $1) $$;


-- ---------------------------------------------------------------------
-- 1. CONSULTORIO Y USUARIO
-- ---------------------------------------------------------------------
create table public.clinics (
  id             uuid primary key default gen_random_uuid(),
  name           text not null check (length(trim(name)) between 2 and 80),
  phone          text,
  address        text,
  logo_path      text,                          -- patient-files/{clinic_id}/logo/...
  brand_color    text not null default '#0F766E'
                 check (brand_color ~ '^#[0-9A-Fa-f]{6}$'),
  plan           text not null default 'trial'
                 check (plan in ('trial','active','demo','suspended')),
  trial_ends_at  timestamptz not null default now() + interval '5 days',
  record_seq     integer not null default 0,    -- contador HC-00001
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

-- MVP: un usuario pertenece a UN consultorio (PK = user_id).
-- Futuro multi-doctor: cambiar PK a (user_id, clinic_id).
create table public.memberships (
  user_id       uuid primary key references auth.users(id) on delete cascade,
  clinic_id     uuid not null references public.clinics(id) on delete cascade,
  role          text not null default 'owner'
                check (role in ('owner','dentist','assistant')),
  display_name  text not null,                  -- "Dra. Ana Quispe"
  active        boolean not null default true,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);
create index memberships_clinic_idx on public.memberships (clinic_id);

-- Consultorio del usuario logueado. Base de todas las políticas RLS.
create or replace function public.current_clinic_id()
returns uuid
language sql stable security definer
set search_path = ''
as $$
  select clinic_id from public.memberships
  where user_id = auth.uid() and active
  limit 1
$$;


-- ---------------------------------------------------------------------
-- 2. PACIENTES
-- ---------------------------------------------------------------------
create table public.patients (
  id                    uuid primary key default gen_random_uuid(),
  clinic_id             uuid not null default public.current_clinic_id()
                        references public.clinics(id),
  record_number         text not null,          -- HC-00001 (trigger)
  legacy_record_number  text,                   -- N° de historia en papel
  first_names           text not null check (length(trim(first_names)) > 0),
  last_names            text not null check (length(trim(last_names)) > 0),
  dni                   text check (dni ~ '^[0-9]{8}$'),
  birth_date            date check (birth_date <= current_date),
  sex                   text check (sex in ('F','M')),
  phone                 text,
  email                 text,
  address               text,
  occupation            text,
  marital_status        text check (marital_status in
                        ('soltero','casado','conviviente','divorciado','viudo')),
  notes                 text,
  deleted_at            timestamptz,            -- "eliminar" = borrado lógico
  created_by            uuid default auth.uid() references auth.users(id) on delete set null,
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now(),
  unique (clinic_id, id),
  unique (clinic_id, record_number)
);

create unique index patients_dni_uq
  on public.patients (clinic_id, dni) where dni is not null and deleted_at is null;
create index patients_legacy_idx
  on public.patients (clinic_id, legacy_record_number) where legacy_record_number is not null;
create index patients_phone_idx
  on public.patients (clinic_id, phone) where deleted_at is null;
create index patients_name_trgm_idx
  on public.patients using gin
  (public.f_unaccent(lower(first_names || ' ' || last_names)) extensions.gin_trgm_ops)
  where deleted_at is null;


-- ---------------------------------------------------------------------
-- 3. ANTECEDENTES ("Ud. sufre de")
-- ---------------------------------------------------------------------
create table public.conditions (
  id            uuid primary key default gen_random_uuid(),
  clinic_id     uuid references public.clinics(id),   -- null = catálogo global
  code          text not null,
  label         text not null,
  needs_detail  boolean not null default true,
  is_alert      boolean not null default true,
  sort_order    integer not null default 0,
  active        boolean not null default true
);
create unique index conditions_code_uq
  on public.conditions (coalesce(clinic_id, '00000000-0000-0000-0000-000000000000'::uuid), code);

create table public.patient_conditions (
  id            uuid primary key default gen_random_uuid(),
  clinic_id     uuid not null default public.current_clinic_id(),
  patient_id    uuid not null,
  condition_id  uuid not null references public.conditions(id),
  detail        text,
  active        boolean not null default true,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  foreign key (clinic_id, patient_id) references public.patients (clinic_id, id),
  unique (patient_id, condition_id)
);


-- ---------------------------------------------------------------------
-- 4. CATÁLOGO DE SERVICIOS
-- ---------------------------------------------------------------------
create table public.services (
  id             uuid primary key default gen_random_uuid(),
  clinic_id      uuid references public.clinics(id),  -- null = catálogo global
  name           text not null,
  category       text not null,
  requires_tooth boolean not null default false,
  default_price  numeric(10,2),                       -- reservado (cobros)
  sort_order     integer not null default 0,
  active         boolean not null default true
);
create unique index services_name_uq
  on public.services (coalesce(clinic_id, '00000000-0000-0000-0000-000000000000'::uuid), name);


-- ---------------------------------------------------------------------
-- 5. AGENDA (citas)
-- ---------------------------------------------------------------------
create table public.appointments (
  id            uuid primary key default gen_random_uuid(),
  clinic_id     uuid not null default public.current_clinic_id(),
  patient_id    uuid,                          -- null = paciente aún no registrado
  guest_name    text,                          -- nombre si no está registrado
  guest_phone   text,
  starts_at     timestamptz not null,
  ends_at       timestamptz not null,
  status        text not null default 'scheduled'
                check (status in ('scheduled','confirmed','done','no_show','cancelled')),
  reason        text,
  notes         text,
  deleted_at    timestamptz,
  created_by    uuid default auth.uid() references auth.users(id) on delete set null,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  constraint appointments_time_order   check (ends_at > starts_at),
  constraint appointments_max_length  check (ends_at - starts_at <= interval '12 hours'),
  constraint appointments_who         check (patient_id is not null
                                             or length(trim(coalesce(guest_name, ''))) > 0),
  unique (clinic_id, id),
  foreign key (clinic_id, patient_id) references public.patients (clinic_id, id)
);
create index appointments_range_idx
  on public.appointments (clinic_id, starts_at) where deleted_at is null;
create index appointments_patient_idx on public.appointments (patient_id);


-- ---------------------------------------------------------------------
-- 6. VISITAS Y TRATAMIENTOS
-- ---------------------------------------------------------------------
create table public.visits (
  id              uuid primary key default gen_random_uuid(),
  clinic_id       uuid not null default public.current_clinic_id(),
  patient_id      uuid not null,
  appointment_id  uuid unique,                 -- null = llegó sin cita
  visit_date      date not null default current_date,
  reason          text,
  notes           text,
  deleted_at      timestamptz,
  created_by      uuid default auth.uid() references auth.users(id) on delete set null,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  unique (clinic_id, id),
  foreign key (clinic_id, patient_id)     references public.patients (clinic_id, id),
  foreign key (clinic_id, appointment_id) references public.appointments (clinic_id, id)
);
create index visits_patient_idx
  on public.visits (patient_id, visit_date desc) where deleted_at is null;

create table public.treatments (
  id            uuid primary key default gen_random_uuid(),
  clinic_id     uuid not null default public.current_clinic_id(),
  patient_id    uuid not null,
  visit_id      uuid not null,
  service_id    uuid not null references public.services(id),
  tooth         text check (tooth ~ '^([1-4][1-8]|[5-8][1-5])$'),  -- FDI
  status        text not null default 'done'
                check (status in ('planned','in_progress','done')),
  notes         text,
  deleted_at    timestamptz,
  created_by    uuid default auth.uid() references auth.users(id) on delete set null,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  unique (clinic_id, id),
  foreign key (clinic_id, patient_id) references public.patients (clinic_id, id),
  foreign key (clinic_id, visit_id)   references public.visits   (clinic_id, id)
);
create index treatments_visit_idx   on public.treatments (visit_id)   where deleted_at is null;
create index treatments_patient_idx on public.treatments (patient_id) where deleted_at is null;


-- ---------------------------------------------------------------------
-- 7. ARCHIVOS (fotos, rayos X, historia en papel)
-- ---------------------------------------------------------------------
create table public.files (
  id            uuid primary key default gen_random_uuid(),
  clinic_id     uuid not null default public.current_clinic_id(),
  patient_id    uuid not null,
  visit_id      uuid,
  kind          text not null
                check (kind in ('paper_record','xray','photo','consent','other')),
  storage_path  text not null unique,          -- {clinic_id}/{patient_id}/{file_id}.webp
  mime_type     text,
  size_bytes    bigint,
  caption       text,
  taken_at      date,
  deleted_at    timestamptz,
  created_by    uuid default auth.uid() references auth.users(id) on delete set null,
  created_at    timestamptz not null default now(),
  unique (clinic_id, id),
  foreign key (clinic_id, patient_id) references public.patients (clinic_id, id),
  foreign key (clinic_id, visit_id)   references public.visits   (clinic_id, id),
  constraint files_path_matches check (split_part(storage_path, '/', 1) = clinic_id::text
     and split_part(storage_path, '/', 2) = patient_id::text)
);
create index files_patient_idx
  on public.files (patient_id, kind) where deleted_at is null;


-- ---------------------------------------------------------------------
-- 8. AUDITORÍA
-- ---------------------------------------------------------------------
create table public.audit_log (
  id          bigint generated always as identity primary key,
  clinic_id   uuid,
  table_name  text not null,
  record_id   uuid not null,
  action      text not null check (action in ('INSERT','UPDATE','DELETE')),
  old_data    jsonb,
  new_data    jsonb,
  changed_by  uuid,
  changed_at  timestamptz not null default now()
);
create index audit_record_idx on public.audit_log (table_name, record_id, changed_at desc);


-- ---------------------------------------------------------------------
-- 9. TRIGGERS
-- ---------------------------------------------------------------------
create or replace function public.tg_set_updated_at()
returns trigger language plpgsql set search_path = '' as $$
begin
  new.updated_at := now();
  return new;
end $$;

do $$
declare t text;
begin
  foreach t in array array['clinics','memberships','patients','patient_conditions',
                           'appointments','visits','treatments']
  loop
    execute format('create trigger set_updated_at before update on public.%I
                    for each row execute function public.tg_set_updated_at()', t);
  end loop;
end $$;

-- HC-00001 correlativo por consultorio
create or replace function public.tg_patient_record_number()
returns trigger language plpgsql security definer set search_path = '' as $$
declare seq integer;
begin
  update public.clinics set record_seq = record_seq + 1
   where id = new.clinic_id
   returning record_seq into seq;
  new.record_number := 'HC-' || lpad(seq::text, 5, '0');
  return new;
end $$;

create trigger patient_record_number before insert on public.patients
for each row execute function public.tg_patient_record_number();

create or replace function public.tg_patient_immutable()
returns trigger language plpgsql set search_path = '' as $$
begin
  if new.record_number <> old.record_number or new.clinic_id <> old.clinic_id then
    raise exception 'record_number y clinic_id no se pueden modificar';
  end if;
  return new;
end $$;

create trigger patient_immutable before update on public.patients
for each row execute function public.tg_patient_immutable();

-- Visita registrada desde una cita → la cita queda "atendida"
create or replace function public.tg_visit_closes_appointment()
returns trigger language plpgsql set search_path = '' as $$
begin
  if new.appointment_id is not null then
    update public.appointments set status = 'done'
     where id = new.appointment_id and status <> 'done';
  end if;
  return new;
end $$;

create trigger visit_closes_appointment after insert on public.visits
for each row execute function public.tg_visit_closes_appointment();

-- Al eliminar un paciente se cancelan sus citas futuras
create or replace function public.tg_patient_soft_delete()
returns trigger language plpgsql set search_path = '' as $$
begin
  if new.deleted_at is not null and old.deleted_at is null then
    update public.appointments set status = 'cancelled'
     where patient_id = new.id and starts_at > now()
       and status in ('scheduled','confirmed') and deleted_at is null;
  end if;
  return new;
end $$;

create trigger patient_soft_delete after update of deleted_at on public.patients
for each row execute function public.tg_patient_soft_delete();

-- Auditoría
create or replace function public.tg_audit()
returns trigger language plpgsql security definer set search_path = '' as $$
declare
  rec jsonb := to_jsonb(coalesce(new, old));
begin
  insert into public.audit_log (clinic_id, table_name, record_id, action,
                                old_data, new_data, changed_by)
  values ((rec->>'clinic_id')::uuid, tg_table_name, (rec->>'id')::uuid, tg_op,
          case when tg_op <> 'INSERT' then to_jsonb(old) end,
          case when tg_op <> 'DELETE' then to_jsonb(new) end,
          auth.uid());
  return coalesce(new, old);
end $$;

do $$
declare t text;
begin
  foreach t in array array['patients','patient_conditions','appointments',
                           'visits','treatments','files']
  loop
    execute format('create trigger audit after insert or update or delete on public.%I
                    for each row execute function public.tg_audit()', t);
  end loop;
end $$;


-- ---------------------------------------------------------------------
-- 10. AUTOREGISTRO: usuario nuevo → su consultorio (5 días de prueba)
--     El front llama:
--     supabase.auth.signUp({ email, password, options: { data: {
--       full_name: 'Dra. Ana Quispe', clinic_name: 'Consultorio Sonrisa',
--       phone: '987654321' } } })
-- ---------------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = '' as $$
declare
  meta  jsonb := coalesce(new.raw_user_meta_data, '{}'::jsonb);
  cid   uuid;
  cname text := nullif(trim(meta->>'clinic_name'), '');
  dname text := nullif(trim(meta->>'full_name'), '');
begin
  insert into public.clinics (name, phone)
  values (left(coalesce(cname, 'Mi consultorio'), 80), nullif(trim(meta->>'phone'), ''))
  returning id into cid;

  insert into public.memberships (user_id, clinic_id, role, display_name)
  values (new.id, cid, 'owner', coalesce(dname, split_part(new.email, '@', 1)));
  return new;
end $$;

create trigger on_auth_user_created after insert on auth.users
for each row execute function public.handle_new_user();


-- ---------------------------------------------------------------------
-- 11. FUNCIONES PARA EL FRONT
-- ---------------------------------------------------------------------

-- Sesión: consultorio + usuario + días de prueba.  rpc('my_session')
create or replace function public.my_session()
returns jsonb
language sql stable security invoker set search_path = '' as $$
  select jsonb_build_object(
    'user_id',       m.user_id,
    'display_name',  m.display_name,
    'role',          m.role,
    'clinic', jsonb_build_object(
       'id', c.id, 'name', c.name, 'phone', c.phone, 'address', c.address,
       'logo_path', c.logo_path, 'brand_color', c.brand_color,
       'plan', c.plan, 'trial_ends_at', c.trial_ends_at,
       'trial_days_left', greatest(0, ceil(extract(epoch from c.trial_ends_at - now()) / 86400))::int)
  )
  from public.memberships m
  join public.clinics c on c.id = m.clinic_id
  where m.user_id = auth.uid() and m.active
$$;

-- Tarjeta de paciente para listas
create or replace function public.patient_card(p public.patients)
returns jsonb
language sql stable security invoker set search_path = '' as $$
  select jsonb_build_object(
    'id',            p.id,
    'record_number', p.record_number,
    'legacy_record_number', p.legacy_record_number,
    'first_names',   p.first_names,
    'last_names',    p.last_names,
    'dni',           p.dni,
    'phone',         p.phone,
    'age',           extract(year from age(p.birth_date))::int,
    'alerts', coalesce((
       select jsonb_agg(
                case when c.code = 'allergy' and pc.detail is not null
                     then 'Alergia: ' || pc.detail
                     else c.label end
                order by c.sort_order)
       from public.patient_conditions pc
       join public.conditions c on c.id = pc.condition_id
       where pc.patient_id = p.id and pc.active and c.is_alert), '[]'::jsonb),
    'last_visit', (select max(v.visit_date) from public.visits v
                   where v.patient_id = p.id and v.deleted_at is null)
  )
$$;

-- Buscador: nombre (tildes/typos), DNI, celular, HC o N° antiguo
create or replace function public.search_patients(q text, max_results int default 20)
returns setof jsonb
language sql stable security invoker set search_path = '' as $$
  with term as (
    select public.f_unaccent(lower(trim(q))) as t,
           regexp_replace(q, '\D', '', 'g')  as digits
  )
  select public.patient_card(p)
  from public.patients p, term
  where p.deleted_at is null
    and (
         extensions.word_similarity(
           term.t, public.f_unaccent(lower(p.first_names || ' ' || p.last_names))) >= 0.4
      or public.f_unaccent(lower(p.first_names || ' ' || p.last_names))
           like '%' || term.t || '%'
      or (length(term.digits) >= 3 and (p.dni   like term.digits || '%'
                                     or p.phone like '%' || term.digits || '%'))
      or upper(p.record_number)        = upper(trim(q))
      or upper(p.legacy_record_number) = upper(trim(q))
    )
  order by extensions.word_similarity(
             term.t, public.f_unaccent(lower(p.first_names || ' ' || p.last_names))) desc,
           p.last_names
  limit max_results
$$;

-- Recientes (Inicio)
create or replace function public.recent_patients(max_results int default 6)
returns setof jsonb
language sql stable security invoker set search_path = '' as $$
  select public.patient_card(p)
  from public.patients p
  left join lateral (
    select max(v.created_at) as last_activity from public.visits v
    where v.patient_id = p.id and v.deleted_at is null
  ) v on true
  where p.deleted_at is null
  order by greatest(p.updated_at, coalesce(v.last_activity, p.updated_at)) desc
  limit max_results
$$;

-- Lista paginada de pacientes (CRUD).  rpc('list_patients', { page_size: 20, page: 0 })
create or replace function public.list_patients(page_size int default 20, page int default 0)
returns setof jsonb
language sql stable security invoker set search_path = '' as $$
  select public.patient_card(p) || jsonb_build_object('total', count(*) over ())
  from public.patients p
  where p.deleted_at is null
  order by p.last_names, p.first_names
  limit least(greatest(page_size, 1), 100) offset greatest(page, 0) * least(greatest(page_size, 1), 100)
$$;

-- Eliminar paciente (borrado lógico).  rpc('delete_patient', { p_id })
create or replace function public.delete_patient(p_id uuid)
returns void
language plpgsql security invoker set search_path = '' as $$
begin
  update public.patients set deleted_at = now()
   where id = p_id and deleted_at is null;
  if not found then
    raise exception 'Paciente no encontrado' using errcode = 'P0002';
  end if;
end $$;

-- Agenda de un rango (día/semana/mes, máx. 45 días).  rpc('agenda', { p_from, p_to })
create or replace function public.agenda(p_from timestamptz, p_to timestamptz)
returns setof jsonb
language plpgsql stable security invoker set search_path = '' as $$
begin
  if p_to <= p_from or p_to - p_from > interval '45 days' then
    raise exception 'Rango de agenda inválido (máximo 45 días)' using errcode = '22023';
  end if;
  return query
  select jsonb_build_object(
    'id', a.id, 'starts_at', a.starts_at, 'ends_at', a.ends_at,
    'status', a.status, 'reason', a.reason, 'notes', a.notes,
    'patient_id', a.patient_id,
    'name',  coalesce(p.first_names || ' ' || p.last_names, a.guest_name),
    'phone', coalesce(p.phone, a.guest_phone),
    'record_number', p.record_number,
    'visit_id', v.id
  )
  from public.appointments a
  left join public.patients p on p.id = a.patient_id
  left join public.visits   v on v.appointment_id = a.id and v.deleted_at is null
  where a.deleted_at is null
    and a.starts_at < p_to
    and a.ends_at   > p_from
  order by a.starts_at;
end $$;

grant execute on function public.my_session()                   to authenticated;
grant execute on function public.patient_card(public.patients)  to authenticated;
grant execute on function public.search_patients(text, int)     to authenticated;
grant execute on function public.recent_patients(int)           to authenticated;
grant execute on function public.list_patients(int, int)        to authenticated;
grant execute on function public.delete_patient(uuid)           to authenticated;
grant execute on function public.agenda(timestamptz, timestamptz) to authenticated;
revoke execute on function public.handle_new_user() from public, anon, authenticated;


-- ---------------------------------------------------------------------
-- 12. ROW LEVEL SECURITY: cada doctor solo ve su consultorio
--     Sin políticas DELETE en tablas clínicas = borrado físico bloqueado.
-- ---------------------------------------------------------------------
alter table public.clinics            enable row level security;
alter table public.memberships        enable row level security;
alter table public.patients           enable row level security;
alter table public.conditions         enable row level security;
alter table public.patient_conditions enable row level security;
alter table public.services           enable row level security;
alter table public.appointments       enable row level security;
alter table public.visits             enable row level security;
alter table public.treatments         enable row level security;
alter table public.files              enable row level security;
alter table public.audit_log          enable row level security;

create policy clinics_select on public.clinics for select to authenticated
  using (id = (select public.current_clinic_id()));
create policy clinics_update on public.clinics for update to authenticated
  using (id = (select public.current_clinic_id()))
  with check (id = (select public.current_clinic_id()));
-- El doctor edita sus datos de marca, NO su plan ni su prueba.
revoke update on public.clinics from authenticated;
grant  update (name, phone, address, logo_path, brand_color) on public.clinics to authenticated;

create policy memberships_select on public.memberships for select to authenticated
  using (user_id = (select auth.uid()));
create policy memberships_update on public.memberships for update to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));
revoke update on public.memberships from authenticated;
grant  update (display_name) on public.memberships to authenticated;

create policy catalog_conditions on public.conditions for select to authenticated
  using (clinic_id is null or clinic_id = (select public.current_clinic_id()));
create policy catalog_services on public.services for select to authenticated
  using (clinic_id is null or clinic_id = (select public.current_clinic_id()));

do $$
declare t text;
begin
  foreach t in array array['patients','patient_conditions','appointments',
                           'visits','treatments','files']
  loop
    execute format('create policy %1$s_select on public.%1$I for select to authenticated
                    using (clinic_id = (select public.current_clinic_id()))', t);
    execute format('create policy %1$s_insert on public.%1$I for insert to authenticated
                    with check (clinic_id = (select public.current_clinic_id()))', t);
    execute format('create policy %1$s_update on public.%1$I for update to authenticated
                    using (clinic_id = (select public.current_clinic_id()))
                    with check (clinic_id = (select public.current_clinic_id()))', t);
  end loop;
end $$;

create policy audit_select on public.audit_log for select to authenticated
  using (clinic_id = (select public.current_clinic_id()));


-- ---------------------------------------------------------------------
-- 13. STORAGE: bucket privado, carpeta = consultorio
--     Rutas: {clinic_id}/{patient_id}/{file_id}.webp  y  {clinic_id}/logo/logo.webp
-- ---------------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('patient-files', 'patient-files', false, 5242880,
        array['image/webp','image/jpeg','image/png','application/pdf'])
on conflict (id) do nothing;

create policy patient_files_select on storage.objects for select to authenticated
  using (bucket_id = 'patient-files'
         and (storage.foldername(name))[1] = (select public.current_clinic_id())::text);
create policy patient_files_insert on storage.objects for insert to authenticated
  with check (bucket_id = 'patient-files'
         and (storage.foldername(name))[1] = (select public.current_clinic_id())::text);
-- Reemplazar el logo (upsert) necesita update/delete sobre su carpeta logo/
create policy clinic_logo_update on storage.objects for update to authenticated
  using (bucket_id = 'patient-files'
         and (storage.foldername(name))[1] = (select public.current_clinic_id())::text
         and (storage.foldername(name))[2] = 'logo');
create policy clinic_logo_delete on storage.objects for delete to authenticated
  using (bucket_id = 'patient-files'
         and (storage.foldername(name))[1] = (select public.current_clinic_id())::text
         and (storage.foldername(name))[2] = 'logo');


-- ---------------------------------------------------------------------
-- 14. CATÁLOGOS GLOBALES
-- ---------------------------------------------------------------------
insert into public.conditions (code, label, sort_order) values
  ('allergy',        'Alergias',              1),
  ('diabetes',       'Diabetes',              2),
  ('bleeding',       'Hemorragias',           3),
  ('blood_pressure', 'Presión alta / baja',   4),
  ('gastric_ulcer',  'Úlcera gástrica',       5),
  ('heart_disease',  'Enfermedad cardiaca',   6),
  ('medication',     'Recibe medicamento',    7),
  ('other_disease',  'Otra enfermedad',       8),
  ('pregnant',       'Embarazada',            9);

insert into public.services (name, category, requires_tooth, sort_order) values
  ('Resina simple',              'Restauraciones',         true,   1),
  ('Resina compuesta',           'Restauraciones',         true,   2),
  ('Resina compleja',            'Restauraciones',         true,   3),
  ('Endodoncia unirradicular',   'Endodoncia',             true,   4),
  ('Endodoncia multirradicular', 'Endodoncia',             true,   5),
  ('Biopulpotomía',              'Endodoncia',             true,   6),
  ('Perno',                      'Prótesis',               true,   7),
  ('Prótesis fija',              'Prótesis',               false,  8),
  ('Prótesis parcial removible', 'Prótesis',               false,  9),
  ('Prótesis total',             'Prótesis',               false, 10),
  ('Profilaxis',                 'Prevención y estética',  false, 11),
  ('Destartraje',                'Prevención y estética',  false, 12),
  ('Blanqueamiento dental',      'Prevención y estética',  false, 13),
  ('Cirugía bucal',              'Cirugía',                false, 14),
  ('Exodoncia',                  'Cirugía',                true,  15),
  ('Implantes',                  'Cirugía',                true,  16),
  ('Ortodoncia inicial',         'Ortodoncia',             false, 17),
  ('Ortodoncia mensualidad',     'Ortodoncia',             false, 18),
  ('Rayos X',                    'Diagnóstico y otros',    false, 19),
  ('Consulta / evaluación',      'Diagnóstico y otros',    false, 20),
  ('Otros',                      'Diagnóstico y otros',    false, 21);
