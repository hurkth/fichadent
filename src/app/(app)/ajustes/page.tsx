import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { PageHeader } from '@/components/shared/page-header';
import { ClinicSettingsForm } from '@/components/features/settings/clinic-settings-form';
import { ClinicSiteForm } from '@/components/features/settings/clinic-site-form';
import { ServicePricesForm } from '@/components/features/settings/service-prices-form';
import { cn } from '@/lib/cn';
import { getServiceSettings } from '@/lib/data/catalogs';
import { getSession } from '@/lib/data/session';
import { getMySite } from '@/lib/data/site';
import { SITE_URL } from '@/lib/site';

export const metadata: Metadata = { title: 'Ajustes' };

const SECTIONS = [
  { value: 'consultorio', label: 'Consultorio', hint: 'Nombre, logo y color' },
  { value: 'precios', label: 'Precios', hint: 'Tus intervenciones' },
  { value: 'web', label: 'Mi web', hint: 'Tu página pública' },
] as const;

/** Ajustes del consultorio: datos, logo y color · precios de intervenciones. */
export default async function SettingsPage({ searchParams }: { searchParams: Promise<{ seccion?: string }> }) {
  const session = await getSession();
  if (!session) redirect('/auth/signout');
  const { seccion } = await searchParams;
  const current = seccion === 'precios' || seccion === 'web' ? seccion : 'consultorio';
  const services = current === 'precios' ? await getServiceSettings() : [];
  const site = current === 'web' ? await getMySite() : null;

  return (
    <main className="flex flex-1 flex-col">
      <PageHeader title="Ajustes del consultorio" subtitle="Personaliza Fichadent a tu consultorio." back={{ href: '/inicio', label: 'Inicio' }}>
        <nav aria-label="Secciones de ajustes" className="mt-2 flex gap-1 self-start rounded-full bg-fill p-1">
          {SECTIONS.map((s) => {
            const on = s.value === current;
            return (
              <Link
                key={s.value}
                href={s.value === 'consultorio' ? '/ajustes' : `/ajustes?seccion=${s.value}`}
                aria-current={on ? 'page' : undefined}
                className={cn(
                  'flex min-h-11 items-center rounded-full px-5 text-[15px] no-underline',
                  on ? 'bg-surface font-extrabold text-ink shadow-[0_2px_8px_rgba(0,0,0,.08)]' : 'font-semibold text-ink-muted hover:text-ink',
                )}
              >
                {s.label}
              </Link>
            );
          })}
        </nav>
      </PageHeader>
      {current === 'precios' ? (
        <ServicePricesForm services={services} />
      ) : current === 'web' ? (
        <ClinicSiteForm session={session} site={site} siteUrl={SITE_URL} />
      ) : (
        <ClinicSettingsForm session={session} />
      )}
    </main>
  );
}
