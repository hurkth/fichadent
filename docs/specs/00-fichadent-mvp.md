# Fichadent · MVP (alcance aprobado 26-oct-2026)

Fork de Goldent para venderlo a varios consultorios. Las specs originales de Goldent quedan en `goldent/` como referencia
(pantallas de ficha, nueva visita y búsqueda siguen esas specs).

## Reglas del MVP

1. **1 doctor = 1 consultorio.** Cada doctor se registra solo y ve únicamente sus pacientes. Aún no hay varios doctores por consultorio ni un doctor en dos consultorios (ver `futuro-multidoctor.md`).
2. **Prueba de 5 días.** Al vencer no se bloquea nada; el plan se activa a mano.
3. **Historias en papel:** no hay pantalla de captura; se ofrece el servicio de digitalización por WhatsApp.
4. **WhatsApp:** solo enlaces con mensaje prellenado. Sin recordatorios automáticos.

## Funciones

| # | Función | Ruta / pieza |
|---|---|---|
| 1 | Registro, login, mantener sesión, recuperar contraseña, cerrar sesión | `/registro`, `/login`, `/reset-password` |
| 2 | CRUD de pacientes: crear, listar (paginado), buscar, editar, eliminar (lógico) | `/pacientes`, `/pacientes/nuevo`, `/pacientes/[id]/editar` |
| 3 | Ficha: datos, alertas, HC-00001, WhatsApp/llamar, visitas, archivos | `/pacientes/[id]` |
| 4 | Visitas con tratamientos por pieza (FDI) | `/pacientes/[id]/visitas/nueva` |
| 5 | Aviso "¿Tienes tus historias en papel? Te ayudamos a digitalizarlas" | `PaperRecordsNote` (Inicio, Pacientes vacío) |
| 6 | Marca: Fichadent + nombre, color y logo del consultorio ("Tu logo aquí") | `/ajustes`, `AppShell` |
| 7 | Demo con datos ficticios | `supabase/seed/demo.sql` |
| 8 | Agenda: día/semana/mes, crear, reprogramar, estados, atender | `/agenda` |
| 9 | Escribir al paciente por WhatsApp con mensaje de cita | Detalle de cita, ficha, filas |
| 10 | Aislamiento por consultorio (RLS + Storage privado) y auditoría | `0001_fichadent.sql` |

## Modelo de datos (resumen)

`clinics` (marca, plan, `trial_ends_at`) · `memberships` (usuario ↔ consultorio, PK `user_id`) · `patients` · `patient_conditions` ·
`conditions` y `services` (catálogos globales) · `appointments` (paciente **o** `guest_name`/`guest_phone`) · `visits` · `treatments` ·
`files` · `audit_log`.

RPC para el front: `my_session`, `search_patients`, `recent_patients`, `list_patients`, `delete_patient`, `agenda`.

## Estados de cita

| Estado | Cuándo |
|---|---|
| Programada | Al crearla |
| Confirmada | El paciente respondió por WhatsApp |
| Atendida | Automático al registrar la visita desde la cita (o a mano) |
| No asistió | No vino |
| Cancelada | Avisó que no viene, o se eliminó al paciente (citas futuras) |

"Quitar" saca de la agenda una cita creada por error (`deleted_at`).
