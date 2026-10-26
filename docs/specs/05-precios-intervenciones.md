# Spec 05 · Precios de intervenciones

> Estado: **implementado** en `feat/ios27-liquid-glass`. Requiere correr `supabase/migrations/0003_service_prices.sql`.

## Qué hace
- **Ajustes › Precios** (`/ajustes?seccion=precios`, también desde el menú del avatar): lista de intervenciones agrupadas por categoría. Por cada una: precio en soles (por pieza si la intervención lleva pieza; por tratamiento si no) y un interruptor «Uso» para mostrarla u ocultarla en Nueva visita. Botón fijo «Guardar N cambios».
- **Agregar intervención**: nombre, categoría (existente o nueva), si se elige pieza y precio. Queda solo para ese consultorio.
- **Nueva visita**: cada chip muestra su precio; al elegir el servicio, el paso 5 «Precio» se llena solo y se puede cambiar. Con varias piezas muestra «2 piezas · S/ 240». La lista de la visita muestra el precio de cada fila y el **total de la visita**.
- **Ficha › Visitas** y **Resumen**: precio por tratamiento y total por visita.

## Modelo de datos (0003)
| Objeto | Para qué |
|---|---|
| `clinic_services (clinic_id, service_id, price, hidden)` | Precio y visibilidad por consultorio. El catálogo global `services` no se toca. RLS: solo el propio consultorio. |
| `services` (filas con `clinic_id`) | Intervenciones propias. Políticas `services_insert_own` / `services_update_own`. |
| `treatments.price` | Precio cobrado, guardado al registrar. Cambiar la lista de precios **no** modifica visitas pasadas. |
| trigger `treatment_price` | Si el tratamiento llega sin precio, toma el del consultorio o el `default_price` del catálogo. |

## Código
- Datos: `src/lib/data/catalogs.ts` (`getServiceSettings`, `getServicesCatalog` con `price`).
- Acciones: `src/lib/actions/services.ts` (`saveServicePrices`, `createService`). Si falta la migración, devuelven un mensaje claro en vez de fallar en silencio.
- Validación: `src/lib/schemas/services.ts`. Formato: `formatSoles`, `parseSoles`, `sumPrices` en `src/lib/format.ts` (acepta «80», «80,50», «S/ 1,200»).
- UI: `src/components/features/settings/service-prices-form.tsx`; precio en `service-picker`, `treatment-builder` (paso 5), `treatment-item`, `visit-form`, `visits-tab`, `summary-tab`.
- Vista previa sin Supabase: `/dev/precios` y `/dev/nueva-visita`.

## Fuera de alcance (siguiente paso posible)
Cobros y pagos (saldo del paciente, pagos parciales, recibos). `treatments.price` ya deja la base lista para eso.
