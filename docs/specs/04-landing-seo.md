# Spec 04 · Landing pública + SEO

> Fuente visual: `design/screens/20-landing.dc.html` (artboard «Landing pública · fichadent.com» del canvas, página fluida, ancho de diseño 1440).
> Estilo: el mismo lenguaje iOS 27 Liquid Glass de `03-rediseno-ios27.md` (tokens `.glass`, `.glass-float`, `.glass-lens`, `.app-backdrop`). **Implementar después de la fase 1 de la spec 03** (tokens), porque los reutiliza.
> Objetivo: que un odontólogo que busca en Google «software dental», «historia clínica odontológica» o «agenda para dentistas» llegue, entienda el producto en 5 segundos y se registre en la prueba gratis.

---

## 0. Cómo trabajar (para Claude Code)

1. Lee esta spec, la `03` y el archivo de diseño antes de tocar código.
2. Rama: `feat/ios27-liquid-glass` (la misma del rediseño). Commits pequeños por fase (§9).
3. Al cerrar cada fase: `npm run typecheck && npm run lint && npm test` y revisa `/` a 1440, 1024, 768 y 390 px sin sesión iniciada.
4. Mide con Lighthouse (móvil) al final: objetivos en §7.

---

## 1. Rutas (cambio importante)

Hoy la app autenticada vive en `/`. La landing pasa a ser `/` y **la app se mueve a `/inicio`**.

| Ruta | Antes | Ahora |
|---|---|---|
| `/` | Inicio de la app (requiere sesión) | **Landing pública** (`src/app/(marketing)/page.tsx`) |
| `/inicio` | — | Inicio de la app (mover `src/app/(app)/page.tsx` → `src/app/(app)/inicio/page.tsx`) |
| `/precios`, `/software-dental`, `/historia-clinica-odontologica`, `/agenda-para-dentistas` | — | Páginas públicas (fase 3) |
| `/software-dental/[ciudad]` | — | Páginas locales: lima, arequipa, puno, cusco, trujillo (fase 3) |
| `/blog`, `/blog/[slug]` | — | Blog en MDX (fase 4) |
| `/privacidad`, `/terminos` | — | Páginas legales públicas |

Cambios que esto obliga:
- `src/lib/supabase/middleware.ts`: `PUBLIC_PATHS` agrega `/` (coincidencia **exacta**), `/precios`, `/software-dental`, `/historia-clinica-odontologica`, `/agenda-para-dentistas`, `/blog`, `/privacidad`, `/terminos`, `/sitemap.xml`, `/robots.txt`, `/opengraph-image`. Con sesión iniciada, `/`, `/login` y `/registro` redirigen a `/inicio` (en `/` mantener un enlace «Entrar a mi consultorio» por si se quiere ver la landing; decidir: redirigir es lo recomendado).
- Todo `redirect('/')` / `href="/"` de la app → `/inicio`: `src/lib/actions/auth.ts` (líneas con `redirect('/')`), `nav-items.ts` (`href: '/inicio'`, `match: p === '/inicio'`), `side-nav.tsx` o el nuevo `dock.tsx`, `src/app/not-found.tsx`, `ajustes/page.tsx` (back), `pacientes/[id]/not-found.tsx`. Buscar con `grep -rn "'/'\|\"/\"" src`.
- El buscador conserva `?q=`, ahora en `/inicio?q=`. El dock (spec 03 §4.3) navega a `/inicio?q=`.
- Tests que asuman `/` como inicio de la app: actualizar.

Estructura de carpetas:
```
src/app/(marketing)/layout.tsx      ← fondo malla, nav pública, footer; SIN AppShell ni Supabase
src/app/(marketing)/page.tsx        ← landing
src/components/marketing/*          ← secciones (una por archivo)
src/content/landing.ts              ← textos, FAQ, planes, ciudades (una sola fuente para página + schema)
```
La landing es **100 % estática** (Server Components, `export const dynamic = 'force-static'`), sin llamadas a Supabase, para que cargue rápido y Google la indexe completa.

---

## 2. Metadatos y SEO técnico

