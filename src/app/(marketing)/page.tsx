import type { Metadata } from 'next';
import Link from 'next/link';
import type { ReactNode } from 'react';
import { ArrowRight, CalendarDays, Check, FileStack, Lock, MessageCircle, Palette, Search, Smartphone, Tags, TriangleAlert } from 'lucide-react';
import { JsonLd } from '@/components/marketing/json-ld';
import { SIGNUP_HREF, isExternal, salesHref } from '@/components/marketing/links';
import { TabletMockup } from '@/components/marketing/tablet-mockup';
import { LANDING, WHATSAPP_MESSAGES } from '@/content/landing';
import { getLandingContent } from '@/lib/data/landing';
import { cn } from '@/lib/cn';
import { SALES_WHATSAPP } from '@/lib/constants';
import { formatSoles } from '@/lib/format';
import { SITE_URL } from '@/lib/site';

/** Se regenera cada 5 min (y al guardar en /admin/landing). */
export const revalidate = 300;

export async function generateMetadata(): Promise<Metadata> {
  const { seo } = await getLandingContent();
  return {
    title: { absolute: seo.title },
    description: seo.description,
    keywords: [...LANDING.keywords],
    alternates: { canonical: '/' },
    openGraph: { type: 'website', locale: 'es_PE', siteName: 'Fichadent', url: '/', title: seo.title, description: seo.description },
    twitter: { card: 'summary_large_image', title: seo.title, description: seo.description },
  };
}

/* ----------------------------------------------------------------- piezas */

const section = 'mx-auto w-full max-w-[1200px] px-4 md:px-6';
const h2 = 'm-0 text-[clamp(32px,4vw,52px)] leading-[1.05] font-extrabold tracking-[-0.045em]';
const eyebrow = 'text-[13px] font-extrabold tracking-[0.1em] text-brand-700';

function Cta({ href, children, variant = 'primary', className }: { href: string; children: ReactNode; variant?: 'primary' | 'glass' | 'whatsapp'; className?: string }) {
  const cls = cn(
    'inline-flex min-h-[60px] items-center justify-center gap-2 rounded-full px-7 text-[17px] font-bold no-underline transition-colors',
    variant === 'primary' && 'btn-glow bg-brand-700 text-white hover:bg-brand-900',
    variant === 'glass' && 'glass-float text-ink hover:bg-white',
    variant === 'whatsapp' && 'bg-whatsapp text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.3)] hover:brightness-110',
    className,
  );
  return isExternal(href) ? (
    <a href={href} target="_blank" rel="noopener noreferrer" className={cls}>
      {children}
    </a>
  ) : (
    <Link href={href} className={cls}>
      {children}
    </Link>
  );
}

function FeatureCard({ id, icon, iconClass, title, children }: { id?: string; icon: ReactNode; iconClass: string; title: string; children: ReactNode }) {
  return (
    <article id={id} className="glass-soft flex min-h-[280px] scroll-mt-28 flex-col gap-3 rounded-[36px] p-7">
      <span className={cn('flex size-[52px] items-center justify-center rounded-[18px]', iconClass)}>{icon}</span>
      <h3 className="m-0 text-2xl font-extrabold tracking-[-0.035em]">{title}</h3>
      <p className="m-0 text-base leading-normal text-[#3A3A3F]">{children}</p>
    </article>
  );
}

/* ----------------------------------------------------------------- página */

