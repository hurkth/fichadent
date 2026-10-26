import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { LandingEditor } from '@/components/features/admin/landing-editor';
import { PageHeader } from '@/components/shared/page-header';
import { getLandingContent } from '@/lib/data/landing';
import { getSession } from '@/lib/data/session';

export const metadata: Metadata = { title: 'Editar landing' };

/** Solo administradores de Fichadent (platform_admins). Edita los textos de la landing pública. */
export default async function AdminLandingPage() {
  const session = await getSession();
  if (!session?.isPlatformAdmin) notFound();
  const content = await getLandingContent();
  return (
    <main className="flex flex-1 flex-col">
      <PageHeader title="Landing de Fichadent" subtitle="Lo que ve un odontólogo que llega desde Google. Los cambios se publican al guardar." back={{ href: '/inicio', label: 'Inicio' }} />
      <LandingEditor initial={content} />
    </main>
  );
}
