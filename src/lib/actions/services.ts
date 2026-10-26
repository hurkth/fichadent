'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { newServiceSchema, servicePricesSchema, type NewServiceInput, type ServicePriceInput } from '@/lib/schemas/services';
import type { ActionResult } from '@/types/domain';
import { dbErrorMessage, fieldErrors } from './errors';

const MIGRATION_MISSING = 'Falta activar los precios en la base de datos (migración 0003).';

function isMissingTable(error: { code?: string; message?: string }) {
  return error.code === '42P01' || error.code === 'PGRST205' || /clinic_services/.test(error.message ?? '');
}

/** Ajustes › Precios: guarda precio y visibilidad de cada intervención. */
export async function saveServicePrices(input: ServicePriceInput[]): Promise<ActionResult<{ count: number }>> {
  const parsed = servicePricesSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: 'Revisa los precios marcados.', fieldErrors: fieldErrors(parsed.error) };

  const supabase = await createClient();
  const rows = parsed.data.map((r) => ({ service_id: r.serviceId, price: r.price, hidden: r.hidden }));
  if (rows.length === 0) return { ok: true, data: { count: 0 } };

  const { error } = await supabase.from('clinic_services').upsert(rows, { onConflict: 'clinic_id,service_id' });
  if (error) return { ok: false, error: isMissingTable(error) ? MIGRATION_MISSING : dbErrorMessage(error) };

  revalidatePath('/ajustes');
  revalidatePath('/pacientes', 'layout');
  return { ok: true, data: { count: rows.length } };
}

/** Ajustes › Precios › Agregar intervención propia del consultorio. */
export async function createService(input: NewServiceInput): Promise<ActionResult<{ id: string }>> {
  const parsed = newServiceSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: 'Revisa los campos marcados.', fieldErrors: fieldErrors(parsed.error) };
  const { name, category, requiresTooth, price } = parsed.data;

  const supabase = await createClient();
  const { data: clinicId } = await supabase.rpc('current_clinic_id');
  if (!clinicId) return { ok: false, error: 'Tu sesión expiró. Vuelve a ingresar.' };

  const { data: last } = await supabase.from('services').select('sort_order').order('sort_order', { ascending: false }).limit(1).maybeSingle();

  const { data: created, error } = await supabase
    .from('services')
    .insert({ clinic_id: clinicId as string, name, category, requires_tooth: requiresTooth, sort_order: (last?.sort_order ?? 0) + 1 })
    .select('id')
    .single();
  if (error) {
    if (error.code === '23505') return { ok: false, error: 'Ya tienes una intervención con ese nombre.', fieldErrors: { name: 'Ya existe' } };
    return { ok: false, error: error.code === '42501' ? MIGRATION_MISSING : dbErrorMessage(error) };
  }

  if (price !== null) {
    const { error: e2 } = await supabase.from('clinic_services').upsert({ service_id: created.id, price, hidden: false }, { onConflict: 'clinic_id,service_id' });
    if (e2) return { ok: false, error: isMissingTable(e2) ? MIGRATION_MISSING : dbErrorMessage(e2) };
  }

  revalidatePath('/ajustes');
  return { ok: true, data: { id: created.id } };
}
