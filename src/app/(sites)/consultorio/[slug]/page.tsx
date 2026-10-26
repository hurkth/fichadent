import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ClinicSiteView, describeSite } from '@/components/sites/clinic-site-view';
import { getPublicSite } from '@/lib/data/site';

/** Se regenera cada 10 min y al guardar en Ajustes › Mi web. */
export const revalidate = 600;

/** Se generan bajo demanda en la primera visita y quedan en caché (ISR). */
export function generateStaticParams() {
  return [];
}

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const site = await getPublicSite(slug);
  if (!site) return { title: 'Consultorio no encontrado', robots: { index: false } };
  const title = `${site.name} · Dentista${site.city ? ` en ${site.city}` : ''}`;
  return {
    title: { absolute: title },
    description: describeSite(site),
    alternates: { canonical: `/consultorio/${site.slug}` },
    openGraph: {
      type: 'website',
      locale: 'es_PE',
      siteName: site.name,
      title,
      description: describeSite(site),
      url: `/consultorio/${site.slug}`,
      images: site.logoUrl ? [site.logoUrl] : undefined,
    },
  };
}

/** Web pública del consultorio (Ajustes › Mi web). */
export default async function ClinicSitePage({ params }: Props) {
  const { slug } = await params;
  const site = await getPublicSite(slug);
  if (!site) notFound();
  return <ClinicSiteView site={site} />;
}
