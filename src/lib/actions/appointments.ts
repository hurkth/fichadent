'use server';

import { revalidatePath } from 'next/cache';
import { toIso } from '@/lib/agenda';
import { appointmentSchema, type AppointmentFormValues } from '@/lib/schemas/appointment';
import { createClient } from '@/lib/supabase/server';
import type { ActionResult, AppointmentStatus } from '@/types/domain';
import { dbErrorMessage, fieldErrors } from './errors';

const STATUSES: AppointmentStatus[] = ['scheduled', 'confirmed', 'done', 'no_show', 'cancelled'];

function revalidateAgenda(patientId?: string | null) {
  revalidatePath('/agenda');
  revalidatePath('/inicio');
  if (patientId) revalidatePath(`/pacientes/${patientId}`);
}

function toRow(input: AppointmentFormValues) {
  const parsed = appointmentSchema.safeParse(input);
  if (!parsed.success) return { error: fieldErrors(parsed.error) } as const;
  const v = parsed.data;
  const starts = toIso(v.date, v.time);
  const ends = new Date(new Date(starts).getTime() + v.duration * 60000).toISOString();
  return {
    row: {
      patient_id: v.patient_id,
      guest_name: v.patient_id ? null : v.guest_name,
      guest_phone: v.patient_id ? null : v.guest_phone || null,
      starts_at: starts,
      ends_at: ends,
      reason: v.reason || null,
      notes: v.notes || null,
    },
  } as const;
}

export async function createAppointment(input: AppointmentFormValues): Promise<ActionResult<{ id: string }>> {
  const r = toRow(input);
  if ('error' in r) return { ok: false, error: 'Revisa los campos marcados.', fieldErrors: r.error };
  const supabase = await createClient();
  const { data, error } = await supabase.from('appointments').insert(r.row).select('id').single();
  if (error) return { ok: false, error: dbErrorMessage(error) };
  revalidateAgenda(r.row.patient_id);
  return { ok: true, data };
}

/** Editar / reprogramar. */
export async function updateAppointment(id: string, input: AppointmentFormValues): Promise<ActionResult> {
  const r = toRow(input);
  if ('error' in r) return { ok: false, error: 'Revisa los campos marcados.', fieldErrors: r.error };
  const supabase = await createClient();
  const { error } = await supabase.from('appointments').update(r.row).eq('id', id);
  if (error) return { ok: false, error: dbErrorMessage(error) };
  revalidateAgenda(r.row.patient_id);
  return { ok: true, data: undefined };
}

export async function setAppointmentStatus(id: string, status: AppointmentStatus): Promise<ActionResult> {
  if (!STATUSES.includes(status)) return { ok: false, error: 'Estado no válido.' };
  const supabase = await createClient();
  const { data, error } = await supabase.from('appointments').update({ status }).eq('id', id).select('patient_id').maybeSingle();
  if (error) return { ok: false, error: dbErrorMessage(error) };
  if (!data) return { ok: false, error: 'La cita ya no existe.' };
  revalidateAgenda(data.patient_id);
  return { ok: true, data: undefined };
}

/** Quitar de la agenda (cita creada por error). Queda en la base con deleted_at. */
export async function deleteAppointment(id: string): Promise<ActionResult> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('appointments')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', id)
    .select('patient_id')
    .maybeSingle();
  if (error) return { ok: false, error: dbErrorMessage(error) };
  revalidateAgenda(data?.patient_id);
  return { ok: true, data: undefined };
}
