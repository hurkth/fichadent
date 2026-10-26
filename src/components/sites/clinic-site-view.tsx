/* eslint-disable @next/next/no-img-element -- logo con URL firmada de Storage */
import Link from 'next/link';
import type { CSSProperties } from 'react';
import { Clock, MapPin, MessageCircle, Phone, TriangleAlert } from 'lucide-react';
import { JsonLd } from '@/components/marketing/json-ld';
import { LogoMark } from '@/components/ui/logo';
import { telUrl, whatsappUrl } from '@/lib/contact';
import type { PublicSite } from '@/lib/data/site';
import { formatPhone, formatSoles, nameInitials } from '@/lib/format';
import { SITE_URL } from '@/lib/site';

export function describeSite(site: PublicSite): string {
  const where = site.city ? ` en ${site.city}` : '';
  return site.headline
    ? `${site.headline}. ${site.name}${where}: agenda tu cita por WhatsApp.`
    : `${site.name}, consultorio dental${where}. Mira nuestros tratamientos${site.show_prices ? ' y precios' : ''} y agenda tu cita por WhatsApp.`;
}

/** Web pública del consultorio (Ajustes › Mi web). Liquid Glass con el color del consultorio. */
export function ClinicSiteView({ site }: { site: PublicSite }) {
  const wa = site.phone ? whatsappUrl(site.phone, `Hola, quiero agendar una cita en ${site.name}.`) : null;
  const categories = new Map<string, PublicSite['services']>();
  site.services.forEach((s) => categories.set(s.category, [...(categories.get(s.category) ?? []), s]));
  const url = `${SITE_URL}/consultorio/${site.slug}`;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Dentist',
    name: site.name,
    url,
    ...(site.logoUrl ? { image: site.logoUrl, logo: site.logoUrl } : {}),
    ...(site.phone ? { telephone: `+51${site.phone}` } : {}),
    ...(site.address ? { address: { '@type': 'PostalAddress', streetAddress: site.address, addressLocality: site.city ?? undefined, addressCountry: 'PE' } } : {}),
    ...(site.maps_url ? { hasMap: site.maps_url } : {}),
    ...(site.hours ? { openingHours: site.hours.split('\n').filter(Boolean) } : {}),
    priceRange: 'S/',
    description: describeSite(site),
    ...(site.show_prices && site.services.some((s) => s.price !== null)
      ? {
          makesOffer: site.services
            .filter((s) => s.price !== null)
            .map((s) => ({ '@type': 'Offer', price: s.price, priceCurrency: 'PEN', itemOffered: { '@type': 'Service', name: s.name } })),
        }
      : {}),
  };

  return (
    <div className="brand-scope app-backdrop min-h-dvh pb-28" style={{ '--brand': site.brand_color } as CSSProperties}>
      <JsonLd data={jsonLd} />

      <header className="mx-auto max-w-[1100px] px-4 pt-5 md:px-6">
        <div className="glass-float flex min-h-[68px] items-center justify-between gap-3 rounded-full py-2 pr-2 pl-2.5">
          <span className="flex min-w-0 items-center gap-3">
            {site.logoUrl ? (
              <img src={site.logoUrl} alt={`Logo de ${site.name}`} width={52} height={52} className="size-[52px] rounded-full bg-white object-contain" />
            ) : (
              <span aria-hidden className="flex size-[52px] items-center justify-center rounded-full bg-brand-700 text-lg font-extrabold text-white">
                {nameInitials(site.name)}
              </span>
            )}
            <span className="truncate text-[17px] font-extrabold tracking-[-0.02em]">{site.name}</span>
          </span>
          {wa ? (
            <a href={wa} target="_blank" rel="noopener noreferrer" className="flex min-h-[52px] shrink-0 items-center gap-2 rounded-full bg-whatsapp px-5 text-[15px] font-bold text-white no-underline">
              <MessageCircle className="size-5" aria-hidden />
              <span className="hidden sm:inline">Agendar cita</span>
              <span className="sm:hidden">WhatsApp</span>
            </a>
          ) : null}
        </div>
      </header>

      <main className="mx-auto flex max-w-[1100px] flex-col gap-6 px-4 pt-14 md:px-6">
        <section aria-labelledby="clinic-title" className="flex flex-col gap-5">
          <span className="inline-flex min-h-9 items-center gap-2 self-start rounded-full bg-white/60 px-3.5 text-[13.5px] font-bold text-brand-700 shadow-[inset_0_1px_0_#fff]">
            <span className="size-2 rounded-full bg-brand-700" />
            Consultorio dental{site.city ? ` en ${site.city}` : ''}
          </span>
          <h1 id="clinic-title" className="m-0 max-w-[860px] text-[clamp(38px,6vw,68px)] leading-none font-extrabold tracking-[-0.05em]">
            {site.headline ?? site.name}
          </h1>
          {site.headline ? <p className="m-0 text-xl font-bold text-brand-700">{site.name}</p> : null}
          <div className="flex flex-wrap gap-3">
            {wa ? (
              <a href={wa} target="_blank" rel="noopener noreferrer" className="flex min-h-[60px] items-center gap-2 rounded-full bg-whatsapp px-7 text-[17px] font-bold text-white no-underline shadow-[inset_0_1px_0_rgba(255,255,255,.3)]">
                <MessageCircle className="size-5" aria-hidden />
                Agendar por WhatsApp
              </a>
            ) : null}
            {site.phone ? (
              <a href={telUrl(site.phone)} className="glass-float flex min-h-[60px] items-center gap-2 rounded-full px-7 text-[17px] font-bold text-ink no-underline">
                <Phone className="size-5" aria-hidden />
                {formatPhone(site.phone)}
              </a>
            ) : null}
          </div>
        </section>

        <div className="grid gap-4 md:grid-cols-2">
          {site.address || site.maps_url ? (
            <section aria-label="Dirección" className="glass flex flex-col gap-2 rounded-[32px] p-6">
              <h2 className="m-0 flex items-center gap-2 text-lg font-extrabold">
                <MapPin className="size-5 text-brand-700" aria-hidden />
                Dónde estamos
              </h2>
              {site.address ? <p className="m-0 text-base font-semibold text-[#3A3A3F]">{site.address}</p> : null}
              {site.maps_url ? (
                <a href={site.maps_url} target="_blank" rel="noopener noreferrer" className="mt-1 inline-flex min-h-11 items-center self-start font-bold text-brand-700">
                  Ver en Google Maps ›
                </a>
              ) : null}
            </section>
          ) : null}
          {site.hours ? (
            <section aria-label="Horario" className="glass flex flex-col gap-2 rounded-[32px] p-6">
              <h2 className="m-0 flex items-center gap-2 text-lg font-extrabold">
                <Clock className="size-5 text-brand-700" aria-hidden />
                Horario
              </h2>
              <p className="m-0 text-base leading-relaxed font-semibold whitespace-pre-line text-[#3A3A3F]">{site.hours}</p>
            </section>
          ) : null}
        </div>

        {site.about ? (
          <section aria-labelledby="about-title" className="glass-lens rounded-[36px] p-8 md:p-10">
            <h2 id="about-title" className="m-0 mb-3 text-[clamp(26px,3vw,38px)] font-extrabold tracking-[-0.04em]">
              Sobre nosotros
            </h2>
            <p className="m-0 max-w-[760px] text-lg leading-relaxed whitespace-pre-line opacity-95">{site.about}</p>
          </section>
        ) : null}

        {site.services.length ? (
          <section aria-labelledby="services-title" className="flex flex-col gap-4 pt-6">
            <h2 id="services-title" className="m-0 text-[clamp(30px,4vw,48px)] font-extrabold tracking-[-0.045em]">
              Tratamientos{site.show_prices ? ' y precios' : ''}
            </h2>
            <div className="grid gap-4 md:grid-cols-2">
              {[...categories.entries()].map(([category, items]) => (
                <section key={category} aria-label={category} className="glass-soft rounded-[32px] p-5">
                  <h3 className="m-0 mb-2 text-[13px] font-extrabold tracking-[0.08em] text-ink-muted uppercase">{category}</h3>
                  <ul className="m-0 flex list-none flex-col p-0">
                    {items.map((s) => (
                      <li key={s.name} className="flex min-h-12 items-center justify-between gap-3 border-t border-black/5 py-2 first:border-0">
                        <span className="text-base font-semibold">{s.name}</span>
                        {s.price !== null ? (
                          <span className="shrink-0 text-base font-extrabold tabular">
                            {s.requires_tooth ? <span className="mr-1 text-xs font-semibold text-ink-muted">desde</span> : null}
                            {formatSoles(s.price)}
                          </span>
                        ) : null}
                      </li>
                    ))}
                  </ul>
                </section>
              ))}
            </div>
            {site.show_prices ? (
              <p className="m-0 flex items-start gap-2 text-sm font-semibold text-ink-muted">
                <TriangleAlert className="mt-0.5 size-4 shrink-0" aria-hidden />
                Precios referenciales por pieza o tratamiento. El precio final se confirma en la evaluación.
              </p>
            ) : null}
          </section>
        ) : null}
      </main>

      <footer className="mx-auto mt-16 flex max-w-[1100px] flex-col items-center gap-2 px-4 text-center text-[13.5px] text-ink-muted">
        <span>
          © {new Date().getFullYear()} {site.name}
        </span>
        <Link href="/" className="inline-flex items-center gap-1.5 font-semibold text-ink-muted no-underline">
          <LogoMark size={18} />
          Hecho con Fichadent
        </Link>
      </footer>

      {wa ? (
        <a
          href={wa}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`Escribir a ${site.name} por WhatsApp`}
          className="fixed right-5 bottom-[max(20px,env(safe-area-inset-bottom))] z-40 flex size-16 items-center justify-center rounded-full bg-whatsapp text-white shadow-[0_14px_30px_rgba(19,114,63,.35)] md:hidden"
        >
          <MessageCircle className="size-7" aria-hidden />
        </a>
      ) : null}
    </div>
  );
}