### 2.1 Root layout
`src/app/layout.tsx` hoy tiene `robots: { index: false }` para toda la app. Cambiar:
- Root: `metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? 'https://fichadent.com')`, sin `robots` global.
- `src/app/(app)/layout.tsx` y `src/app/(auth)/layout.tsx`: `export const metadata = { robots: { index: false, follow: false } }` (la app y el login **no** se indexan).
- `src/app/(marketing)/layout.tsx`: indexable.
- Agregar `NEXT_PUBLIC_SITE_URL` a `.env.example`.

### 2.2 Landing (`/`)
```ts
export const metadata: Metadata = {
  title: { absolute: 'Software dental en Perú · Historia clínica y agenda | Fichadent' },
  description: 'Historia clínica odontológica y agenda para tu consultorio. Busca pacientes, ve alertas médicas y recuerda citas por WhatsApp. Prueba gratis 5 días.',
  alternates: { canonical: '/' },
  openGraph: { type: 'website', locale: 'es_PE', siteName: 'Fichadent', url: '/', title: '…mismo título…', description: '…misma descripción…' },
  twitter: { card: 'summary_large_image' },
  keywords: ['software dental', 'software odontológico', 'historia clínica odontológica', 'agenda para dentistas', 'programa para consultorio dental', 'software dental Perú'],
};
```
- `src/app/(marketing)/opengraph-image.tsx` con `ImageResponse` 1200×630: fondo malla, logo, titular «Historia clínica y agenda para tu consultorio dental» y la tablet en miniatura (simplificada).
- `<html lang="es-PE">` ya está; mantener.

### 2.3 Archivos de rastreo
- `src/app/sitemap.ts`: `/`, `/precios`, las 3 páginas de función, las 5 ciudades, `/blog` y cada post, `/privacidad`, `/terminos`. Con `lastModified` y `changeFrequency`.
- `src/app/robots.ts`: `allow: '/'`, `disallow: ['/inicio', '/pacientes', '/agenda', '/ajustes', '/login', '/registro', '/reset-password', '/auth', '/dev']`, `sitemap: ${SITE_URL}/sitemap.xml`.
- `src/app/manifest.ts` (PWA): `name: 'Fichadent'`, `start_url: '/inicio'`, `display: 'standalone'`, `theme_color` = marca, íconos 192/512.

### 2.4 Datos estructurados (JSON-LD)
Un componente `JsonLd` que imprime `<script type="application/ld+json">`. En la landing, tres objetos generados desde `src/content/landing.ts`:
- `Organization`: nombre, url, logo, `areaServed: 'PE'`, `contactPoint` con WhatsApp de ventas (`SALES_WHATSAPP`).
- `SoftwareApplication`: `name: 'Fichadent'`, `applicationCategory: 'MedicalApplication'`, `operatingSystem: 'Web, iOS, Android'`, `inLanguage: 'es-PE'`, `offers` con cada plan (`priceCurrency: 'PEN'`, `price` desde el contenido; **no publicar `offers` mientras el precio sea `[PRECIO]`**).
- `FAQPage`: las 6 preguntas de §4.9, el mismo texto que se ve en pantalla.

### 2.5 Palabras clave por página
| Página | Palabra clave principal | Secundarias |
|---|---|---|
| `/` | software dental | software odontológico Perú, programa para consultorio dental |
| `/historia-clinica-odontologica` | historia clínica odontológica digital | ficha odontológica, historia clínica dental |
| `/agenda-para-dentistas` | agenda para dentistas | agenda odontológica, citas dentales WhatsApp |
| `/software-dental` | software para consultorio dental | sistema para dentistas |
| `/software-dental/[ciudad]` | software dental en {Ciudad} | programa para dentistas {Ciudad} |
| `/precios` | precio software dental | — |

Regla: una sola `<h1>` por página con la palabra clave principal; `<h2>` con variaciones naturales; nada de relleno de palabras clave.

---

## 3. Layout público

