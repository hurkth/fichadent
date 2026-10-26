# Spec 06 · Diseño 1A aplicado, landing editable y web de cada consultorio

> Estado: **implementado** en `feat/ios27-liquid-glass`. Requiere correr `supabase/migrations/0003_service_prices.sql` y `0004_landing_y_webs.sql`.

## 1. Diseño 1A en la app (spec 03)
- Fondo de vidrio con el color del consultorio (`.app-backdrop`), tarjetas `.glass-card`, botones cápsula, avatares con degradado estable, pestañas y controles segmentados tipo iOS.
- **Dock flotante** en tablet (`src/components/shared/dock.tsx`): logo del consultorio + Inicio/Pacientes/Agenda + cuenta (con punto «En línea») · buscador ancho · botón «+» según la pantalla (nuevo paciente, nueva cita o nueva visita). En celular: barra de vidrio flotante + «+».
- **Inicio 1A** (`/inicio`): saludo gigante con el primer nombre en color de marca, cápsula de prueba gratis + conexión, tarjeta **Ahora** (próxima cita con cuenta regresiva, alertas, Recordar/Atender/Ficha), panel **Hoy** (cápsulas punto + texto), **Recientes** como pósters 3×2 y la cápsula «¿Historias en papel?».
- Búsqueda: el buscador del dock escribe `?q=`; los resultados suben en un panel de vidrio sobre el dock (tablet) o reemplazan el tablero (móvil).
- Eliminados: `side-nav.tsx`, `bottom-nav.tsx`, `today-appointments-card.tsx`. `TrialBanner` → `TrialChip`.

## 2. Landing de Fichadent visible con sesión y editable
- `/` ya no redirige a `/inicio` con sesión. El enlace del menú cambia a **Mi consultorio** si el navegador tiene sesión. Desde la app: menú del avatar › «Ver fichadent.com».
- Contenido editable en **/admin/landing** (solo administradores): textos de Google, portada, precios de planes (vacío = «Consúltanos»), historia de origen, preguntas frecuentes y cierre. Se guarda en `site_content` (key `landing`) y se publica al instante (`revalidatePath('/')`; además ISR cada 5 min).
- Lo que no esté guardado usa `DEFAULT_LANDING` (`src/content/landing.ts`). Si la base no responde, la landing igual carga.
- Hacerte administrador (una vez, en el SQL Editor de Supabase):
  ```sql
  insert into public.platform_admins (user_id)
  select id from auth.users where email = 'TU_CORREO' on conflict do nothing;
  ```

## 3. Web pública de cada consultorio
- **Ajustes › Mi web** (`/ajustes?seccion=web`, también en el menú del avatar): publicar sí/no, dirección (`/consultorio/<slug>`, se sugiere desde el nombre), frase principal, sobre nosotros, horario, ciudad, enlace de Google Maps y mostrar precios.
- La web usa lo que ya está en Fichadent: **nombre, logo, color, celular, dirección** (Ajustes › Consultorio) y **servicios con precios** (Ajustes › Precios; las ocultas no salen).
- Página `/consultorio/[slug]`: Liquid Glass con el color del consultorio, botón de WhatsApp con mensaje listo, llamada, dirección + Maps, horario, sobre nosotros, tratamientos y precios por categoría, botón flotante de WhatsApp en celular y «Hecho con Fichadent» al pie (trae clientes nuevos).
- SEO local: título «{Consultorio} · Dentista en {Ciudad}», descripción, canonical, Open Graph con el logo, JSON-LD `Dentist` (dirección, teléfono, horario, mapa y ofertas con precio). Las webs publicadas entran al `sitemap.xml`.
- Datos: tabla `clinic_sites` (RLS por consultorio), `rpc('public_clinic_site', slug)` (solo publicadas), `rpc('public_clinic_slugs')` (sitemap), `rpc('clinic_slug_available')`. El logo de un consultorio con web publicada se puede leer sin sesión (política `public_site_logo_select`).

## Vista previa sin Supabase
`/dev/inicio`, `/dev/resultados?q=quispe`, `/dev/precios`, `/dev/mi-web`, `/dev/web`, `/dev/admin-landing`.
