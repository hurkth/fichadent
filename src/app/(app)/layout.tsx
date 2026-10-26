import { redirect } from 'next/navigation';
import { AppShell } from '@/components/shared/app-shell';
import { getSession } from '@/lib/data/session';

/** Toda la app autenticada. Sin consultorio activo → fuera. */
export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session) redirect('/auth/signout');
  return <AppShell session={session}>{children}</AppShell>;
}