- **Fondo:** `.app-backdrop` versión landing (más manchas a lo largo del alto: ver `bg` en el archivo de diseño), color de marca **fijo de Fichadent** `#0F766E` (aquí no hay consultorio).
- **Contenedor:** `max-width: 1200px; margin: 0 auto; padding-inline: 24px`. Secciones separadas 110 px (64 en móvil).
- **Tipografía:** la de la spec 03 (SF / Inter). Títulos de sección `clamp(32px, 4vw, 52px)`/800/−0.045em; H1 `clamp(40px, 5.6vw, 72px)`/800/−0.05em; cuerpo 16–20 px; línea 1.5.
- **Nav pública** (`components/marketing/site-nav.tsx`): cápsula `.glass-float` de 68 px, logo Fichadent (isotipo muela 40×40 en marca + palabra 19/800), enlaces ancla (Funciones, Cómo funciona, Precios, Preguntas) + Blog, «Iniciar sesión» (texto) y «Prueba gratis» (botón marca). Se vuelve **sticky** al hacer scroll (top 12 px). Móvil: logo + «Prueba gratis» + botón menú que abre hoja de vidrio con los enlaces.
- **Botones:** cápsulas de 60 px (64 en el CTA final); primario marca con sombra de color; secundario vidrio blanco.

---

## 4. Secciones (en orden; textos exactos en el archivo de diseño)

1. **Hero** (`hero.tsx`) — dos columnas que se apilan < 980 px.
   - Etiqueta: «Hecho en Perú para odontólogos independientes».
   - H1: «Software dental para tu consultorio: **historia clínica y agenda** en tu tablet.» (lo resaltado en `brand-700`).
   - Bajada 20 px, CTA «Prueba gratis 5 días →» (`/registro`) y «Ver cómo funciona» (`#como-funciona`).
   - Checks: Sin tarjeta · Sin instalar nada · Te ayudamos con tus historias en papel.
   - Visual: tablet con la pantalla de Inicio 1A. **Usar una imagen real** (captura de `/dev/inicio` a 1180×820 exportada a AVIF/WebP, `next/image` con `priority` y `sizes`), no HTML recreado. Cápsula flotante encima: «Recordatorio listo para enviar por WhatsApp».
2. **Beneficios rápidos** — 4 cápsulas: buscar por nombre/DNI/celular · alertas médicas · WhatsApp con un toque · tablet, celular o laptop.
3. **Antes / después** — H2 «¿Todavía buscas fichas en el archivador mientras el paciente espera?», tarjeta punteada «CON PAPEL» vs tarjeta vidrio «CON FICHADENT».
4. **Funciones** (`#funciones`) — mosaico: tarjeta ancha `.glass-lens` «Historia clínica odontológica digital» con mini ficha; 5 tarjetas vidrio: Agenda para dentistas · Recordatorios por WhatsApp · Alertas médicas · Con tu logo y tu color · Tus pacientes, solo tuyos. Cada título enlaza a su página de función (fase 3).
5. **Cómo funciona** (`#como-funciona`) — 3 pasos numerados (`<ol>`).
6. **Historias en papel** — banda punteada con botón WhatsApp verde (mensaje prellenado: «Hola, tengo historias en papel y quiero ayuda para digitalizarlas en Fichadent.»).
7. **Precios** (`#precios`) — 2 planes: «Consultorio» (destacado, anillo de marca, «Más elegido») y «Consultorio + página web». Precios desde `src/content/landing.ts`; mientras valgan `null` mostrar «Consúltanos» y ocultar `offers` del JSON-LD.
8. **Origen** — banda `.glass-lens`: «Hecho en Puno, junto a una odontóloga que atiende sola.» + 3 cápsulas (soporte por WhatsApp, consultorios pequeños, pagos en soles). **No inventar testimonios ni cifras**; cuando haya testimonios reales con permiso, agregar sección aparte.
9. **Preguntas frecuentes** (`#preguntas`) — 6 `<details>/<summary>` nativos (accesibles sin JS). Mismo contenido que el `FAQPage`.
10. **CTA final** — «Tu consultorio ordenado **desde hoy.**» + «Crear mi cuenta gratis» y «Escríbenos» (WhatsApp).
11. **Footer** — 4 columnas: marca · Producto · Ciudades · Recursos (Blog, Plantilla de historia clínica dental, Privacidad, Términos). Los enlaces de ciudades y funciones son internos (ayudan al SEO).

Eventos de conversión (fase 2): `cta_prueba_gratis` (con `ubicacion`: hero/precios/final), `cta_whatsapp`, `faq_abierta`. Con Vercel Analytics o Plausible; sin cookies de terceros.

