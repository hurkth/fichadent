import Link from 'next/link';
import { CalendarDays } from 'lucide-react';
import { SectionCard } from '@/components/shared/section-card';
import { limaTime } from '@/lib/agenda';
import { cn } from '@/lib/cn';
import { APPOINTMENT_STATUS } from '@/lib/constants';
import type { AgendaItem } from '@/types/domain';

/** Inicio · Citas de hoy (hasta 6) con enlace a la agenda. */
export function TodayAppointmentsCard({ items }: { items: AgendaItem[] }) {
  return (
    <SectionCard title="Citas de hoy" action={{ label: 'Agenda', href: '/agenda' }}>
      {items.length === 0 ? (
        <div className="flex items-start gap-3 border-t border-line-soft pt-3">
          <CalendarDays className="mt-0.5 size-5 shrink-0 text-ink-muted" aria-hidden />
          <p className="m-0 text-[15px] leading-snug font-semibold text-ink-muted">
            No tienes citas hoy.{' '}
            <Link href="/agenda?nueva=1" className="font-bold">
              Agendar una
            </Link>
          </p>
        </div>
      ) : (
        <ul className="m-0 flex list-none flex-col border-t border-line-soft p-0">
          {items.slice(0, 6).map((a) => {
            const st = APPOINTMENT_STATUS[a.status];
            const muted = a.status === 'no_show';
            return (
              <li key={a.id}>
                <Link href={`/agenda?cita=${a.id}`} className="flex min-h-12 items-center gap-3 border-b border-line-soft py-1.5 text-ink no-underline last:border-0">
                  <span className="w-11 shrink-0 text-sm font-extrabold tabular">{limaTime(a.starts_at)}</span>
                  <span className={cn('min-w-0 flex-1 truncate text-[15px] font-bold', muted && 'text-ink-muted line-through')}>{a.name}</span>
                  <span aria-label={st.label} title={st.label} className={cn('size-2.5 shrink-0 rounded-full', st.dot)} />
                </Link>
              </li>
            );
          })}
          {items.length > 6 ? (
            <li className="pt-2 text-sm font-bold text-ink-muted">+{items.length - 6} más en la agenda</li>
          ) : null}
        </ul>
      )}
    </SectionCard>
  );
}
