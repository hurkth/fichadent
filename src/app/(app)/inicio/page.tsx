import { HomeHeader } from '@/components/features/search/home-header';
import { HomeSearch } from '@/components/features/search/home-search';
import { NextAppointmentCard } from '@/components/features/search/next-appointment-card';
import { RecentPatients } from '@/components/features/search/recent-patients';
import { TodayStrip } from '@/components/features/search/today-strip';
import { pickNext } from '@/lib/agenda';
import { getTodayAppointments } from '@/lib/data/appointments';
import { getPatientAlerts, getRecentPatients, searchPatients } from '@/lib/data/patients';

/** F02 · Inicio (diseño 1A, spec 03 §5): saludo, Ahora + Hoy, Recientes; el buscador vive en el dock. */
export default async function HomePage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q = '' } = await searchParams;
  const [recent, initialResults, today] = await Promise.all([getRecentPatients(6), searchPatients(q), getTodayAppointments()]);
  const next = pickNext(today, new Date());
  const alerts = next?.patient_id ? await getPatientAlerts(next.patient_id) : [];

  return (
    <main className="flex flex-1 flex-col gap-5 px-4 pt-5 md:gap-6 md:px-10 md:pt-7">
      <HomeHeader />
      <HomeSearch initialQuery={q} initialResults={initialResults}>
        <div className="flex flex-col gap-4 md:h-40 md:flex-row">
          <NextAppointmentCard items={today} alerts={alerts} className="md:w-[430px] md:shrink-0" />
          <TodayStrip items={today} nextId={next?.id ?? null} className="md:flex-1" />
        </div>
        <RecentPatients patients={recent} />
      </HomeSearch>
    </main>
  );
}
