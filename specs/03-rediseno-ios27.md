# Spec 03 · Rediseño iOS 27 «Liquid Glass» (opción 1A)

> Fuente visual: `design/screens/02-inicio-ios27.dc.html` (artboard «1A · Controles flotantes + pósters» del canvas de diseño, tablet 1180×820).
> Este documento **reemplaza** las partes de `02-design-system.md` que contradiga (colores de superficie, radios, navegación de tablet, tipografía). Lo demás de esa spec sigue vigente.
> Regla de oro: **se cambia el acabado y la navegación; no cambia lo que hace cada pantalla** (mismas acciones, mismos datos, mismas rutas).

---

## 0. Cómo trabajar (para Claude Code)

1. Lee esta spec completa, `docs/specs/02-design-system.md` y el archivo de diseño de referencia antes de tocar código.
2. Trabaja por fases (sección 9). Al terminar cada fase: `npm run typecheck && npm run lint && npm test`, y revisa visualmente en `/dev/inicio` (y las demás pantallas de `/dev/[screen]`) a 1180×820 y 390×844.
3. Usa SIEMPRE tokens/utilidades del tema (`bg-brand-700`, `.glass`…), nunca hex sueltos en componentes.
4. Commits pequeños por fase, en una rama `feat/ios27-liquid-glass`.
5. Si algo de esta spec choca con el código existente, gana la funcionalidad existente; anota la duda en el PR.

---

## 1. Qué cambia en una línea

| Antes | Ahora (1A) |
|---|---|
| Fondo plano `#F7F6F3`, tarjetas blancas con borde | Fondo «malla» de color (manchas suaves del color del consultorio + durazno + lavanda) y **superficies de vidrio** translúcido con desenfoque |
| Barra lateral de 104 px en tablet | **Dock flotante abajo**: cápsula de navegación + buscador ancho + botón «+» redondo |
| Banner de prueba a todo el ancho | **Cápsula de vidrio arriba a la derecha** con prueba, «En línea» y avatar |
| Botones rectangulares radio 14 | Botones **cápsula / circulares** (radio total) |
| Saludo 28 px | **Saludo gigante** 58 px en dos líneas, nombre en color de marca |
| Lista «Recientes» en filas | **Tarjetas-póster** 3×2 con avatar degradado |
| Tarjeta lateral «Citas de hoy» | Fila superior: tarjeta **«Ahora»** (próxima cita con cuenta regresiva) + panel **«Hoy»** con cápsulas |
| Manrope | Tipografía del sistema de Apple (SF) con **Inter** de respaldo |

---

## 2. Tokens nuevos (`src/app/globals.css`)

### 2.1 Tipografía
- Instalar `@fontsource-variable/inter` y quitar `@fontsource-variable/manrope`.
- `--font-sans: -apple-system, BlinkMacSystemFont, "SF Pro Display", "Inter Variable", system-ui, sans-serif;`
- `letter-spacing` base del body: `-0.015em`.
- Escala:

| Estilo | Tamaño / peso / tracking | Uso |
|---|---|---|
| Hero | 58 / 800 / −0.055em, line-height 0.98 | Saludo de Inicio (tablet). Móvil: 40 |
| Display | 46 / 800 / −0.05em | Nombre en ficha (fase 2) |
| H2 | 22 / 800 / −0.03em | «Recientes», títulos de sección |
| Título tarjeta | 18 / 700 | «Hoy · 6 citas» |
| Nombre | 16 / 700 | Nombre en póster |
| Cuerpo | 15 / 600 | Textos de apoyo |
| Meta | 12.5–13 / 500, `tabular-nums` | HC · edad · celular |
| Etiqueta | 12 / 700, tracking 0.08em, MAYÚSCULAS | «AHORA · 16:00 CONTROL» |

### 2.2 Colores
- Se mantienen todos los semánticos (`alert`, `whatsapp`, estados de cita y tratamiento) y el sistema `.brand-scope`.
- Texto secundario sobre vidrio: `--color-ink-muted: #48484d` (contraste AA sobre vidrio al 55 %).
- Nuevos:
```css
--color-glass: rgb(255 255 255 / 0.62);
--color-glass-weak: rgb(255 255 255 / 0.30);
--color-glass-strong: rgb(255 255 255 / 0.80);
--color-fill: rgb(118 118 128 / 0.14);   /* chips neutros, "Sin celular" */
--color-ok-live: #34c759;                /* punto "En línea" */
```

