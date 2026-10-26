import type { CSSProperties, ReactNode } from 'react';
import { OnlineStatusProvider } from '@/hooks/use-online-status';
import { Toaster } from '@/components/ui/toast';
import type { ClinicSession } from '@/types/domain';
import { BottomNav } from './bottom-nav';
import { ClinicProvider } from './clinic-context';
import { OfflineBanner } from './offline-banner';
import { SideNav } from './side-nav';
import { TrialBanner } from './trial-banner';

/** Marco de la app autenticada: color del consultorio, navegación, conexión, toasts. */
export function AppShell({ session, children }: { session: ClinicSession; children: ReactNode }) {
  return (
    <ClinicProvider value={session}>
      <OnlineStatusProvider>
        <Toaster>
          <div className="brand-scope flex min-h-dvh bg-bg" style={{ '--brand': session.clinic.brandColor } as CSSProperties}>
            <SideNav />
            <div className="flex min-w-0 flex-1 flex-col pb-24 md:pb-0">
              <OfflineBanner />
              <TrialBanner />
              {children}
            </div>
            <BottomNav />
          </div>
        </Toaster>
      </OnlineStatusProvider>
    </ClinicProvider>
  );
}
