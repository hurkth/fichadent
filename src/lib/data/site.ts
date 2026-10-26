import 'server-only';
import { createClient } from '@/lib/supabase/server';
import { createPublicClient } from '@/lib/supabase/public';
import type { ClinicSiteValues } from '@/lib/schemas/site';

/** Web del consultorio logueado (Ajustes › Mi web). null = aún no la crea (o falta la migración 0004). */
export async function getMySite(): Promise<(ClinicSiteValues & { updated_at: string }) | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('clinic_sites')
    .select('slug, published, headline, about, hours, city, maps_url, show_prices, updated_at')
    .maybeSingle();
  if (error) return null;
  return data;
}

export interface PublicSite {
  slug: string;
  name: string;
  phone: string | null;
  address: string | null;
  brand_color: string;
  logo_path: string | null;
  logoUrl: string | null;
  headline: string | null;
  about: string | null;
  hours: string | null;
  city: string | null;
  maps_url: string | null;
  show_prices: boolean;
  updated_at: string;
  services: { name: string; category: string; requires_tooth: boolean; price: number | null }[];
}

/** Web pública por slug (solo publicadas). Sin sesión: se puede cachear. */
export async function getPublicSite(slug: string): Promise<PublicSite | null> {
  try {
    const supabase = createPublicClient();
    const { data, error } = await supabase.rpc('public_clinic_site', { p_slug: slug });
    if (error || !data) return null;
    const site = data as unknown as Omit<PublicSite, 'logoUrl'>;
    let logoUrl: string | null = null;
    if (site.logo_path) {
      const { data: signed } = await supabase.storage.from('patient-files').createSignedUrl(site.logo_path, 60 * 60 * 24);
      logoUrl = signed?.signedUrl ?? null;
    }
    return { ...site, logoUrl };
  } catch {
    return null;
  }
}

/** Slugs publicados (sitemap). */
export async function getPublicSlugs(): Promise<{ slug: string; updated_at: string }[]> {
  try {
    const { data, error } = await createPublicClient().rpc('public_clinic_slugs');
    return error || !data ? [] : data;
  } catch {
    return [];
  }
}
