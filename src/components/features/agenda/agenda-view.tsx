'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { CalendarPlus, ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog } from '@/components/ui/dialog';
import { SegmentedControl } from '@/components/ui/segmented-control';
import { EmptyState } from '@/components/shared/empty-state';
import { AGENDA_VIEWS, agendaTitle, limaDate, limaTime, longDay, shiftDate, type AgendaView as View } from '@/lib/agenda';
import { cn } from '@/lib/cn';
import { APPOINTMENT_STATUS } from '@/lib/constants';
import type { AgendaItem } from '@/types/domain';
import { AppointmentDetail } from './appointment-detail';
import { AppointmentDialog, type AppointmentDialogProps } from './appointment-dialog';
import { MonthGrid } from './month-grid';
import { TimeGrid } from './time-grid';

export interface AgendaViewProps {
  view: View;
  date: string;
  today: string;
  days: string[];
  items: AgendaItem[];
  /** ?cita= seleccionada al cargar. */
  initialSelected: string | null;
  /** ?nueva=1 abre "Nueva cita" (desde la ficha o Inicio). */
  openNew?: { patient?: { id: string; name: string; phone: string | null } } | null;
}

function useIsWide() {
  const [wide, setWide] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 1024px)');
    const on = () => setWide(mq.matches);
    on();
    mq.addEventListener('change', on);
    return () => mq.removeEventListener('change', on);
  }, []);
  return wide;
}

/** Agenda: Día / Semana / Mes, detalle de la cita y Nueva cita. Estado de vista en la URL. */
export function AgendaView({ view, date, today, days, items, initialSelected, openNew }: AgendaViewProps) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const wide = useIsWide();

  const [selectedId, setSelectedId] = useState<string | null>(initialSelected);
  const [dialog, setDialog] = useState<Pick<AppointmentDialogProps, 'appointment' | 'initial'> | null>(
    openNew ? { initial: { date: date >= today ? date : today, patient: openNew.patient } } : null,
  );

  const selected = useMemo(() => items.find((a) => a.id === selectedId) ?? null, [items, selectedId]);

  const go = useCallback(
    (next: { vista?: View; fecha?: string; cita?: string | null }) => {
      const sp = new URLSearchParams(params.toString());
      sp.delete('nueva');
      sp.delete('paciente');
      if (next.vista) sp.set('vista', next.vista);
      if (next.fecha) sp.set('fecha', next.fecha);
      if (next.cita === null) sp.delete('cita');
      else if (next.cita) sp.set('cita', next.cita);
      router.push(`${pathname}?${sp.toString()}`, { scroll: false });
    },
    [params, pathname, router],
  );

  const select = (a: AgendaItem) => {
    setSelectedId(a.id);
    const sp = new URLSearchParams(params.toString());
    sp.set('cita', a.id);
    window.history.replaceState(null, '', `${pathname}?${sp.toString()}`);
  };
  const clearSelection = () => {
    setSelectedId(null);
    const sp = new URLSearchParams(params.toString());
    sp.delete('cita');
    window.history.replaceState(null, '', `${pathname}?${sp.toString()}`);
  };

  const newAt = (d: string, time?: string) => setDialog({ initial: { date: d, time } });
  const dayCount = items.filter((a) => a.status !== 'cancelled' && (view !== 'dia' || limaDate(a.starts_at) === date)).length;
  const showSidePanel = view === 'dia' && wide;

  return (
    <main className="flex flex-1 flex-col gap-4 px-4 pt-5 pb-6 md:px-8 md:pt-7">
      {/* Encabezado */}
      <header className="flex flex-wrap items-center gap-3">
        <h1 className="m-0 mr-2 text-[26px] font-extrabold tracking-[-.02em] md:text-[28px]">Agenda</h1>
        <div className="order-3 flex w-full items-center gap-2 md:order-none md:w-auto md:flex-1 md:justify-center">
          <Button variant="secondary" size="icon" aria-label="Anterior" onClick={() => go({ fecha: shiftDate(view, date, -1), cita: null })}>
            <ChevronLeft className="size-6" aria-hidden />
          </Button>
          <span className="min-w-0 flex-1 truncate text-center text-[17px] font-extrabold md:flex-none md:px-2 md:text-lg">
            {agendaTitle(view, date, today)}
          </span>
          <Button variant="secondary" size="icon" aria-label="Siguiente" onClick={() => go({ fecha: shiftDate(view, date, 1), cita: null })}>
            <ChevronRight className="size-6" aria-hidden />
          </Button>
          {date !== today ? (
            <Button variant="ghost" size="sm" onClick={() => go({ fecha: today, cita: null })}>
              Hoy
            </Button>
          ) : null}
        </div>
        <SegmentedControl label="Vista" options={AGENDA_VIEWS} value={view} onChange={(v) => go({ vista: v, cita: null })} className="ml-auto md:ml-0" />
        <Button onClick={() => newAt(date >= today ? date : today)} className="hidden md:inline-flex">
          <Plus className="size-5" aria-hidden />
          Nueva cita
        </Button>
      </header>

      {/* Cuerpo */}
      <div className={cn('grid min-h-0 flex-1 gap-5', showSidePanel ? 'grid-cols-[minmax(0,1fr)_400px]' : 'grid-cols-[minmax(0,1fr)]')}>
        <div className="flex min-w-0 flex-col gap-3">
          {view === 'mes' ? (
            <MonthGrid days={days} month={date.slice(0, 7)} items={items} onDay={(d) => go({ vista: 'dia', fecha: d, cita: null })} onSelect={select} />
          ) : view === 'semana' && !wide ? (
            <WeekList days={days} items={items} today={today} onSelect={select} onDay={(d) => go({ vista: 'dia', fecha: d, cita: null })} />
          ) : (
            <TimeGrid
              days={days}
              items={items}
              selectedId={selectedId}
              onSelect={select}
              onSlot={(d, t) => newAt(d, t)}
              onDay={(d) => go({ vista: 'dia', fecha: d, cita: null })}
            />
          )}
          {view === 'dia' ? (
            <p className="m-0 text-sm font-semibold text-ink-muted">
              {dayCount === 0 ? 'Sin citas este día. ' : `${dayCount} ${dayCount === 1 ? 'cita' : 'citas'}. `}
              Toca un espacio libre para agendar.
            </p>
          ) : null}
        </div>

        {showSidePanel ? (
          selected ? (
            <AppointmentDetail appointment={selected} onEdit={() => setDialog({ appointment: selected })} onClose={clearSelection} className="self-start" />
          ) : (
            <EmptyState
              icon={CalendarPlus}
              title="Elige una cita"
              description="Toca una cita para ver su estado, escribir por WhatsApp o atender. Toca un espacio libre para agendar."
              className="self-start"
            />
          )
        ) : null}
      </div>

      {/* Detalle en modal (móvil, tablet vertical, semana y mes) */}
      {!showSidePanel ? (
        <Dialog open={!!selected} onClose={clearSelection} title="Cita" hideTitle>
          {selected ? (
            <AppointmentDetail
              appointment={selected}
              onEdit={() => setDialog({ appointment: selected })}
              className="max-h-[70dvh] overflow-y-auto border-0 p-0 md:p-0"
            />
          ) : null}
        </Dialog>
      ) : null}

      <AppointmentDialog
        open={!!dialog}
        onClose={() => setDialog(null)}
        appointment={dialog?.appointment}
        initial={dialog?.initial}
        onSaved={(id) => {
          if (!dialog?.appointment) setSelectedId(id);
        }}
      />

      {/* FAB móvil */}
      <button
        type="button"
        aria-label="Nueva cita"
        onClick={() => newAt(date >= today ? date : today)}
        className="fixed right-5 bottom-28 z-20 flex size-16 cursor-pointer items-center justify-center rounded-[20px] border-0 bg-brand-700 text-white shadow-[0_10px_24px_rgba(17,17,17,.25)] md:hidden"
      >
        <Plus className="size-8" aria-hidden />
      </button>
    </main>
  );
}

