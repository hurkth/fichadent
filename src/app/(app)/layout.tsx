import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { AppShell } from '@/components/shared/app-shell';
import { getSession } from '@/lib/data/session';

export const metadata: Metadata = { robots: { index: false, follow: false } };

/** Toda la app autenticada. Sin consultorio activo → fuera. */
export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session) redirect('/auth/signout');
  return <AppShell session={session}>{children}</AppShell>;
}
