'use client';

import { WifiOff } from 'lucide-react';
import { useOnlineStatus } from '@/hooks/use-online-status';

/** Cápsula flotante arriba al centro cuando no hay red (D-03: sin guardado offline en el MVP). */
export function OfflineBanner() {
  const online = useOnlineStatus();
  if (online) return null;
  return (
    <div role="alert" className="pointer-events-none fixed inset-x-0 top-3 z-50 flex justify-center px-4">
      <div className="glass-float flex max-w-[640px] items-center gap-3 rounded-full px-5 py-3 text-st-progress-fg">
        <WifiOff className="size-5 shrink-0" aria-hidden />
        <span className="text-sm leading-snug font-bold">Sin conexión · Los cambios no se pueden guardar hasta que vuelva la señal.</span>
      </div>
    </div>
  );
}