### 2.3 Forma y sombra
```css
--radius-control: 9999px;   /* botones, campos, chips: cápsula */
--radius-card: 32px;        /* pósters, paneles */
--radius-panel: 34px;       /* tarjeta Ahora, panel Hoy */
--shadow-glass: inset 0 1px 0 rgb(255 255 255 / .95), inset 0 -1px 0 rgb(255 255 255 / .35), 0 12px 30px rgb(20 40 60 / .10);
--shadow-float: inset 0 1px 0 #fff, inset 0 -1px 0 rgb(255 255 255 / .4), 0 16px 40px rgb(20 40 60 / .18);
```

### 2.4 Utilidades de vidrio (en `@layer components`)
```css
.glass {
  background: linear-gradient(135deg, rgb(255 255 255 / .66), rgb(255 255 255 / .30));
  backdrop-filter: blur(30px) saturate(190%);
  -webkit-backdrop-filter: blur(30px) saturate(190%);
  box-shadow: var(--shadow-glass);
}
.glass-float { /* dock, cápsula superior, resultados flotantes */
  background: linear-gradient(135deg, rgb(255 255 255 / .78), rgb(255 255 255 / .40));
  backdrop-filter: blur(30px) saturate(190%);
  -webkit-backdrop-filter: blur(30px) saturate(190%);
  box-shadow: var(--shadow-float);
}
.glass-lens { /* tarjeta "Ahora": vidrio teñido con el color de marca */
  background: linear-gradient(145deg,
    color-mix(in oklab, var(--color-brand-700) 88%, white),
    color-mix(in oklab, var(--color-brand-700) 65%, black));
  color: #fff;
  box-shadow: inset 0 1px 0 rgb(255 255 255 / .45), inset 0 -1px 0 rgb(255 255 255 / .15),
              0 18px 40px color-mix(in oklab, var(--color-brand-700) 38%, transparent);
}

/* Fondo de la app (va en el AppShell, fijo detrás de todo) */
.app-backdrop {
  background:
    radial-gradient(640px 480px at 4% 0%,   color-mix(in oklab, var(--color-brand-700) 55%, transparent), transparent 68%),
    radial-gradient(560px 460px at 100% 6%, rgb(255 170 130 / .70), transparent 68%),
    radial-gradient(700px 520px at 60% 108%, rgb(140 160 255 / .55), transparent 68%),
    radial-gradient(500px 420px at 20% 80%, color-mix(in oklab, var(--color-brand-700) 30%, transparent), transparent 70%),
    #eceef0;
  background-attachment: fixed;
}

/* Accesibilidad y equipos lentos: vidrio → sólido */
@supports not ((backdrop-filter: blur(1px)) or (-webkit-backdrop-filter: blur(1px))) {
  .glass, .glass-float { background: rgb(255 255 255 / .94); }
}
@media (prefers-reduced-transparency: reduce), (prefers-contrast: more) {
  .glass, .glass-float { background: #fff; backdrop-filter: none; -webkit-backdrop-filter: none; }
  .app-backdrop { background: var(--color-bg); }
}
```
- Debe seguir funcionando con los 9 colores de consultorio (verde azulado, azul, turquesa, verde, morado, fucsia, rojo, dorado, gris): probar al menos verde azulado, morado y dorado en `/dev/inicio`.

### 2.5 Avatares con degradado
- `Avatar` acepta `tone` (0–5). El tono sale de un hash estable del `patient.id` (`src/lib/format.ts → avatarTone(id)`).
- Paleta (de claro a oscuro, 160°): `0` marca (`brand-500 → brand-700`), `1` `#8E8CFF → #5E5CE6`, `2` `#FF8FA8 → #C2416B`, `3` `#F5B041 → #A86A0C`, `4` `#B9B9BF → #6E6E73`, `5` `#6FB1FF → #2F6FD6`.
- Iniciales en blanco, 800, con `inset 0 1px 0 rgb(255 255 255/.5)` y sombra `0 6px 14px rgb(0 0 0/.12)`. Comprobar contraste AA de las iniciales; si un tono no llega, oscurecer el color final.

---

## 3. Componentes base (`src/components/ui`)

