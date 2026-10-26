/**
 * Vista previa de pantallas con datos de ejemplo. SOLO desarrollo (el middleware
 * responde 404 en producción). Sirve para comparar contra design/screens sin Supabase.
 *   /dev/inicio · /dev/resultados · /dev/sin-resultados · /dev/vacio
 *   /dev/ficha?tab=… · /dev/nuevo-paciente · /dev/nueva-visita · /dev/login · /dev/registro
 *   /dev/agenda?vista=dia|semana|mes · /dev/pacientes · /dev/ajustes
 */
import { notFound } from 'next/navigation';
import { Plus } from 'lucide-react';
import { ButtonLink } from '@/components/ui/button';
import { Logo } from '@/components/ui/logo';
import { AppShell } from '@/components/shared/app-shell';
import { BrandPanel } from '@/components/features/auth/brand-panel';
import { LoginForm } from '@/components/features/auth/login-form';
import { FilesTab } from '@/components/features/files/files-tab';
import { ConditionsTab } from '@/components/features/patient/conditions-tab';
import { PatientHeader, isPatientTab } from '@/components/features/patient/patient-header';
import { PersonalDataTab } from '@/components/features/patient/personal-data-tab';
import { SummaryTab } from '@/components/features/patient/summary-tab';
import { VisitsTab } from '@/components/features/patient/visits-tab';
import { PatientForm } from '@/components/features/patient-form/patient-form';
import { HomeHeader } from '@/components/features/search/home-header';
import { HomeSearch } from '@/components/features/search/home-search';
import { RecentPatients } from '@/components/features/search/recent-patients';
import { TodayAppointmentsCard } from '@/components/features/search/today-appointments-card';
import { VisitForm } from '@/components/features/visit/visit-form';
import { pendingTreatments } from '@/lib/data/visits';
import { AgendaView } from '@/components/features/agenda/agenda-view';
import { SignUpForm } from '@/components/features/auth/sign-up-form';
import { DeletePatientButton } from '@/components/features/patient/delete-patient-button';
import { ClinicSettingsForm } from '@/components/features/settings/clinic-settings-form';
import { PageHeader } from '@/components/shared/page-header';
import { PaperRecordsNote } from '@/components/shared/paper-records-note';
import { PatientRow } from '@/components/shared/patient-row';
import { agendaRange, isAgendaView } from '@/lib/agenda';
import { fxAgenda, fxAlerts, fxConditions, fxFiles, fxPatient, fxPatientCards, fxSearchResults, fxServices, fxSession, fxVisits } from '../fixtures';

const DEMO_NOW = new Date('2026-10-05T14:00:00Z');

