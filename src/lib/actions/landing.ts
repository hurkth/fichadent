'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { landingSchema, type LandingInput } from '@/lib/schemas/landing';
import type { Json } from '@/types/database';
import type { ActionResult } from '@/types/domain';
import { dbErrorMessage, fieldErrors } from './errors';

/** /admin/landing › Guardar. Solo administradores de Fichadent (RLS de site_content). */
export async function saveLandingContent(input: LandingInput): Promise<ActionResult> {
  const parsed = landingSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: 'Revisa los campos marcados.', fieldErrors: fieldErrors(parsed.error) };

  const supabase = await createClient();
  const { data: admin } = await supabase.rpc('is_platform_admin');
  if (admin !== true) return { ok: false, error: 'Solo el equipo de Fichadent puede editar la landing.' };

  const { error } = await supabase.from('site_content').upsert({ key: 'landing', value: parsed.data as unknown as Json }, { onConflict: 'key' });
  if (error) return { ok: false, error: dbErrorMessage(error) };

  revalidatePath('/');
  return { ok: true, data: undefined };
}
