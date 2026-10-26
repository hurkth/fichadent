'use client';

import { FileStack, MessageCircle } from 'lucide-react';
import { buttonClasses } from '@/components/ui/button';
import { cn } from '@/lib/cn';
import { SALES_WHATSAPP } from '@/lib/constants';
import { whatsappUrl } from '@/lib/contact';
import { useClinic } from './clinic-context';

/**
 * "¿Tienes tus historias en papel? Te ayudamos a digitalizarlas."
 * Reemplaza la Captura rápida: el servicio lo hace el equipo de Fichadent.
 */
export function PaperRecordsNote({ className }: { className?: string }) {
  const { clinic, displayName } = useClinic();
  const href = SALES_WHATSAPP
    ? whatsappUrl(
        SALES_WHATSAPP,
        `Hola, soy ${displayName} de ${clinic.name}. Tengo historias en papel y quiero ayuda para digitalizarlas en Fichadent.`,
      )
    : null;

  return (
    <aside className={cn('flex flex-col gap-3 rounded-[20px] border border-dashed border-brand-500 bg-brand-25 p-4 md:p-5', className)}>
      <div className="flex items-start gap-3">
        <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-brand-50 text-brand-700">
          <FileStack className="size-[22px]" aria-hidden />
        </span>
        <div className="flex flex-col gap-1">
          <h2 className="m-0 text-[17px] font-extrabold">¿Tienes tus historias en papel?</h2>
          <p className="m-0 text-[15px] leading-snug font-semibold text-ink-muted">
            Te ayudamos a digitalizarlas. Tú sigues atendiendo; nosotros las pasamos a Fichadent.
          </p>
        </div>
      </div>
      {href ? (
        <a href={href} target="_blank" rel="noreferrer" className={buttonClasses('secondary', 'sm', 'self-start')}>
          <MessageCircle className="size-5 text-whatsapp" aria-hidden />
          Quiero ayuda
        </a>
      ) : null}
    </aside>
  );
}
