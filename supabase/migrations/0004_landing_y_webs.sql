-- Fichadent · 0004 · Landing editable + web pública de cada consultorio
-- Seguro de correr más de una vez.
--
-- 1. platform_admins + site_content: los textos de la landing de Fichadent se editan desde
--    /admin/landing (solo administradores de Fichadent). Lectura pública.
-- 2. clinic_sites: cada consultorio arma su web pública (/consultorio/<slug>) desde Ajustes › Mi web.
--    Se lee con rpc('public_clinic_site', slug), que solo devuelve webs publicadas.
-- 3. Storage: el logo de un consultorio con web publicada se puede leer sin sesión.

-- 1. LANDING EDITABLE ---------------------------------------------------------
create table if not exists public.platform_admins (
  user_id    uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);
alter table public.platform_admins enable row level security;
drop policy if exists platform_admins_self on public.platform_admins;
create policy platform_admins_self on public.platform_admins for select to authenticated
  using (user_id = (select auth.uid()));

create or replace function public.is_platform_admin()
returns boolean
language sql stable security definer
set search_path = ''
as $$
  select exists (select 1 from public.platform_admins where user_id = auth.uid())
$$;
grant execute on function public.is_platform_admin() to authenticated;

create table if not exists public.site_content (
  key        text primary key check (key ~ '^[a-z0-9_-]{2,40}$'),
  value      jsonb not null,
  updated_at timestamptz not null default now(),
  updated_by uuid default auth.uid() references auth.users(id) on delete set null
);
alter table public.site_content enable row level security;
drop policy if exists site_content_read on public.site_content;
create policy site_content_read on public.site_content for select to anon, authenticated using (true);
drop policy if exists site_content_write on public.site_content;
create policy site_content_write on public.site_content for all to authenticated
  using ((select public.is_platform_admin()))
  with check ((select public.is_platform_admin()));
grant select on public.site_content to anon, authenticated;
grant insert, update on public.site_content to authenticated;

drop trigger if exists set_updated_at on public.site_content;
create trigger set_updated_at before update on public.site_content
  for each row execute function public.tg_set_updated_at();

-- Para volverte administrador (una sola vez, desde el SQL Editor):
--   insert into public.platform_admins (user_id)
--   select id from auth.users where email = 'TU_CORREO' on conflict do nothing;

-- 2. WEB PÚBLICA DEL CONSULTORIO --------------------------------------------
create table if not exists public.clinic_sites (
  clinic_id   uuid primary key default public.current_clinic_id() references public.clinics(id) on delete cascade,
  slug        text not null unique check (slug ~ '^[a-z0-9](?:[a-z0-9-]{1,48}[a-z0-9])$'),
  published   boolean not null default false,
  headline    text check (char_length(headline) <= 120),
  about       text check (char_length(about) <= 1200),
  hours       text check (char_length(hours) <= 300),
  city        text check (char_length(city) <= 60),
  maps_url    text check (maps_url is null or maps_url ~ '^https://'),
  show_prices boolean not null default true,
  updated_at  timestamptz not null default now()
);
alter table public.clinic_sites enable row level security;
drop policy if exists clinic_sites_own on public.clinic_sites;
create policy clinic_sites_own on public.clinic_sites for all to authenticated
  using (clinic_id = (select public.current_clinic_id()))
  with check (clinic_id = (select public.current_clinic_id()));
grant select, insert, update on public.clinic_sites to authenticated;

drop trigger if exists set_updated_at on public.clinic_sites;
create trigger set_updated_at before update on public.clinic_sites
  for each row execute function public.tg_set_updated_at();

-- Web publicada por slug: datos del consultorio + servicios visibles (con precio si lo permite).
create or replace function public.public_clinic_site(p_slug text)
returns jsonb
language sql stable security definer
set search_path = ''
as $$
  select jsonb_build_object(
    'slug', s.slug,
    'name', c.name,
    'phone', c.phone,
    'address', c.address,
    'brand_color', c.brand_color,
    'logo_path', c.logo_path,
    'headline', s.headline,
    'about', s.about,
    'hours', s.hours,
    'city', s.city,
    'maps_url', s.maps_url,
    'show_prices', s.show_prices,
    'updated_at', s.updated_at,
    'services', coalesce((
      select jsonb_agg(jsonb_build_object(
               'name', sv.name,
               'category', sv.category,
               'requires_tooth', sv.requires_tooth,
               'price', case when s.show_prices then coalesce(cs.price, sv.default_price) end)
             order by sv.sort_order)
        from public.services sv
        left join public.clinic_services cs on cs.service_id = sv.id and cs.clinic_id = c.id
       where sv.active
         and (sv.clinic_id is null or sv.clinic_id = c.id)
         and not coalesce(cs.hidden, false)
    ), '[]'::jsonb)
  )
  from public.clinic_sites s
  join public.clinics c on c.id = s.clinic_id
  where s.slug = lower(p_slug) and s.published
$$;
grant execute on function public.public_clinic_site(text) to anon, authenticated;

-- Para el sitemap.
create or replace function public.public_clinic_slugs()
returns table (slug text, updated_at timestamptz)
language sql stable security definer
set search_path = ''
as $$
  select slug, updated_at from public.clinic_sites where published order by slug
$$;
grant execute on function public.public_clinic_slugs() to anon, authenticated;

-- ¿Está libre este slug? (Ajustes › Mi web)
create or replace function public.clinic_slug_available(p_slug text)
returns boolean
language sql stable security definer
set search_path = ''
as $$
  select not exists (
    select 1 from public.clinic_sites
    where slug = lower(p_slug) and clinic_id <> public.current_clinic_id()
  )
$$;
grant execute on function public.clinic_slug_available(text) to authenticated;

-- 3. LOGO PÚBLICO de webs publicadas ------------------------------------------
drop policy if exists public_site_logo_select on storage.objects;
create policy public_site_logo_select on storage.objects for select to anon, authenticated
  using (
    bucket_id = 'patient-files'
    and (storage.foldername(name))[2] = 'logo'
    and exists (
      select 1 from public.clinic_sites s
      where s.clinic_id::text = (storage.foldername(name))[1] and s.published
    )
  );

notify pgrst, 'reload schema';