| Componente | Cambio |
|---|---|
| `button.tsx` | Todas las variantes con `rounded-full`. Tamaños: `sm` 44, `md` 52, `lg` 64, `icon` 52×52 círculo, nuevo `icon-sm` 48×48. `primary` = marca con `inset 0 1px 0 rgb(255 255 255/.35)` y sombra de color; `secondary` = `glass-strong` blanco 80 % sin borde visible; `whatsapp` igual, siempre `#13723F`. Foco visible intacto. |
| `input.tsx` / `field.tsx` | Campos cápsula 52–56 px, fondo `fill` o vidrio según contexto, sin borde duro; foco con anillo de 3 px de marca. |
| `card.tsx` | Variante `glass` (por defecto en la app) radio 32; mantener `solid` para diálogos y formularios largos. |
| `chip.tsx`, `segmented-control.tsx`, `tabs.tsx` | Cápsulas; seleccionado = fondo blanco con sombra suave (estilo iOS), no borde de color. |
| `dialog.tsx` | Hoja de vidrio `glass-float` radio 34 con «agarradera» de 40×5 arriba en móvil. |
| `toast.tsx` | Cápsula oscura `rgb(20 20 22/.86)` + blur, abajo al centro, **encima del dock** (bottom 108 px en tablet). |
| `pill.tsx` / `AlertPill` | Sin cambios de color (alerta roja siempre `#A3201A` sobre `#FDECEA`); quitar el borde y dejar radio total. |
| `skeleton.tsx` | Bloques `fill` con radio igual al del elemento que reemplazan. |

---

## 4. Shell de la app (afecta a todas las pantallas)

### 4.1 `AppShell`
- El contenedor raíz recibe `brand-scope app-backdrop`.
- Quitar `SideNav` y `TrialBanner` del flujo de layout. Se añaden:
  - `<TopCluster />`: cápsula `glass-float` fija arriba a la derecha (top 28, right 40 en tablet; dentro del encabezado en móvil).
  - `<Dock />`: fijo abajo (tablet ≥ 768 px) / `<BottomNav />` rediseñado (móvil).
- El área de contenido reserva espacio para el dock: `padding-bottom: 120px` en tablet, `112px + safe-area` en móvil.
- `OfflineBanner` pasa a ser una cápsula roja/ámbar flotante arriba al centro.

### 4.2 `TopCluster` (nuevo, `src/components/shared/top-cluster.tsx`)
Alto 56, padding 6, `glass-float`, radio total, gap 10. Contiene, en orden:
1. **Chip de prueba** (solo `plan === 'trial'`): «{n} días de prueba · **Activar**» 13.5/600, «Activar» en `brand-700` → mismo enlace de WhatsApp de ventas que hoy. Reemplaza a `TrialBanner` (conservar sus textos de 1 día / terminó).
2. **ConnectionIndicator**: punto verde 8 px con brillo (`box-shadow: 0 0 8px`) + «En línea» 12/700 `#1F7A3A`; sin conexión: punto `warn` + «Sin conexión».
3. **UserMenu**: avatar 44 círculo en color de marca con iniciales blancas; el menú desplegable pasa a `glass-float` radio 24.

### 4.3 `Dock` (nuevo, `src/components/shared/dock.tsx`) — tablet
Fijo `left: 40px; right: 40px; bottom: 20px; height: 68px`, fila con gap 12:
1. **Cápsula de navegación** `glass-float`, padding 6:
   - **Logo del consultorio** 44×44 (`ClinicLogo`, radio 14; si no hay logo, recuadro punteado «Tu logo»). Obligatorio por brief.
   - 3 pestañas de `NAV_ITEMS`, cada una 56 alto × padding 0 20, ícono 22 + etiqueta 11/600 debajo. Activa: fondo `brand-700` al 16 %, texto `brand-700` 700, ícono relleno.
2. **Buscador** cápsula `glass-float`, `flex: 1`, alto 68, padding 0 24, ícono lupa 22, texto 18, placeholder «Buscar por nombre, DNI o celular».
   - En Inicio es el input real de `HomeSearch` (misma lógica `?q=`, `usePatientSearch`).
   - En el resto de pantallas, al enfocar/escribir navega a `/?q=<texto>` manteniendo el foco.
   - Resultados (q ≥ 2): panel `glass-float` radio 32 que **sube desde el dock** (ancho = buscador, `max-height: 60vh`, scroll interno), con filas de paciente (§5.4) y al final «Crear paciente "<q>"». `Esc`, borrar o tocar fuera lo cierra.
3. **Botón «+»** círculo 68, color de marca, ícono + 28, sombra de color. Acción según ruta: Inicio y Pacientes → `/pacientes/nuevo`; Agenda → abre «Nueva cita» (`/agenda?nueva=1`); Ficha → «Nueva visita». `aria-label` acorde.

