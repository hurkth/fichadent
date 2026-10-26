import 'server-only';
import { DEFAULT_LANDING, type LandingContent } from '@/content/landing';
import { landingSchema } from '@/lib/schemas/landing';
import { createPublicClient } from '@/lib/supabase/public';

/**
 * Contenido de la landing: lo guardado en /admin/landing (site_content 'landing') sobre los valores por defecto.
 * Si la base no responde o la migración 0004 no corrió, usa los valores por defecto.
 */
export async function getLandingContent(): Promise<LandingContent> {
  try {
    const { data, error } = await createPublicClient().from('site_content').select('value').eq('key', 'landing').maybeSingle();
    if (error || !data) return DEFAULT_LANDING;
    const merged = { ...DEFAULT_LANDING, ...(data.value as Partial<LandingContent>) };
    const parsed = landingSchema.safeParse(merged);
    return parsed.success ? (parsed.data as LandingContent) : DEFAULT_LANDING;
  } catch {
    return DEFAULT_LANDING;
  }
}
