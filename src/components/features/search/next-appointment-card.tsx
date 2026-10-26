'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { CalendarPlus, MessageCircle } from 'lucide-react';
import { useClinic } from '@/components/shared/clinic-context';
import { MedicalAlerts } from '@/components/shared/medical-alerts';
import { limaTime, pickNext, reminderMessage } from '@/lib/agenda';
import { whatsappUrl } from '@/lib/contact';
import { countdownLabel } from '@/lib/greeting';
import { cn } from '@/lib/cn';
import type { AgendaItem } from '@/types/domain';

const pill =
  'inline-flex min-h-12 items-center justify-center gap-1.5 rounded-full px-5 text-[15px] font-semibold text-white no-underline shadow-[inset_0_1px_0_rgba(255,255,255,.4)]';

/** Inicio 1A · tarjeta «Ahora»: próxima cita con cuenta regresiva y acciones (spec 03 §5.2). */
export function NextAppointmentCard({ items, alerts, className }: { items: AgendaItem[]; alerts: string[]; className?: string }) {
  const { clinic } = useClinic();
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 30_000);
    return () => clearInterval(t);
  }, []);

  const next = pickNext(items, now);

  if (!next) {
    return (
      <section aria-label="Próxima cita" className={cn('glass-lens flex min-h-40 flex-col justify-between gap-4 rounded-[34px] px-[22px] py-5', className)}>
        <div>
          <span className="text-xs font-bold tracking-[0.08em] opacity-85">AHORA</span>
          <p className="m-0 mt-1 text-2xl font-bold tracking-[-0.03em]">{items.length ? 'No tienes más citas hoy' : 'Día libre en la agenda'}</p>
        </div>
        <Link href="/agenda?nueva=1" className={cn(pill, 'self-start bg-white/20')}>
          <CalendarPlus className="size-[18px]" aria-hidden />
          Agendar
        </Link>
      </section>
    );
  }

  const start = new Date(next.starts_at);
  const inProgress = start <= now;
  const cd = countdownLabel((start.getTime() - now.getTime()) / 60000);
  const reason = next.reason ? ` ${next.reason.toUpperCase()}` : '';

  return (
    <section aria-label="Próxima cita" className={cn('glass-lens flex min-h-40 flex-col justify-between gap-4 rounded-[34px] px-[22px] py-5', className)}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 flex-col gap-0.5">
          <span className="text-xs font-bold tracking-[0.08em] opacity-85">
            {inProgress ? 'EN CURSO' : 'AHORA'} · {limaTime(next.starts_at)}
            {reason}
          </span>
          <span className="truncate text-2xl font-bold tracking-[-0.03em]">{next.name}</span>
          {alerts.length ? <MedicalAlerts alerts={alerts} compact size="sm" className="mt-1" /> : null}
        </div>
        <div className="shrink-0 text-right" aria-live="polite">
          {inProgress ? (
            <span className="text-2xl font-extrabold tracking-[-0.03em]">En curso</span>
          ) : (
            <>
              <span className="block text-[50px] leading-[0.9] font-extrabold tracking-[-0.06em] tabular">{cd.value}</span>
              <span className="text-[13px] font-semibold opacity-85">{cd.unit}</span>
            </>
          )}
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        {next.phone ? (
          <a
            href={whatsappUrl(next.phone, reminderMessage({ name: next.name, clinicName: clinic.name, startsAt: next.starts_at }))}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(pill, 'bg-whatsapp')}
          >
            <MessageCircle className="size-[18px]" aria-hidden />
            Recordar
          </a>
        ) : null}
        {next.patient_id ? (
          <>
            <Link href={`/pacientes/${next.patient_id}/visitas/nueva?cita=${next.id}`} className={cn(pill, 'bg-white/22')}>
              Atender
            </Link>
            <Link href={`/pacientes/${next.patient_id}`} className={cn(pill, 'bg-white/22')}>
              Ficha
            </Link>
          </>
        ) : (
          <Link href={`/agenda?cita=${next.id}`} className={cn(pill, 'bg-white/22')}>
            Crear su ficha
          </Link>
        )}
      </div>
    </section>
  );
}
