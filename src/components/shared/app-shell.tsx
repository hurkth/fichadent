import type { CSSProperties, ReactNode } from 'react';
import { OnlineStatusProvider } from '@/hooks/use-online-status';
import { Toaster } from '@/components/ui/toast';
import type { ClinicSession } from '@/types/domain';
import { ClinicProvider } from './clinic-context';
import { Dock, MobileDock } from './dock';
import { OfflineBanner } from './offline-banner';

/** Marco de la app (spec 03 §4): fondo de vidrio con el color del consultorio, dock flotante, conexión y toasts. */
export function AppShell({ session, children }: { session: ClinicSession; children: ReactNode }) {
  return (
    <ClinicProvider value={session}>
      <OnlineStatusProvider>
        <Toaster>
          <div className="brand-scope app-backdrop flex min-h-dvh flex-col" style={{ '--brand': session.clinic.brandColor } as CSSProperties}>
            <OfflineBanner />
            <div className="flex min-w-0 flex-1 flex-col pb-[112px] md:pb-[124px]">{children}</div>
            <Dock />
            <MobileDock />
          </div>
        </Toaster>
      </OnlineStatusProvider>
    </ClinicProvider>
  );
}