### 4.4 Móvil (< 768 px)
- `BottomNav`: cápsula `glass-float` flotante (`left/right 16, bottom: max(16px, safe-area)`, alto 64) con las 3 pestañas; a su derecha botón «+» de 64 (reemplaza el FAB actual de `HomeSearch`).
- El buscador vive **arriba** en Inicio (cápsula 56) debajo del saludo, no en el dock.
- `TopCluster` se integra en la fila superior de Inicio: logo 40 + nombre del consultorio + cápsula (prueba compacta «5 días» + avatar).

---

## 5. Pantalla Inicio (`/`) — detalle 1A

Contenedor: `padding: 28px 40px 120px` (tablet). Orden vertical:

### 5.1 Encabezado
- Línea 1: «{Lunes 26 de octubre} · {clinic.name}» 15/600 `ink-muted`.
- Hero (58/800): `{greeting(now)},` salto de línea `<span class="text-brand-700">{primer nombre}.</span>` → «Buenas tardes, / Lucía.». Usar el primer nombre de `displayName` sin título («Dra.»).
- A la derecha, alineado arriba: `TopCluster`.
- El botón «Nuevo paciente» del encabezado **se elimina** (lo cubre el «+» del dock).

### 5.2 Fila «Ahora + Hoy» (margin-top 24, alto 160, gap 16)

**`NextAppointmentCard`** (nuevo, `features/search/next-appointment-card.tsx`, client) — ancho 430, `glass-lens`, radio 34, padding 20×22:
- Selección: primera cita de hoy con estado `scheduled | confirmed` cuyo `ends_at > now` (orden por `starts_at`).
- Arriba izquierda: etiqueta «AHORA · {HH:MM} {MOTIVO}» (12/700, 85 % opacidad); nombre 24/700; debajo, alertas médicas del paciente (`MedicalAlerts compact`, píldora roja). Las alertas se obtienen en el servidor con `getPatientAlerts(patient_id)` (ya existe en `src/lib/data/patients.ts`) solo para esa cita; si no tiene ficha, sin píldora.
- Arriba derecha: cuenta regresiva grande (50/800, tracking −0.06em, tabular) + unidad 13/600 debajo:
  - `> 60 min` → «1 h 20»; `≤ 60` → «20 min»; si `starts_at ≤ now < ends_at` → «En curso». Se actualiza cada 30 s (`setInterval`, limpiar en unmount). Usar helpers de `src/lib/agenda.ts` (zona Lima).
- Abajo, 3 botones cápsula de 48: **Recordar** (WhatsApp verde con `reminderMessage(...)`, deshabilitado sin celular), **Atender** (`/pacientes/{id}/visitas/nueva?cita={citaId}`, mismo flujo que `appointment-detail.tsx`), **Ficha** (`/pacientes/{id}`). Botones secundarios: blanco 22 % con `inset 0 1px 0 rgb(255 255 255/.4)`, texto blanco. Sin ficha → «Crear su ficha» en lugar de Atender/Ficha.
- Estados vacíos (misma tarjeta, sin cuenta regresiva): «No tienes más citas hoy» + botón «Agendar» (`/agenda?nueva=1`). Si no hay ninguna cita hoy: «Día libre en la agenda» + «Agendar».

**`TodayStrip`** (reemplaza `TodayAppointmentsCard` en tablet) — `flex: 1`, `.glass`, radio 34, padding 16×18:
- Encabezado: «Hoy · {n} citas» (18/700, el contador en `ink-muted`) y enlace «Agenda ›» `brand-700`.
- Cuadrícula 3 columnas, gap 8, hasta 6 cápsulas de 44 de alto: punto de estado 8 px + hora 13.5/700 tabular + nombre 13.5/500 truncado + etiqueta de estado 11/700 en el color del punto (**punto + texto**, nunca solo color).
- Citas pasadas (`done`, `no_show`): texto `ink-muted`. La próxima cita: fondo blanco 95 % + anillo `0 0 0 2px brand-700`. `no_show` mantiene el tachado actual del nombre.
- Más de 6 → la 6.ª cápsula pasa a «+{n} más» y enlaza a la agenda. Cada cápsula enlaza a `/agenda?cita={id}`.

