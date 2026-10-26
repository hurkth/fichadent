'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { clinicSettingsSchema, type ClinicSettingsValues } from '@/lib/schemas/clinic';
import type { ActionResult } from '@/types/domain';
import { dbErrorMessage, fieldErrors } from './errors';

async function myClinicId() {
  const supabase = await createClient();
  const { data } = await supabase.rpc('current_clinic_id');
  return { supabase, clinicId: (data as string | null) ?? null };
}

/** Nombre, celular, dirección y color del consultorio + nombre del doctor. */
export async function updateClinicSettings(input: ClinicSettingsValues): Promise<ActionResult> {
  const parsed = clinicSettingsSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: 'Revisa los campos marcados.', fieldErrors: fieldErrors(parsed.error) };
  const { display_name, ...clinic } = parsed.data;

  const { supabase, clinicId } = await myClinicId();
  if (!clinicId) return { ok: false, error: 'Tu sesión expiró. Vuelve a ingresar.' };

  const { error } = await supabase.from('clinics').update(clinic).eq('id', clinicId);
  if (error) return { ok: false, error: dbErrorMessage(error) };

  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { error: e2 } = await supabase.from('memberships').update({ display_name }).eq('user_id', user!.id);
  if (e2) return { ok: false, error: dbErrorMessage(e2) };

  revalidatePath('/', 'layout');
  return { ok: true, data: undefined };
}

/** Guarda (o quita, con null) la ruta del logo ya subido a Storage. */
export async function setClinicLogo(path: string | null): Promise<ActionResult> {
  const { supabase, clinicId } = await myClinicId();
  if (!clinicId) return { ok: false, error: 'Tu sesión expiró. Vuelve a ingresar.' };
  if (path !== null && !path.startsWith(`${clinicId}/logo/`)) return { ok: false, error: 'Ruta de logo no válida.' };

  const { error } = await supabase.from('clinics').update({ logo_path: path }).eq('id', clinicId);
  if (error) return { ok: false, error: dbErrorMessage(error) };

  // Limpia logos anteriores (cada subida usa un nombre nuevo para no quedar en caché).
  const { data: files } = await supabase.storage.from('patient-files').list(`${clinicId}/logo`);
  const old = (files ?? []).map((f) => `${clinicId}/logo/${f.name}`).filter((p) => p !== path);
  if (old.length) await supabase.storage.from('patient-files').remove(old);
  revalidatePath('/', 'layout');
  return { ok: true, data: undefined };
}
