# Fichadent · Historia clínica dental y agenda

App web (tablet primero, funciona en celular) para consultorios dentales. Nace como fork de Goldent.
Cada doctor se registra, prueba 5 días gratis y solo ve sus propios pacientes.

**Stack:** Next.js 15 (App Router) · React 19 · TypeScript strict · Tailwind CSS v4 · Supabase (`@supabase/ssr`) · react-hook-form + zod · Vitest.

## MVP

| Módulo | Qué hace |
|---|---|
| Registro | `/registro`: nombre, consultorio, celular, correo, contraseña → consultorio creado con 5 días de prueba |
| Pacientes | Crear, ver ficha, editar, eliminar (borrado lógico), lista paginada y búsqueda por nombre/DNI/celular/HC |
| Ficha | Datos, alertas médicas, WhatsApp y llamar, visitas con tratamientos (FDI), fotos y archivos |
| Agenda | Día / Semana / Mes, nueva cita (paciente o persona sin ficha), estados, mensaje de WhatsApp listo, Atender → visita |
| Marca | Nombre, color y logo del consultorio ("Tu logo aquí" si no hay) en `/ajustes` |
| Historias en papel | Aviso "Te ayudamos a digitalizarlas" con WhatsApp de Fichadent (servicio, no pantalla) |
| Prueba | Aviso de días restantes; al vencer no se bloquea nada (se activa a mano) |

Fuera del MVP: varios doctores por consultorio, cobros, recordatorios automáticos, odontograma, firma digital, OCR, web pública.

## Puesta en marcha

### 1. Supabase (proyecto nuevo, región São Paulo)

1. SQL Editor → ejecutar `supabase/migrations/0001_fichadent.sql`.
2. Authentication → Providers → Email → **desactivar "Confirm email"** mientras no haya SMTP propio
   (el correo de Supabase por defecto envía muy pocos mensajes por hora). Si se deja activo, el registro muestra "Revisa tu correo".
3. Authentication → URL Configuration → Site URL = dominio de la app (y `http://localhost:3000` en Redirect URLs).
4. Demo: Authentication → Users → Add user `demo@fichadent.pe` (Auto confirm) → SQL Editor → `supabase/seed/demo.sql`.

### 2. App

```bash
npm install --legacy-peer-deps
cp .env.example .env.local      # URL + llave pública de Supabase y WhatsApp de ventas
npm run dev                      # http://localhost:3000
```

| Script | Qué hace |
|---|---|
| `npm run dev` | Desarrollo |
| `npm run build` | Build de producción |
| `npm test` | Tests unitarios y de componentes (Vitest) |
| `npm run typecheck` | TypeScript |
| `npm run lint` | ESLint |

### Vista previa sin Supabase (solo desarrollo)

`/dev/<pantalla>` renderiza cada pantalla con datos de ejemplo, sin base de datos:
`/dev/login`, `/dev/registro`, `/dev/inicio`, `/dev/resultados`, `/dev/sin-resultados`, `/dev/vacio`, `/dev/pacientes`,
`/dev/ficha?tab=resumen|visitas|antecedentes|archivos|datos`, `/dev/nuevo-paciente`, `/dev/nueva-visita`,
`/dev/agenda?vista=dia|semana|mes`, `/dev/ajustes`. En producción responden 404.

## Seguridad y datos

- **Un doctor = un consultorio** (`clinics` + `memberships`). Todas las tablas llevan `clinic_id` y RLS con `current_clinic_id()`:
  ningún doctor puede leer ni escribir datos de otro. Las fotos están en un bucket privado, carpeta `{clinic_id}/…`.
- **Registro**: `supabase.auth.signUp` con `full_name`, `clinic_name`, `phone` en metadata; el trigger `on_auth_user_created`
  crea el consultorio y la membresía. Nunca se usa la llave `service_role` en la app.
- El doctor edita nombre, celular, dirección, color y logo; **no** puede cambiar su plan ni su fecha de prueba (permisos por columna).
- **Eliminar paciente** = `rpc('delete_patient')` (`deleted_at`); cancela sus citas futuras. La historia clínica no se borra físicamente.
- Preparado para varios doctores por consultorio: `memberships` tiene rol; para habilitarlo se cambia la PK a `(user_id, clinic_id)`.

## Arquitectura

```
src/
  app/                      páginas: solo cargan datos y componen
    (auth)/                 login, registro, recuperar contraseña
    (app)/                  inicio, pacientes, agenda, ajustes (AppShell)
    auth/callback|signout   route handlers
    dev/                    vista previa con datos de ejemplo
  components/
    ui/                     nivel 1 · primitivos sin dominio
    shared/                 nivel 2 · transversales (2+ pantallas)
    features/               nivel 3 · por pantalla (agenda, auth, patient, settings…)
  lib/
    supabase/               clientes browser / server / middleware
    data/                   lecturas (solo servidor)
    actions/                Server Actions (escrituras, validadas con zod)
    schemas/                zod compartido cliente/servidor
    agenda.ts               fechas en hora de Lima (UTC−5 fijo) y mensaje de WhatsApp
  hooks/                    búsqueda en vivo, subida de fotos, conexión
  types/                    database.ts (DB) y domain.ts (app)
```

Colores: tokens `brand-*` de `globals.css`. Dentro de la app, `.brand-scope` los recalcula desde el color del consultorio
(`--brand`), así que los componentes nunca usan hex.

## Decisiones de implementación

- **Fotos directo a Storage desde el navegador** (`usePhotoUpload`): WebP máx. 2000 px en `{clinic_id}/{patient_id}/{file_id}.webp`; luego `registerFile` guarda la metadata.
- **Agenda**: estado de vista en la URL (`/agenda?vista=semana&fecha=2026-10-05&cita=…`); `rpc('agenda')` acepta rangos de hasta 45 días.
- **WhatsApp**: enlaces `wa.me` con mensaje prellenado y editable; no se envía nada automático.
- **"Mantener la sesión"**: cookies `fd_remember` (30 días) o `fd_session` (se borra al cerrar el navegador).
- **`types/database.ts` escrito a mano**. Con el proyecto enlazado: `npx supabase gen types typescript --project-id <ref> > src/types/database.ts`.

## Pendiente

- E2E con Playwright contra un Supabase de staging.
- SMTP propio (ej. Resend) para activar la confirmación de correo.
- Panel interno para activar planes (hoy: `update clinics set plan = 'active' where …`).