### 5.3 Recientes (margin-top 22)
- Encabezado: «Recientes» (22/800) a la izquierda; a la derecha, **cápsula punteada** «¿Historias en papel? **Te ayudamos**» (reemplaza `PaperRecordsNote` en tablet; mismo enlace de WhatsApp) y enlace «Ver todos» → `/pacientes`.
- Cuadrícula 3 columnas, gap 14, 6 pósters (`getRecentPatients(6)`).

### 5.4 `PatientPoster` (nuevo, `shared/patient-poster.tsx`)
- `.glass`, radio 32, alto 150, padding 16, columna con `justify-between`. **Toda la tarjeta enlaza a la ficha** (link principal con área sobre nombre/avatar; los botones no propagan el clic).
- Fila superior: avatar degradado 56 (§2.5) + nombre 16/700 truncado + meta 12.5 `ink-muted` tabular «HC 00248 · 47 años · 951 284 736» (sin celular: «Sin celular»).
- Fila inferior: `MedicalAlerts compact` (píldora 26, 12/700) · espacio · WhatsApp círculo 48 verde · Llamar círculo 48 blanco 80 %. Sin celular: en lugar de los botones, chip `fill` «Sin celular» (48 alto). Mantener `aria-label` «WhatsApp a {nombre}» / «Llamar a {nombre}».
- La misma pieza en versión fila (alto 72, avatar 48) se usa en los resultados flotantes del buscador y en la lista de Pacientes.

### 5.5 Estados de Inicio
- Sin pacientes: el área de Recientes muestra un póster ancho `.glass` con ícono en círculo, «Aún no hay pacientes», una línea, botón «Nuevo paciente» y la cápsula de historias en papel.
- Cargando (`loading.tsx`): esqueletos con la forma exacta (hero, tarjeta Ahora, panel Hoy, 6 pósters).
- Error: `ErrorState` dentro de un panel `.glass` con «Reintentar».

### 5.6 Inicio en móvil (390×844)
Columna única, padding 16: fila superior (logo + consultorio + cápsula) → hero 40 px → buscador cápsula 56 → tarjeta Ahora a todo el ancho (alto automático, botones apilados en fila que hace scroll si no caben) → «Hoy» como **carrusel horizontal** de cápsulas (scroll-snap) → Recientes en 1 columna (pósters de 132 de alto, botones WhatsApp/Llamar a la derecha) → tab bar flotante + «+».

---

## 6. Resto de pantallas (fase 2 — mismo lenguaje, misma función)

| Pantalla | Cambios de acabado |
|---|---|
| Pacientes `/pacientes` | Título 46/800; buscador cápsula; filas `PatientPoster` en versión fila sobre un panel `.glass`; papelera roja en círculo 48; paginación con cápsulas. |
| Ficha `/pacientes/[id]` | Encabezado tipo póster: avatar degradado 96, nombre 46/800, meta tabular, franja de alertas rojas grande; acciones como fila de botones circulares 64 con etiqueta debajo (WhatsApp, Llamar, Agendar, Nueva visita en color de marca, Editar). Pestañas = control segmentado cápsula de vidrio. Contenido de pestañas en paneles `.glass`. |
| Nuevo / editar paciente, Nueva visita | Formularios en tarjetas `solid` blancas (legibilidad) sobre el fondo malla; campos cápsula; interruptores estilo iOS (verde→marca). Barra de acciones Guardar/Cancelar flotante `glass-float` abajo (reemplaza al dock en estas rutas). El selector de piezas FDI mantiene su cuadrícula; seleccionado = círculo de marca. |
| Agenda | Encabezado con control segmentado cápsula Día/Semana/Mes; grilla sobre panel `.glass`; bloques de cita con radio 14 y fondo blanco 85 % + punto de estado; línea «ahora» naranja `#C2410C` con etiqueta de hora en cápsula. Detalle de cita = panel `glass-float` a la derecha (tablet) / hoja (móvil). |
| Login / Registro | Panel de marca = fondo malla a pantalla completa con frase grande; formulario dentro de una tarjeta `glass-float` radio 34. |
| Ajustes | Tarjetas `.glass`; selector de 9 colores con vista previa en vivo **del fondo malla y de una tarjeta Ahora** en miniatura. |
| Estados globales | Vacíos dentro de `.glass`; toast cápsula oscura; sin conexión = cápsula flotante arriba al centro. |

---

## 7. Accesibilidad y rendimiento (obligatorio)

