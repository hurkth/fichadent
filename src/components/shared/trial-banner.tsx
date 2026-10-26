'use client';

import { Clock } from 'lucide-react';
import { SALES_WHATSAPP } from '@/lib/constants';
import { whatsappUrl } from '@/lib/contact';
import { useClinic } from './clinic-context';

/** Prueba gratis: aviso con los días que quedan. No bloquea nada (MVP). */
export function TrialBanner() {
  const { clinic } = useClinic();
  if (clinic.plan !== 'trial') return null;

  const days = clinic.trialDaysLeft;
  const text =
    days > 1 ? `Te quedan ${days} días de prueba gratis.` : days === 1 ? 'Te queda 1 día de prueba gratis.' : 'Tu prueba gratis terminó.';
  const contact = SALES_WHATSAPP
    ? whatsappUrl(SALES_WHATSAPP, `Hola, quiero activar Fichadent para ${clinic.name}.`)
    : null;

  return (
    <div
      role="status"
      className="mx-4 mt-4 flex flex-wrap items-center gap-x-3 gap-y-1 rounded-2xl bg-brand-50 px-4 py-3 text-brand-900 md:mx-8"
    >
      <Clock className="size-5 shrink-0" aria-hidden />
      <span className="text-[15px] font-bold">{text}</span>
      {contact ? (
        <a href={contact} target="_blank" rel="noreferrer" className="text-[15px] font-extrabold text-brand-900 underline">
          Activar mi plan
        </a>
      ) : null}
    </div>
  );
}