export default async function DevScreen({ params, searchParams }: { params: Promise<{ screen: string }>; searchParams: Promise<{ tab?: string; vista?: string; cita?: string }> }) {
  if (process.env.NODE_ENV !== 'development') notFound();
  const [{ screen }, { tab: rawTab, vista, cita }] = await Promise.all([params, searchParams]);

  if (screen === 'registro') {
    return (
      <div className="flex min-h-dvh bg-surface">
        <BrandPanel />
        <section className="flex w-full flex-col justify-center gap-9 px-6 py-10 md:w-[540px] md:shrink-0 md:px-[72px]">
          <Logo />
          <div className="flex flex-col gap-2">
            <h1 className="m-0 text-[32px] font-extrabold tracking-[-.02em]">Prueba gratis 5 días</h1>
            <p className="m-0 text-base font-medium text-ink-muted">Crea tu cuenta y empieza a cargar tus pacientes hoy. Sin tarjeta.</p>
          </div>
          <SignUpForm />
        </section>
      </div>
    );
  }

  if (screen === 'login') {
    return (
      <div className="flex min-h-dvh bg-surface">
        <BrandPanel />
        <section className="flex w-full flex-col justify-center gap-9 px-6 py-10 md:w-[540px] md:shrink-0 md:px-[72px]">
          <Logo />
          <div className="flex flex-col gap-2">
            <h1 className="m-0 text-[32px] font-extrabold tracking-[-.02em]">Iniciar sesión</h1>
            <p className="m-0 text-base font-medium text-ink-muted">Ingresa con la cuenta del consultorio.</p>
          </div>
          <LoginForm />
        </section>
      </div>
    );
  }

  let body: React.ReactNode;
  switch (screen) {
    case 'inicio':
    case 'resultados':
    case 'sin-resultados':
    case 'vacio': {
      const q = screen === 'resultados' ? 'quispe' : screen === 'sin-resultados' ? 'Vargas Ttito' : '';
      body = (
        <main className="flex flex-1 flex-col gap-4 px-4 pt-5 pb-6 md:gap-[22px] md:px-8 md:pt-7">
          <HomeHeader now={DEMO_NOW} />
          <HomeSearch
            initialQuery={q}
            initialResults={screen === 'resultados' ? fxSearchResults : []}
            recent={<RecentPatients patients={screen === 'vacio' ? [] : fxPatientCards} />}
            aside={
              <div className="flex flex-col gap-4">
                <TodayAppointmentsCard items={fxAgenda.filter((a) => a.starts_at.startsWith('2026-10-05'))} />
                <PaperRecordsNote />
              </div>
            }
          />
        </main>
      );
      break;
    }
    case 'ficha': {
      const tab = isPatientTab(rawTab) ? rawTab : 'resumen';
      const id = fxPatient.id;
      const content = {
        resumen: <SummaryTab patientId={id} lastVisit={fxVisits[0]!} pending={pendingTreatments(fxVisits)} recentFiles={fxFiles.slice(0, 3)} />,
        visitas: <VisitsTab patientId={id} visits={fxVisits} paperPages={2} paperDate="2025-03-03T15:00:00Z" />,
        antecedentes: <ConditionsTab patientId={id} conditions={fxConditions} />,
        archivos: <FilesTab patientId={id} files={fxFiles} />,
        datos: <PersonalDataTab patient={fxPatient} fromPaper />,
      }[tab];
      body = (
        <main className="flex flex-1 flex-col">
          <PatientHeader patient={fxPatient} alerts={fxAlerts} tab={tab} />
          <section className="flex-1 px-4 py-4 md:px-8 md:pt-[22px] md:pb-7">{content}</section>
          <div className="sticky bottom-[88px] z-10 border-t border-line-card bg-surface px-4 py-3 md:hidden">
            <ButtonLink href="#" className="min-h-14 w-full text-[17px]">
              <Plus className="size-5" aria-hidden />
              Nueva visita
            </ButtonLink>
          </div>
        </main>
      );
      break;
    }
    case 'nuevo-paciente':
      body = (
        <main className="flex flex-1 flex-col">
          <PatientForm
            mode="create"
            recordLabel="HC-00252 · se asigna automáticamente"
            conditions={fxConditions.map((c) => ({ ...c, active: ['allergy', 'medication', 'pregnant'].includes(c.code), detail: { allergy: 'Ibuprofeno: ronchas en la piel', medication: 'Ácido fólico, sulfato ferroso', pregnant: '12 semanas' }[c.code] ?? null }))}
            defaultValues={{ first_names: 'Milagros', last_names: 'Ccori Huanca', dni: '47205318', birth_date: '1992-11-09', phone: '965418203', address: 'Urb. Los Pinos D-12, Cerro Colorado, Arequipa', occupation: 'Docente', marital_status: 'conviviente' }}
            cancelHref="/dev/inicio"
          />
        </main>
      );
      break;
    case 'nueva-visita':
      body = (
        <main className="flex flex-1 flex-col">
          <VisitForm
            patient={{ id: fxPatient.id, name: 'Rosa Elvira Quispe Mamani', shortName: 'Rosa Quispe', record_number: 'HC-00248' }}
            alerts={fxAlerts}
            services={fxServices}
          />
        </main>
      );
      break;
    case 'agenda': {
      const v = isAgendaView(vista) ? vista : 'dia';
      const { days } = agendaRange(v, '2026-10-05');
      body = <AgendaView view={v} date="2026-10-05" today="2026-10-05" days={days} items={fxAgenda} initialSelected={cita ?? null} />;
      break;
    }
    case 'pacientes':
      body = (
        <main className="flex flex-1 flex-col">
          <PageHeader title="Pacientes" subtitle={`${fxPatientCards.length} pacientes`} />
          <section className="flex flex-col gap-3 px-4 py-5 md:gap-2 md:px-8">
            {fxPatientCards.map((p) => (
              <PatientRow key={p.id} patient={p} href="#" extra={<DeletePatientButton patientId={p.id} name={p.first_names} redirectTo={null} compact />} />
            ))}
            <PaperRecordsNote />
          </section>
        </main>
      );
      break;
    case 'ajustes':
      body = (
        <main className="flex flex-1 flex-col">
          <PageHeader title="Ajustes del consultorio" subtitle="Así se verá tu consultorio en Fichadent." />
          <ClinicSettingsForm session={fxSession} />
        </main>
      );
      break;
    default:
      notFound();
  }

  return <AppShell session={fxSession}>{body}</AppShell>;
}