- Contraste AA: texto principal `#1D1D1F`/`ink` sobre vidrio con opacidad ≥ 0.55; si una superficie baja de eso, el texto encima debe ser ≥ 16 px/600.
- Estados siempre **punto + texto**; alertas médicas siempre visibles en rojo.
- Objetivos táctiles ≥ 48 px (botones principales 52–68).
- `prefers-reduced-transparency` / `prefers-contrast: more` → superficies sólidas (§2.4). `prefers-reduced-motion` → sin animaciones de entrada del panel de resultados.
- Rendimiento en tablets Android de gama media: máx. ~12 elementos con `backdrop-filter` visibles a la vez; en listas largas (Pacientes > 20 filas) usar el panel contenedor como único vidrio y filas sin blur. Desenfoque máx. 30 px. Probar scroll a 60 fps en Chrome Android.
- Foco visible en todo (anillo 3 px de marca, offset 2).

---

## 8. Criterios de aceptación (Inicio + shell)

- [ ] En tablet no existe barra lateral; el dock flotante muestra logo del consultorio, 3 pestañas, buscador y «+», y no tapa contenido al final del scroll.
- [ ] El buscador del dock filtra en vivo por nombre, DNI o celular, conserva `?q=` y muestra «Crear paciente "<q>"» sin resultados.
- [ ] La tarjeta «Ahora» muestra la próxima cita real con cuenta regresiva que se actualiza sola, alertas del paciente y botones Recordar/Atender/Ficha funcionando; estados vacíos correctos.
- [ ] El panel «Hoy» muestra hasta 6 citas con punto + texto, resalta la próxima y enlaza a cada cita.
- [ ] 6 pósters de recientes con avatar degradado estable por paciente, alertas en rojo, WhatsApp/Llamar (deshabilitados sin celular).
- [ ] Cápsula de prueba gratis solo en plan `trial`; «En línea» refleja la conexión real.
- [ ] Se ve bien con los 9 colores de consultorio.
- [ ] Móvil 390×844: columna única, tab bar flotante y «+», nada se corta horizontalmente.
- [ ] Con «Reducir transparencia» activado, todo es sólido y legible.
- [ ] `typecheck`, `lint` y `test` pasan; tests actualizados para `TopCluster`, `Dock`, `NextAppointmentCard` (selección de cita y formato de cuenta regresiva) y `avatarTone`.

---

## 9. Plan por fases

1. **Tokens y utilidades** — §2 (globals.css, fuente Inter, avatarTone). Sin cambios visuales de layout aún.
2. **Componentes base** — §3 (button, input, card, chip, segmented, dialog, toast, pill, skeleton).
3. **Shell** — §4 (AppShell, TopCluster, Dock, BottomNav, OfflineBanner). Borrar `side-nav.tsx` y `trial-banner.tsx` cuando ya no se usen.
4. **Inicio** — §5 (NextAppointmentCard, TodayStrip, PatientPoster, resultados flotantes, estados, móvil). Actualizar `src/app/dev/fixtures.ts` con una cita «próxima» para revisar en `/dev/inicio`.
5. **Resto de pantallas** — §6, una pantalla por commit.
6. **Revisión final** — §7 y §8, capturas a 1180×820 y 390×844 de cada pantalla en `/dev/[screen]`.

---

## 10. Archivos

**Nuevos:** `src/components/shared/top-cluster.tsx`, `src/components/shared/dock.tsx`, `src/components/shared/patient-poster.tsx`, `src/components/features/search/next-appointment-card.tsx`, `src/components/features/search/today-strip.tsx`, `src/components/features/search/floating-results.tsx`.

**Modificados:** `src/app/globals.css`, `package.json`, `src/app/(app)/page.tsx`, `src/app/(app)/loading.tsx`, `src/components/shared/app-shell.tsx`, `bottom-nav.tsx`, `user-menu.tsx`, `connection-indicator.tsx`, `offline-banner.tsx`, `contact-actions.tsx` (variante `round`), `medical-alerts.tsx`, `paper-records-note.tsx` (variante `chip`), `src/components/ui/*` (§3), `src/components/features/search/home-header.tsx`, `home-search.tsx`, `recent-patients.tsx`, `src/lib/format.ts` (`avatarTone`, `firstName`), `src/app/dev/fixtures.ts`, `src/app/dev/[screen]/page.tsx`.

**A retirar al final:** `src/components/shared/side-nav.tsx`, `src/components/shared/trial-banner.tsx`, `src/components/features/search/today-appointments-card.tsx` (si ya no se usa en ningún lado).

**Docs:** actualizar `docs/specs/02-design-system.md` con un aviso arriba que remita a esta spec.
