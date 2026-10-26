import type { Metadata } from 'next';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, Search, UserPlus, Users } from 'lucide-react';
import { ButtonLink, buttonClasses } from '@/components/ui/button';
import { EmptyState } from '@/components/shared/empty-state';
import { PageHeader } from '@/components/shared/page-header';
import { PaperRecordsNote } from '@/components/shared/paper-records-note';
import { PatientRow } from '@/components/shared/patient-row';
import { DeletePatientButton } from '@/components/features/patient/delete-patient-button';
import { PATIENTS_PAGE_SIZE, listPatients, searchPatients } from '@/lib/data/patients';
import { cn } from '@/lib/cn';
import { fullName } from '@/lib/format';

export const metadata: Metadata = { title: 'Pacientes' };

/** Lista de pacientes: ver, editar (en la ficha), eliminar. Filtro por nombre, DNI o celular. */
export default async function PatientsPage({ searchParams }: { searchParams: Promise<{ page?: string; q?: string }> }) {
  const sp = await searchParams;
  const q = (sp.q ?? '').trim();
  const page = Math.max(0, Number.parseInt(sp.page ?? '1', 10) - 1 || 0);

  const { patients, total } = q.length >= 2 ? { patients: await searchPatients(q, 50), total: -1 } : await listPatients(page);
  const pages = total > 0 ? Math.ceil(total / PATIENTS_PAGE_SIZE) : 1;
  const pageHref = (n: number) => `/pacientes?page=${n + 1}`;

  return (
    <main className="flex flex-1 flex-col">
      <PageHeader
        title="Pacientes"
        subtitle={q ? `Resultados para “${q}”` : total === 1 ? '1 paciente' : `${Math.max(total, 0)} pacientes`}
        actions={
          <ButtonLink href="/pacientes/nuevo">
            <UserPlus className="size-5" aria-hidden />
            Nuevo paciente
          </ButtonLink>
        }
      >
        <form action="/pacientes" className="mt-2 flex gap-2.5" role="search">
          <label className="flex h-14 min-w-0 flex-1 items-center gap-3 rounded-[14px] border-[1.5px] border-line bg-surface px-4 focus-within:border-brand-700 focus-within:ring-4 focus-within:ring-brand-500/20">
            <Search className="size-5 shrink-0 text-ink-muted" aria-hidden />
            <span className="sr-only">Buscar paciente</span>
            <input
              name="q"
              defaultValue={q}
              placeholder="Nombre, DNI, celular o N.º de historia"
              className="h-full min-w-0 flex-1 border-0 bg-transparent text-[17px] font-semibold text-ink outline-none"
            />
          </label>
          <button type="submit" className={buttonClasses('secondary', 'md')}>
            Buscar
          </button>
          {q ? (
            <Link href="/pacientes" className={buttonClasses('ghost', 'md')}>
              Ver todos
            </Link>
          ) : null}
        </form>
      </PageHeader>

      <section className="flex flex-1 flex-col gap-3 px-4 py-5 md:gap-2 md:px-8 md:py-6">
        {patients.length === 0 ? (
          q ? (
            <EmptyState
              icon={Search}
              title={`No encontramos “${q}”`}
              description="Revisa cómo está escrito o busca por DNI o celular."
              actions={
                <ButtonLink href={`/pacientes/nuevo?nombre=${encodeURIComponent(q)}`}>
                  <UserPlus className="size-5" aria-hidden />
                  Crear paciente
                </ButtonLink>
              }
            />
          ) : (
            <>
              <EmptyState
                icon={Users}
                tone="gold"
                title="Aún no hay pacientes"
                description="Registra tu primer paciente con sus datos y antecedentes médicos."
                actions={
                  <ButtonLink href="/pacientes/nuevo">
                    <UserPlus className="size-5" aria-hidden />
                    Nuevo paciente
                  </ButtonLink>
                }
              />
              <PaperRecordsNote />
            </>
          )
        ) : (
          patients.map((p) => (
            <PatientRow
              key={p.id}
              patient={p}
              href={`/pacientes/${p.id}`}
              extra={<DeletePatientButton patientId={p.id} name={fullName(p)} redirectTo={null} compact />}
            />
          ))
        )}

        {!q && pages > 1 ? (
          <nav aria-label="Páginas" className="mt-3 flex items-center justify-center gap-3">
            <Link
              href={pageHref(page - 1)}
              aria-disabled={page === 0}
              className={cn(buttonClasses('secondary', 'sm'), page === 0 && 'pointer-events-none opacity-50')}
            >
              <ChevronLeft className="size-5" aria-hidden />
              Anterior
            </Link>
            <span className="text-[15px] font-bold text-ink-muted">
              Página {page + 1} de {pages}
            </span>
            <Link
              href={pageHref(page + 1)}
              aria-disabled={page + 1 >= pages}
              className={cn(buttonClasses('secondary', 'sm'), page + 1 >= pages && 'pointer-events-none opacity-50')}
            >
              Siguiente
              <ChevronRight className="size-5" aria-hidden />
            </Link>
          </nav>
        ) : null}
      </section>
    </main>
  );
}
