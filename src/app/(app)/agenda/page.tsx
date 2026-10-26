import type { Metadata } from 'next';
import { AgendaView } from '@/components/features/agenda/agenda-view';
import { agendaRange, isAgendaView, isDateString, limaToday } from '@/lib/agenda';
import { getAgenda } from '@/lib/data/appointments';
import { getPatient } from '@/lib/data/patients';
import { fullName } from '@/lib/format';

export const metadata: Metadata = { title: 'Agenda' };

type Search = { vista?: string; fecha?: string; cita?: string; nueva?: string; paciente?: string };

/**
 * Agenda · /agenda?vista=dia|semana|mes&fecha=YYYY-MM-DD&cita=<id>
 * Extras: ?nueva=1&paciente=<id> abre "Nueva cita" con el paciente elegido.
 */
export default async function AgendaPage({ searchParams }: { searchParams: Promise<Search> }) {
  const sp = await searchParams;
  const today = limaToday();
  const view = isAgendaView(sp.vista) ? sp.vista : 'dia';
  const date = isDateString(sp.fecha) ? sp.fecha : today;
  const { from, to, days } = agendaRange(view, date);

  const [items, patient] = await Promise.all([
    getAgenda(from, to),
    sp.nueva && sp.paciente ? getPatient(sp.paciente) : Promise.resolve(null),
  ]);

  return (
    <AgendaView
      key={`${view}-${date}`}
      view={view}
      date={date}
      today={today}
      days={days}
      items={items}
      initialSelected={sp.cita ?? null}
      openNew={sp.nueva ? { patient: patient ? { id: patient.id, name: fullName(patient), phone: patient.phone } : undefined } : null}
    />
  );
}