---

## 5. Páginas de función y por ciudad (fase 3)

- Plantilla común `components/marketing/feature-page.tsx`: hero corto con H1 de la palabra clave, 3–4 bloques de contenido **útil y distinto** (no copiar la landing), captura real, FAQ propia (3 preguntas, con `FAQPage`), CTA.
- Ciudades: `generateStaticParams` con `['lima','arequipa','puno','cusco','trujillo']`. H1 «Software dental en {Ciudad}». Cada una con un párrafo propio (contexto local real: soporte por WhatsApp, horario Perú, pagos en soles) para evitar contenido duplicado; `canonical` propio.
- Breadcrumbs visibles + `BreadcrumbList` JSON-LD.

## 6. Blog (fase 4)
- MDX en `src/content/blog/*.mdx` con frontmatter (`title`, `description`, `date`, `keywords`).
- Plantilla con `Article` JSON-LD, índice, enlaces internos a las páginas de función y CTA al final.
- Primeros temas sugeridos: «Cómo digitalizar las historias clínicas de tu consultorio dental», «Plantilla de historia clínica odontológica (descargable)», «Cómo reducir las inasistencias con recordatorios por WhatsApp», «Qué debe tener una historia clínica dental en Perú».

---

## 7. Rendimiento y accesibilidad

- Lighthouse móvil: **Performance ≥ 90, SEO = 100, Accessibility ≥ 95, Best Practices ≥ 95**. LCP < 2.5 s (la imagen del hero), CLS < 0.05.
- `backdrop-filter` solo en elementos fijos/visibles (nav, tarjetas del primer pantallazo); en el resto de tarjetas usar el fondo translúcido **sin blur** si Lighthouse marca problemas en móvil.
- Imágenes con `next/image`, AVIF/WebP, `alt` descriptivo («Pantalla de inicio de Fichadent en una tablet con la próxima cita y pacientes recientes»).
- Fuentes: Inter vía `next/font` (sin bloqueo de render); SF del sistema en Apple.
- Contraste AA en todo el texto sobre vidrio; foco visible; `prefers-reduced-transparency` y `prefers-reduced-motion` respetados (spec 03 §2.4).
- Sin layout horizontal en 390 px: tarjetas en una columna, la tarjeta ancha de funciones ocupa toda la fila (`grid-column: 1 / -1`).

---

## 8. Criterios de aceptación

- [ ] Sin sesión, `/` muestra la landing; con sesión, redirige a `/inicio`.
- [ ] La app completa funciona en `/inicio` y ningún enlace interno apunta a `/` como inicio de la app.
- [ ] `/login`, `/registro` y la app llevan `noindex`; la landing y las páginas públicas son indexables.
- [ ] `/sitemap.xml` y `/robots.txt` responden y son válidos.
- [ ] El JSON-LD pasa la [Prueba de resultados enriquecidos](https://search.google.com/test/rich-results) (FAQ y SoftwareApplication).
- [ ] Imagen Open Graph se ve al compartir el enlace en WhatsApp.
- [ ] Todos los CTA «Prueba gratis» llevan a `/registro`; los de WhatsApp abren `wa.me` con mensaje prellenado.
- [ ] Lighthouse móvil cumple §7.
- [ ] Sin scroll horizontal a 390 px.

---

## 9. Plan por fases

1. **Rutas** — mover la app a `/inicio`, middleware, redirecciones, `noindex` en app/auth, enlaces internos, tests.
2. **Landing** — layout de marketing, secciones §4, contenido en `src/content/landing.ts`, metadatos, OG image, JSON-LD, sitemap, robots, manifest, eventos.
3. **Páginas de función y ciudades** — §5.
4. **Blog** — §6.
5. **Revisión** — §7 y §8 con capturas a 1440 y 390.

---

## 10. Pendientes del negocio (no inventar; dejar configurables)
- Precios de los 2 planes (`null` hasta definir).
- Dominio final (`NEXT_PUBLIC_SITE_URL`).
- Número de WhatsApp de ventas (`SALES_WHATSAPP`, ya existe).
- Confirmar texto de seguridad («cifrado y en la nube») con la configuración real de Supabase.
- Testimonios reales con permiso escrito.
