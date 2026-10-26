import { HomeHeader } from '@/components/features/search/home-header';
import { HomeSearch } from '@/components/features/search/home-search';
import { RecentPatients } from '@/components/features/search/recent-patients';
import { PaperRecordsNote } from '@/components/shared/paper-records-note';
import { TodayAppointmentsCard } from '@/components/features/search/today-appointments-card';
import { getTodayAppointments } from '@/lib/data/appointments';
import { getRecentPatients, searchPatients } from '@/lib/data/patients';

/** F02 · Inicio y buscador. */
export default async function HomePage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q = '' } = await searchParams;
  const [recent, initialResults, today] = await Promise.all([getRecentPatients(6), searchPatients(q), getTodayAppointments()]);

  return (
    <main className="flex flex-1 flex-col gap-4 px-4 pt-5 pb-6 md:gap-[22px] md:px-8 md:pt-7">
      <HomeHeader />
      <HomeSearch
        initialQuery={q}
        initialResults={initialResults}
        recent={<RecentPatients patients={recent} />}
        aside={
          <div className="flex flex-col gap-4">
            <TodayAppointmentsCard items={today} />
            <PaperRecordsNote />
          </div>
        }
      />
    </main>
  );
}