/** Semana en móvil: lista agrupada por día. */
function WeekList({
  days,
  items,
  today,
  onSelect,
  onDay,
}: {
  days: string[];
  items: AgendaItem[];
  today: string;
  onSelect: (a: AgendaItem) => void;
  onDay: (d: string) => void;
}) {
  return (
    <div className="flex flex-col gap-4">
      {days.map((d) => {
        const list = items.filter((a) => limaDate(a.starts_at) === d);
        return (
          <section key={d} className="flex flex-col gap-2">
            <button type="button" onClick={() => onDay(d)} className="flex cursor-pointer items-center gap-2 border-0 bg-transparent p-0 text-left">
              <h2 className={cn('m-0 text-base font-extrabold first-letter:uppercase', d === today && 'text-brand-700')}>
                {d === today ? 'Hoy · ' : ''}
                {longDay(d)}
              </h2>
              <span className="text-sm font-semibold text-ink-muted">{list.length ? `${list.length}` : ''}</span>
            </button>
            {list.length === 0 ? (
              <p className="m-0 rounded-2xl border border-dashed border-line px-4 py-3 text-sm font-semibold text-ink-subtle">Sin citas</p>
            ) : (
              list.map((a) => <AgendaRow key={a.id} a={a} onClick={() => onSelect(a)} />)
            )}
          </section>
        );
      })}
    </div>
  );
}

export function AgendaRow({ a, onClick }: { a: AgendaItem; onClick?: () => void }) {
  const st = APPOINTMENT_STATUS[a.status];
  const muted = a.status === 'cancelled' || a.status === 'no_show';
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex min-h-16 w-full cursor-pointer items-center gap-3 rounded-2xl border border-line-card bg-surface px-4 py-2.5 text-left"
    >
      <span className="w-12 shrink-0 text-[15px] font-extrabold tabular">{limaTime(a.starts_at)}</span>
      <span className="flex min-w-0 flex-1 flex-col">
        <span className={cn('truncate text-base font-extrabold', muted && 'text-ink-muted line-through')}>{a.name}</span>
        {a.reason ? <span className="truncate text-sm font-semibold text-ink-muted">{a.reason}</span> : null}
      </span>
      <span className={cn('inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold', st.className)}>{st.label}</span>
    </button>
  );
}
