'use client';

import { SALES_WHATSAPP } from '@/lib/constants';
import { whatsappUrl } from '@/lib/contact';
import { cn } from '@/lib/cn';
import { useClinic } from './clinic-context';

/** Prueba gratis: cápsula "5 días de prueba · Activar". No bloquea nada (MVP). */
export function TrialChip({ compact, className }: { compact?: boolean; className?: string }) {
  const { clinic } = useClinic();
  if (clinic.plan !== 'trial') return null;

  const days = clinic.trialDaysLeft;
  const text = days > 1 ? `${days} días de prueba` : days === 1 ? '1 día de prueba' : 'Prueba terminada';
  const href = SALES_WHATSAPP ? whatsappUrl(SALES_WHATSAPP, `Hola, quiero activar Fichadent para ${clinic.name}.`) : undefined;

  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      role="status"
      className={cn('flex min-h-11 items-center gap-1.5 rounded-full px-4 text-[13.5px] font-semibold whitespace-nowrap text-ink no-underline', className)}
    >
      {compact ? text.replace(' de prueba', '') : text}
      {href ? (
        <>
          <span aria-hidden>·</span>
          <strong className="text-brand-700">Activar</strong>
        </>
      ) : null}
    </a>
  );
}
