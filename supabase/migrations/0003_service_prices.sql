-- Fichadent · 0003 · Precios de intervenciones por consultorio
-- Seguro de correr más de una vez.
--
-- * clinic_services: precio y visibilidad de cada servicio PARA ESTE consultorio
--   (el catálogo global de services no se toca; cada consultorio pone sus precios).
-- * services: el consultorio puede crear y editar sus propias intervenciones (clinic_id = el suyo).
-- * treatments.price: precio cobrado, guardado al registrar el tratamiento. Si luego
--   cambias tu lista de precios, las visitas pasadas conservan su precio.

-- 1. Precio y visibilidad por consultorio ------------------------------------
create table if not exists public.clinic_services (
  clinic_id  uuid not null default public.current_clinic_id() references public.clinics(id) on delete cascade,
  service_id uuid not null references public.services(id) on delete cascade,
  price      numeric(10,2) check (price is null or price >= 0),
  hidden     boolean not null default false,
  updated_at timestamptz not null default now(),
  primary key (clinic_id, service_id)
);

alter table public.clinic_services enable row level security;
drop policy if exists clinic_services_all on public.clinic_services;
create policy clinic_services_all on public.clinic_services for all to authenticated
  using (clinic_id = (select public.current_clinic_id()))
  with check (clinic_id = (select public.current_clinic_id()));
grant select, insert, update, delete on public.clinic_services to authenticated;

drop trigger if exists set_updated_at on public.clinic_services;
create trigger set_updated_at before update on public.clinic_services
  for each row execute function public.tg_set_updated_at();

-- 2. Intervenciones propias del consultorio ----------------------------------
drop policy if exists services_insert_own on public.services;
create policy services_insert_own on public.services for insert to authenticated
  with check (clinic_id = (select public.current_clinic_id()));
drop policy if exists services_update_own on public.services;
create policy services_update_own on public.services for update to authenticated
  using (clinic_id = (select public.current_clinic_id()))
  with check (clinic_id = (select public.current_clinic_id()));
grant insert, update on public.services to authenticated;

-- 3. Precio cobrado en cada tratamiento --------------------------------------
alter table public.treatments
  add column if not exists price numeric(10,2) check (price is null or price >= 0);

-- Si el tratamiento llega sin precio, toma el del consultorio (o el sugerido del catálogo).
create or replace function public.tg_treatment_price()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.price is null then
    select coalesce(cs.price, s.default_price)
      into new.price
      from public.services s
      left join public.clinic_services cs
        on cs.service_id = s.id and cs.clinic_id = new.clinic_id
     where s.id = new.service_id;
  end if;
  return new;
end
$$;

drop trigger if exists treatment_price on public.treatments;
create trigger treatment_price before insert on public.treatments
  for each row execute function public.tg_treatment_price();

notify pgrst, 'reload schema';
