import Link from 'next/link';
import { UserPlus, Users } from 'lucide-react';
import { ButtonLink } from '@/components/ui/button';
import { EmptyState } from '@/components/shared/empty-state';
import { PaperRecordsNote } from '@/components/shared/paper-records-note';
import { PatientPoster } from '@/components/shared/patient-poster';
import type { PatientCard } from '@/types/domain';

/** Inicio 1A · Recientes: pósters 3×2 (1 columna en móvil) + cápsula de historias en papel. */
export function RecentPatients({ patients }: { patients: PatientCard[] }) {
  if (patients.length === 0) {
    return (
      <div className="flex flex-col gap-4">
        <EmptyState
          icon={Users}
          tone="gold"
          title="Aún no hay pacientes"
          description="Registra tu primer paciente. Luego lo encuentras por nombre, DNI o celular."
          actions={
            <ButtonLink href="/pacientes/nuevo">
              <UserPlus className="size-5" aria-hidden />
              Nuevo paciente
            </ButtonLink>
          }
        />
        <PaperRecordsNote />
      </div>
    );
  }

  return (
    <section aria-labelledby="recientes-title" className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 id="recientes-title" className="m-0 text-[22px] font-extrabold tracking-[-0.03em]">
          Recientes
        </h2>
        <div className="flex items-center gap-2">
          <PaperRecordsNote variant="chip" className="hidden md:flex" />
          <Link href="/pacientes" className="flex min-h-11 items-center px-2 text-[15px] font-semibold text-brand-700 no-underline">
            Ver todos
          </Link>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-3">
        {patients.map((p) => (
          <PatientPoster key={p.id} patient={p} />
        ))}
      </div>
      <PaperRecordsNote variant="chip" className="self-start md:hidden" />
    </section>
  );
}
