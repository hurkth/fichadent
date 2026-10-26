import Link from 'next/link';
import { limaTime } from '@/lib/agenda';
import { cn } from '@/lib/cn';
import { APPOINTMENT_STATUS } from '@/lib/constants';
import type { AgendaItem } from '@/types/domain';

const DOT: Record<AgendaItem['status'], string> = {
  scheduled: '#55555A',
  confirmed: '#1D4ED8',
  done: '#15803D',
  no_show: '#C2410C',
  cancelled: '#8E8E93',
};

/** Inicio 1A · panel «Hoy»: hasta 6 cápsulas con punto + texto (spec 03 §5.2). */
export function TodayStrip({ items, nextId, className }: { items: AgendaItem[]; nextId: string | null; className?: string }) {
  const shown = items.length > 6 ? items.slice(0, 5) : items;
  return (
    <section aria-labelledby="hoy-title" className={cn('glass flex min-w-0 flex-col gap-2.5 rounded-[34px] px-[18px] py-4', className)}>
      <div className="flex items-baseline justify-between">
        <h2 id="hoy-title" className="m-0 text-lg font-bold">
          Hoy <span className="font-semibold text-ink-muted">· {items.length === 1 ? '1 cita' : `${items.length} citas`}</span>
        </h2>
        <Link href="/agenda" className="flex min-h-11 items-center text-sm font-semibold text-brand-700 no-underline">
          Agenda ›
        </Link>
      </div>
      {items.length === 0 ? (
        <p className="m-0 text-[15px] font-semibold text-ink-muted">
          Sin citas hoy.{' '}
          <Link href="/agenda?nueva=1" className="font-bold">
            Agendar una
          </Link>
        </p>
      ) : (
        <ul className="m-0 flex list-none gap-2 overflow-x-auto p-0 pb-1 [scrollbar-width:none] md:grid md:grid-cols-3 md:overflow-visible md:pb-0">
          {shown.map((a) => {
            const st = APPOINTMENT_STATUS[a.status];
            const past = a.status === 'done' || a.status === 'no_show';
            const isNext = a.id === nextId;
            return (
              <li key={a.id} className="shrink-0 md:min-w-0">
                <Link
                  href={`/agenda?cita=${a.id}`}
                  className={cn(
                    'flex h-11 items-center gap-2 rounded-full px-3 no-underline',
                    isNext ? 'bg-white/95 ring-2 ring-brand-700' : 'bg-white/50 shadow-[inset_0_1px_0_rgba(255,255,255,.8)]',
                    past ? 'text-ink-muted' : 'text-ink',
                  )}
                >
                  <span className="size-2 shrink-0 rounded-full" style={{ background: DOT[a.status] }} aria-hidden />
                  <span className="text-[13.5px] font-bold tabular">{limaTime(a.starts_at)}</span>
                  <span className={cn('min-w-0 flex-1 truncate text-[13.5px] font-medium', a.status === 'no_show' && 'line-through')}>
                    {a.name.split(' ').slice(0, 2).join(' ')}
                  </span>
                  <span className="text-[11px] font-bold whitespace-nowrap" style={{ color: DOT[a.status] }}>
                    {st.label}
                  </span>
                </Link>
              </li>
            );
          })}
          {items.length > 6 ? (
            <li className="shrink-0 md:min-w-0">
              <Link href="/agenda" className="flex h-11 items-center justify-center rounded-full bg-white/50 px-3 text-[13.5px] font-bold text-brand-700 no-underline">
                +{items.length - 5} más
              </Link>
            </li>
          ) : null}
        </ul>
      )}
    </section>
  );
}