/** Landing pública (spec 04): presenta Fichadent a odontólogos que aún no lo usan. */
export default async function LandingPage() {
  const content = await getLandingContent();
  const { hero, plans, faqs, origin, finalCta } = content;
  const offers = plans.filter((p) => p.price !== null).map((p) => ({ '@type': 'Offer', name: p.name, price: p.price, priceCurrency: 'PEN' }));
  const jsonLd = [
    {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: 'Fichadent',
      url: SITE_URL,
      logo: `${SITE_URL}/icon.svg`,
      areaServed: 'PE',
      ...(SALES_WHATSAPP ? { contactPoint: { '@type': 'ContactPoint', telephone: `+51${SALES_WHATSAPP}`, contactType: 'sales', availableLanguage: 'es' } } : {}),
    },
    {
      '@context': 'https://schema.org',
      '@type': 'SoftwareApplication',
      name: 'Fichadent',
      applicationCategory: 'MedicalApplication',
      operatingSystem: 'Web, iOS, Android',
      inLanguage: 'es-PE',
      description: content.seo.description,
      url: SITE_URL,
      ...(offers.length ? { offers } : {}),
    },
    {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: faqs.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
    },
  ];

  return (
    <main>
      <JsonLd data={jsonLd} />

      {/* 1 · Hero */}
      <section aria-labelledby="hero-title" className={cn(section, 'flex flex-wrap items-center gap-12 pt-14 pb-10 md:pt-[72px]')}>
        <div className="flex min-w-0 flex-[1_1_460px] flex-col gap-[22px]">
          <span className="inline-flex min-h-9 items-center gap-2 self-start rounded-full bg-white/60 px-3.5 text-[13.5px] font-bold text-brand-700 shadow-[inset_0_1px_0_#fff]">
            <span className="size-2 rounded-full bg-brand-700" />
            {hero.eyebrow}
          </span>
          <h1 id="hero-title" className="m-0 text-[clamp(40px,5.6vw,72px)] leading-none font-extrabold tracking-[-0.05em]">
            {hero.titleStart} <span className="text-brand-700">{hero.titleHighlight}</span>
            {hero.titleEnd ? ` ${hero.titleEnd}` : null}
          </h1>
          <p className="m-0 max-w-[560px] text-xl leading-normal font-medium text-[#3A3A3F]">
            {hero.subtitle}
          </p>
          <div className="flex flex-wrap gap-3">
            <Cta href={SIGNUP_HREF}>
              {hero.primaryCta}
              <ArrowRight className="size-[18px]" aria-hidden />
            </Cta>
            <Cta href="#como-funciona" variant="glass">
              {hero.secondaryCta}
            </Cta>
          </div>
          <ul className="m-0 flex list-none flex-wrap gap-x-5 gap-y-2 p-0 text-[14.5px] font-semibold text-[#3A3A3F]">
            {hero.checks.map((t) => (
              <li key={t} className="flex items-center gap-1.5">
                <Check className="size-[18px] text-brand-700" strokeWidth={2.6} aria-hidden />
                {t}
              </li>
            ))}
          </ul>
        </div>
        <figure className="relative m-0 min-w-0 flex-[1_1_520px]">
          <TabletMockup />
          <figcaption className="glass-float absolute -bottom-[18px] left-0 flex min-h-[52px] items-center gap-2.5 rounded-full px-[18px] text-sm font-semibold">
            <span className="flex size-8 items-center justify-center rounded-full bg-whatsapp text-white">
              <MessageCircle className="size-4" aria-hidden />
            </span>
            Recordatorio listo para enviar por WhatsApp
          </figcaption>
        </figure>
      </section>

      {/* 2 · Beneficios rápidos */}
      <section aria-label="Lo que resuelve" className={cn(section, 'pt-12')}>
        <ul className="m-0 grid list-none grid-cols-[repeat(auto-fit,minmax(220px,1fr))] gap-3 p-0">
          {[
            { icon: <Search className="size-5 text-brand-700" aria-hidden />, t: 'Busca por nombre, DNI o celular' },
            { icon: <TriangleAlert className="size-5 text-alert" aria-hidden />, t: 'Alertas médicas siempre a la vista' },
            { icon: <MessageCircle className="size-5 text-whatsapp" aria-hidden />, t: 'WhatsApp con un toque' },
            { icon: <Smartphone className="size-5 text-brand-700" aria-hidden />, t: 'En tablet, celular o laptop' },
          ].map((b) => (
            <li key={b.t} className="flex min-h-16 items-center gap-2.5 rounded-full bg-white/55 px-5 text-[15px] font-bold shadow-[inset_0_1px_0_#fff]">
              {b.icon}
              {b.t}
            </li>
          ))}
        </ul>
      </section>

      {/* 3 · Antes / después */}
      <section aria-labelledby="antes-title" className={cn(section, 'pt-[110px]')}>
        <h2 id="antes-title" className={cn(h2, 'mb-3 max-w-[820px]')}>
          ¿Todavía buscas fichas en el archivador mientras el paciente espera?
        </h2>
        <p className="m-0 mb-8 max-w-[680px] text-lg leading-normal text-[#3A3A3F]">
          Las historias en papel se pierden, no se leen y no te avisan de una alergia. Fichadent ordena tu consultorio sin cambiar tu forma de atender.
        </p>
        <div className="grid grid-cols-[repeat(auto-fit,minmax(300px,1fr))] gap-4">
          <div className="flex flex-col gap-3.5 rounded-[34px] border-[1.5px] border-dashed border-black/25 bg-white/35 p-7">
            <h3 className="m-0 text-sm font-extrabold tracking-[0.08em] text-st-progress-fg">CON PAPEL</h3>
            <ul className="m-0 flex list-none flex-col gap-3 p-0 text-[17px] font-semibold text-[#3A3A3F]">
              <li>Buscar la ficha toma minutos</li>
              <li>La alergia está escrita en una página que nadie lee</li>
              <li>Copias el celular a mano para escribir por WhatsApp</li>
              <li>Los precios y la agenda viven en un cuaderno</li>
            </ul>
          </div>
          <div className="glass flex flex-col gap-3.5 rounded-[34px] p-7">
            <h3 className="m-0 text-sm font-extrabold tracking-[0.08em] text-brand-700">CON FICHADENT</h3>
            <ul className="m-0 flex list-none flex-col gap-3 p-0 text-[17px] font-bold">
              <li>Escribes 3 letras y aparece el paciente</li>
              <li>Alergias, embarazo y anticoagulantes en rojo, arriba de todo</li>
              <li>Un toque y se abre WhatsApp con el mensaje listo</li>
              <li>Tu agenda y tus precios en un solo lugar</li>
            </ul>
          </div>
        </div>
      </section>

      {/* 4 · Funciones */}
      <section id="funciones" aria-labelledby="funciones-title" className={cn(section, 'scroll-mt-24 pt-[110px]')}>
        <span className={eyebrow}>FUNCIONES</span>
        <h2 id="funciones-title" className={cn(h2, 'mt-2.5 mb-8 max-w-[820px]')}>
          Todo lo que tu consultorio dental necesita. Nada que no vayas a usar.
        </h2>
        <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,320px),1fr))] gap-4">
          <article id="historia-clinica" className="glass-lens col-span-full flex min-h-[300px] scroll-mt-28 flex-wrap items-center gap-7 rounded-[36px] p-8">
            <div className="flex flex-[1_1_280px] flex-col gap-3">
              <h3 className="m-0 text-[30px] leading-[1.1] font-extrabold tracking-[-0.04em]">Historia clínica odontológica digital</h3>
              <p className="m-0 text-[17px] leading-normal opacity-95">
                Datos personales, antecedentes médicos, visitas con tratamientos por pieza dental (sistema FDI), fotos y radiografías. Todo en la ficha de cada
                paciente.
              </p>
            </div>
            <div aria-hidden className="flex flex-[1_1_300px] flex-col gap-2.5 rounded-[26px] bg-white/15 p-[18px] shadow-[inset_0_1px_0_rgba(255,255,255,0.3)]">
              <div className="flex items-center gap-3">
                <span className="flex size-[52px] items-center justify-center rounded-full bg-[linear-gradient(160deg,#34C3B4,#0B5A54)] font-extrabold shadow-[inset_0_1px_0_rgba(255,255,255,0.5)]">RQ</span>
                <div>
                  <span className="block text-[17px] font-bold">Rosa Elvira Quispe Mamani</span>
                  <span className="block text-[13px] opacity-85">HC 00248 · 47 años · DNI 41827365</span>
                </div>
              </div>
              <div className="flex flex-wrap gap-1.5">
                <span className="rounded-full bg-alert-50 px-2.5 py-1 text-[12.5px] font-bold text-alert">Alergia: penicilina</span>
                <span className="rounded-full bg-alert-50 px-2.5 py-1 text-[12.5px] font-bold text-alert">Presión alta</span>
              </div>
              <div className="flex flex-wrap gap-1.5 text-[12.5px] font-bold">
                <span className="rounded-full bg-white/20 px-2.5 py-1.5">Resina · pieza 16 · {formatSoles(80)}</span>
                <span className="rounded-full bg-white/20 px-2.5 py-1.5">Endodoncia · 36 · En proceso</span>
              </div>
            </div>
          </article>

          <FeatureCard id="agenda" icon={<CalendarDays className="size-[26px]" aria-hidden />} iconClass="bg-brand-50 text-brand-700" title="Agenda para dentistas">
            Vista de día, semana y mes. Estados claros: programada, confirmada, atendida, no asistió. Tocas un espacio libre y agendas.
          </FeatureCard>
          <FeatureCard icon={<MessageCircle className="size-[26px]" aria-hidden />} iconClass="bg-ok-50 text-whatsapp" title="Recordatorios por WhatsApp">
            El mensaje de la cita ya viene escrito con fecha y hora. Lo revisas, tocas enviar y tu paciente confirma. Menos pacientes que no llegan.
          </FeatureCard>
          <FeatureCard icon={<TriangleAlert className="size-[26px]" aria-hidden />} iconClass="bg-alert-50 text-alert" title="Alertas médicas que no se pasan">
            Alergias, embarazo, diabetes, presión alta o anticoagulantes aparecen en rojo en cada lista y en la ficha. Antes de anestesiar, ya lo sabes.
          </FeatureCard>
          <FeatureCard icon={<Tags className="size-[26px]" aria-hidden />} iconClass="bg-st-progress-bg text-st-progress-fg" title="Tus precios, en cada visita">
            Pon el precio de cada intervención una vez. Al registrar la visita aparece solo, por pieza, con el total. Agrega las intervenciones que hagas.
          </FeatureCard>
          <FeatureCard icon={<Palette className="size-[26px]" aria-hidden />} iconClass="bg-[#EEEEFF] text-[#4B49C8]" title="Con tu logo, tu nombre y tu color">
            Sube el logo de tu consultorio, pon su nombre y elige tu color. Tus pacientes ven un consultorio moderno y ordenado.
          </FeatureCard>
          <FeatureCard icon={<Lock className="size-[26px]" aria-hidden />} iconClass="bg-brand-50 text-brand-700" title="Tus pacientes, solo tuyos">
            Cada doctor entra con su cuenta y solo ve a sus pacientes. Tus datos viajan cifrados y se guardan en la nube, no en una computadora que se puede
            malograr.
          </FeatureCard>
        </div>
      </section>

      {/* 5 · Cómo funciona */}
      <section id="como-funciona" aria-labelledby="pasos-title" className={cn(section, 'scroll-mt-24 pt-[110px]')}>
        <span className={eyebrow}>CÓMO FUNCIONA</span>
        <h2 id="pasos-title" className={cn(h2, 'mt-2.5 mb-8')}>
          Empieza hoy, entre paciente y paciente.
        </h2>
        <ol className="m-0 grid list-none grid-cols-[repeat(auto-fit,minmax(260px,1fr))] gap-4 p-0">
          {[
            ['Crea tu cuenta', 'Tu nombre, tu consultorio, tu celular y listo. Sin tarjeta y con 5 días gratis.'],
            ['Carga tus pacientes y precios', 'Regístralos mientras atiendes y pon tus precios. Si tienes historias en papel, te ayudamos a pasarlas.'],
            ['Atiende y agenda', 'Busca, registra la visita y recuerda la próxima cita por WhatsApp. Desde la tablet o el celular.'],
          ].map(([title, text], i) => (
            <li key={title} className="flex flex-col gap-2.5 rounded-[34px] bg-white/55 p-[26px] shadow-[inset_0_1px_0_#fff]">
              <span className="text-[56px] leading-none font-extrabold tracking-[-0.06em] text-brand-700 tabular">{i + 1}</span>
              <h3 className="m-0 text-[22px] font-extrabold tracking-[-0.03em]">{title}</h3>
              <p className="m-0 text-base leading-normal text-[#3A3A3F]">{text}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* 6 · Historias en papel */}
      <section aria-labelledby="papel-title" className={cn(section, 'pt-20')}>
        <div className="flex flex-wrap items-center justify-between gap-6 rounded-[40px] border-[1.5px] border-dashed border-black/25 bg-white/35 p-7 md:p-9">
          <div className="flex flex-[1_1_420px] items-start gap-[18px]">
            <span className="flex size-[60px] shrink-0 items-center justify-center rounded-[20px] bg-brand-50 text-brand-700">
              <FileStack className="size-7" aria-hidden />
            </span>
            <div>
              <h2 id="papel-title" className="m-0 mb-1.5 text-[28px] font-extrabold tracking-[-0.04em]">
                ¿Tienes cientos de historias en papel?
              </h2>
              <p className="m-0 text-[17px] leading-normal text-[#3A3A3F]">Tú sigues atendiendo. Nuestro equipo las pasa a Fichadent por ti.</p>
            </div>
          </div>
          <Cta href={salesHref(WHATSAPP_MESSAGES.paper)} variant="whatsapp">
            <MessageCircle className="size-5" aria-hidden />
            Quiero ayuda por WhatsApp
          </Cta>
        </div>
      </section>

      {/* 7 · Precios */}
      <section id="precios" aria-labelledby="precios-title" className={cn(section, 'scroll-mt-24 pt-[110px]')}>
        <div className="mb-8 text-center">
          <span className={eyebrow}>PRECIOS</span>
          <h2 id="precios-title" className={cn(h2, 'mt-2.5 mb-2.5')}>
            {content.plansTitle}
          </h2>
          <p className="m-0 text-lg text-[#3A3A3F]">{content.plansSubtitle}</p>
        </div>
        <div className="mx-auto grid max-w-[880px] grid-cols-[repeat(auto-fit,minmax(min(100%,320px),1fr))] gap-4">
          {plans.map((p) => (
            <article
              key={p.id}
              className={cn('flex flex-col gap-4 rounded-[38px] p-8', p.featured ? 'glass ring-2 ring-brand-700' : 'glass-soft')}
            >
              <div className="flex items-center justify-between gap-2">
                <h3 className="m-0 text-[22px] font-extrabold">{p.name}</h3>
                {p.featured ? <span className="rounded-full bg-brand-50 px-3 py-1.5 text-[12.5px] font-extrabold text-brand-700">Más elegido</span> : null}
              </div>
              <p className="m-0 flex items-baseline gap-1.5">
                {p.price !== null ? (
                  <>
                    <span className="text-[54px] font-extrabold tracking-[-0.05em] tabular">{formatSoles(p.price)}</span>
                    <span className="text-base font-semibold text-ink-muted">al mes</span>
                  </>
                ) : (
                  <span className="text-[40px] font-extrabold tracking-[-0.045em]">Consúltanos</span>
                )}
              </p>
              <ul className="m-0 flex list-none flex-col gap-2.5 p-0 text-base font-semibold">
                {p.features.map((f) => (
                  <li key={f} className="flex items-start gap-2">
                    <Check className="mt-0.5 size-5 shrink-0 text-brand-700" strokeWidth={2.6} aria-hidden />
                    {f}
                  </li>
                ))}
              </ul>
              <Cta
                href={p.cta.kind === 'signup' ? SIGNUP_HREF : salesHref(WHATSAPP_MESSAGES.web)}
                variant={p.cta.kind === 'signup' ? 'primary' : 'glass'}
                className="mt-auto w-full"
              >
                {p.cta.label}
              </Cta>
            </article>
          ))}
        </div>
      </section>

      {/* 8 · Origen */}
      <section aria-labelledby="origen-title" className={cn(section, 'pt-[110px]')}>
        <div className="glass-lens flex flex-wrap items-center gap-8 rounded-[40px] p-8 md:p-12">
          <div className="flex-[1_1_460px]">
            <span className="text-[13px] font-extrabold tracking-[0.1em] opacity-85">{origin.eyebrow}</span>
            <h2 id="origen-title" className="m-0 mt-2.5 mb-3 text-[clamp(28px,3.4vw,44px)] leading-[1.08] font-extrabold tracking-[-0.045em]">
              {origin.title}
            </h2>
            <p className="m-0 text-lg leading-normal opacity-95">{origin.text}</p>
          </div>
          <ul className="m-0 flex flex-[1_1_300px] list-none flex-col gap-2.5 p-0">
            {origin.bullets.map((t) => (
              <li key={t} className="flex min-h-14 items-center rounded-full bg-white/15 px-5 text-base font-bold shadow-[inset_0_1px_0_rgba(255,255,255,0.3)]">
                {t}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* 9 · Preguntas frecuentes */}
      <section id="preguntas" aria-labelledby="faq-title" className="mx-auto w-full max-w-[880px] scroll-mt-24 px-4 pt-[110px] md:px-6">
        <h2 id="faq-title" className={cn(h2, 'mb-6 text-center')}>
          Preguntas frecuentes
        </h2>
        <div className="flex flex-col gap-2.5">
          {faqs.map((f) => (
            <details key={f.q} className="group glass-soft rounded-[28px] px-6">
              <summary className="flex min-h-[68px] cursor-pointer list-none items-center justify-between gap-4 text-lg font-bold [&::-webkit-details-marker]:hidden">
                {f.q}
                <span aria-hidden className="flex size-9 shrink-0 items-center justify-center rounded-full bg-black/5 text-xl font-semibold transition-transform group-open:rotate-45">
                  +
                </span>
              </summary>
              <p className="m-0 mb-[22px] text-[16.5px] leading-[1.55] text-[#3A3A3F]">{f.a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* 10 · CTA final */}
      <section aria-labelledby="cta-title" className={cn(section, 'pt-[110px] text-center')}>
        <h2 id="cta-title" className="m-0 mx-auto mb-3.5 max-w-[860px] text-[clamp(36px,5vw,64px)] leading-none font-extrabold tracking-[-0.05em]">
          {finalCta.titleStart} <span className="text-brand-700">{finalCta.titleHighlight}</span>
        </h2>
        <p className="m-0 mb-7 text-[19px] text-[#3A3A3F]">{finalCta.subtitle}</p>
        <div className="flex flex-wrap justify-center gap-3">
          <Cta href={SIGNUP_HREF} className="min-h-16 px-8 text-lg">
            Crear mi cuenta gratis
          </Cta>
          <Cta href={salesHref(WHATSAPP_MESSAGES.general)} variant="glass" className="min-h-16 text-lg text-whatsapp">
            <MessageCircle className="size-5" aria-hidden />
            Escríbenos
          </Cta>
        </div>
      </section>
    </main>
  );
}
