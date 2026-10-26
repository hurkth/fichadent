import { UserPlus, Users } from 'lucide-react';
import { ButtonLink } from '@/components/ui/button';
import { EmptyState } from '@/components/shared/empty-state';
import { PatientRow } from '@/components/shared/patient-row';
import type { PatientCard } from '@/types/domain';

export function RecentPatients({ patients }: { patients: PatientCard[] }) {
  if (patients.length === 0) {
    return (
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
    );
  }

  return (
    <section className="flex min-h-0 flex-col gap-3">
      <h2 className="m-0 text-lg font-extrabold">Recientes</h2>
      <div className="flex flex-col gap-3 md:gap-2">
        {patients.map((p) => (
          <PatientRow key={p.id} patient={p} href={`/pacientes/${p.id}`} variant="recent" />
        ))}
      </div>
    </section>
  );
}
