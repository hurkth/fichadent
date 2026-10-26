import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { PageHeader } from '@/components/shared/page-header';
import { ClinicSettingsForm } from '@/components/features/settings/clinic-settings-form';
import { getSession } from '@/lib/data/session';

export const metadata: Metadata = { title: 'Ajustes' };

/** Ajustes del consultorio: datos, color y logo. */
export default async function SettingsPage() {
  const session = await getSession();
  if (!session) redirect('/auth/signout');
  return (
    <main className="flex flex-1 flex-col">
      <PageHeader title="Ajustes del consultorio" subtitle="Así se verá tu consultorio en Fichadent." back={{ href: '/', label: 'Inicio' }} />
      <ClinicSettingsForm session={session} />
    </main>
  );
}
