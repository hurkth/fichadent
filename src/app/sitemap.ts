import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/site';

/** Solo páginas públicas. Agregar aquí las de función, ciudad y blog cuando existan (spec 04 §5–6). */
export default function sitemap(): MetadataRoute.Sitemap {
  return [{ url: `${SITE_URL}/`, lastModified: new Date(), changeFrequency: 'weekly', priority: 1 }];
}
