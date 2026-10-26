'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { clinicSiteSchema, type ClinicSiteInput } from '@/lib/schemas/site';
import type { ActionResult } from '@/types/domain';
import { dbErrorMessage, fieldErrors } from './errors';

/** Ajustes › Mi web › Guardar. Crea o actualiza la web del consultorio. */
export async function saveClinicSite(input: ClinicSiteInput, previousSlug?: string | null): Promise<ActionResult<{ slug: string }>> {
  const parsed = clinicSiteSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: 'Revisa los campos marcados.', fieldErrors: fieldErrors(parsed.error) };
  const site = parsed.data;

  const supabase = await createClient();
  const { data: free, error: e1 } = await supabase.rpc('clinic_slug_available', { p_slug: site.slug });
  if (e1) return { ok: false, error: 'Falta activar las webs en la base de datos (migración 0004).' };
  if (free === false) return { ok: false, error: 'Esa dirección ya la usa otro consultorio.', fieldErrors: { slug: 'Ya está en uso, prueba otra' } };

  const { error } = await supabase.from('clinic_sites').upsert(site, { onConflict: 'clinic_id' });
  if (error) {
    if (error.code === '23505') return { ok: false, error: 'Esa dirección ya la usa otro consultorio.', fieldErrors: { slug: 'Ya está en uso, prueba otra' } };
    return { ok: false, error: dbErrorMessage(error) };
  }

  revalidatePath(`/consultorio/${site.slug}`);
  if (previousSlug && previousSlug !== site.slug) revalidatePath(`/consultorio/${previousSlug}`);
  revalidatePath('/sitemap.xml');
  revalidatePath('/ajustes');
  return { ok: true, data: { slug: site.slug } };
}
