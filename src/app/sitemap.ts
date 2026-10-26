import type { MetadataRoute } from 'next';
import { getPublicSlugs } from '@/lib/data/site';
import { SITE_URL } from '@/lib/site';

export const revalidate = 3600;

/** Páginas públicas: landing + webs publicadas de los consultorios. */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const sites = await getPublicSlugs();
  return [
    { url: `${SITE_URL}/`, lastModified: new Date(), changeFrequency: 'weekly', priority: 1 },
    ...sites.map((s) => ({ url: `${SITE_URL}/consultorio/${s.slug}`, lastModified: new Date(s.updated_at), changeFrequency: 'monthly' as const, priority: 0.7 })),
  ];
}
