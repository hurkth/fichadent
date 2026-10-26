'use client';

import { useOnlineStatus } from '@/hooks/use-online-status';
import { cn } from '@/lib/cn';
import { TrialChip } from './trial-banner';

/** Inicio (tablet): cápsula de vidrio arriba a la derecha con prueba gratis y conexión (spec 03 §4.2). */
export function TopCluster({ className }: { className?: string }) {
  const online = useOnlineStatus();
  return (
    <div className={cn('glass-float flex h-14 items-center gap-1 rounded-full p-1.5', className)}>
      <TrialChip />
      <span role="status" className={cn('flex items-center gap-1.5 px-3 text-xs font-bold whitespace-nowrap', online ? 'text-[#1F7A3A]' : 'text-warn')}>
        <span className={cn('size-2 rounded-full', online ? 'bg-live shadow-[0_0_8px_var(--color-live)]' : 'bg-warn')} aria-hidden />
        {online ? 'En línea' : 'Sin conexión'}
      </span>
    </div>
  );
}
