import 'server-only';
import { createClient } from '@/lib/supabase/server';
import { addDays, limaToday, toIso } from '@/lib/agenda';
import type { AgendaItem } from '@/types/domain';

/** Citas en [from, to) (máx. 45 días), sin las eliminadas. */
export async function getAgenda(from: string, to: string): Promise<AgendaItem[]> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc('agenda', { p_from: from, p_to: to });
  if (error) throw error;
  return (data ?? []) as unknown as AgendaItem[];
}

/** Inicio · Citas de hoy (sin canceladas). */
export async function getTodayAppointments(): Promise<AgendaItem[]> {
  const today = limaToday();
  const items = await getAgenda(toIso(today, '00:00'), toIso(addDays(today, 1), '00:00'));
  return items.filter((a) => a.status !== 'cancelled');
}

/** Próximas citas de un paciente (ficha). */
export async function getUpcomingForPatient(patientId: string, limit = 3) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('appointments')
    .select('id, starts_at, ends_at, status, reason')
    .eq('patient_id', patientId)
    .is('deleted_at', null)
    .in('status', ['scheduled', 'confirmed'])
    .gte('starts_at', new Date().toISOString())
    .order('starts_at')
    .limit(limit);
  if (error) throw error;
  return data ?? [];
}
