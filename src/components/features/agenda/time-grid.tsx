'use client';

import { useEffect, useState, type MouseEvent } from 'react';
import { DEFAULT_HOURS, limaDate, limaMinutes, limaTime, limaToday, shortDay } from '@/lib/agenda';
import { cn } from '@/lib/cn';
import { APPOINTMENT_STATUS } from '@/lib/constants';
import type { AgendaItem } from '@/types/domain';

const HOUR_PX = 80;
const PX_PER_MIN = HOUR_PX / 60;

export interface TimeGridProps {
  days: string[];
  items: AgendaItem[];
  selectedId: string | null;
  onSelect: (a: AgendaItem) => void;
  /** Toque en un espacio libre → nueva cita a esa hora (redondeada a 30 min). */
  onSlot: (date: string, time: string) => void;
  /** Al tocar el encabezado de un día (vista semana). */
  onDay?: (date: string) => void;
}

/** Ubica citas superpuestas en carriles para que no se tapen. */
function layout(items: AgendaItem[]) {
  const sorted = [...items].sort((a, b) => a.starts_at.localeCompare(b.starts_at));
  const out = new Map<string, { lane: number; lanes: number }>();
  let cluster: { item: AgendaItem; lane: number }[] = [];
  let clusterEnd = 0;
  const flush = () => {
    const lanes = Math.max(1, ...cluster.map((c) => c.lane + 1));
    cluster.forEach((c) => out.set(c.item.id, { lane: c.lane, lanes }));
    cluster = [];
  };
  for (const item of sorted) {
    const start = new Date(item.starts_at).getTime();
    const end = new Date(item.ends_at).getTime();
    if (cluster.length && start >= clusterEnd) flush();
    const used = new Set(cluster.filter((c) => new Date(c.item.ends_at).getTime() > start).map((c) => c.lane));
    let lane = 0;
    while (used.has(lane)) lane++;
    cluster.push({ item, lane });
    clusterEnd = Math.max(clusterEnd, end);
  }
  flush();
  return out;
}

/** Horas en filas, días en columnas (1 en vista Día, 7 en Semana). */
export function TimeGrid({ days, items, selectedId, onSelect, onSlot, onDay }: TimeGridProps) {
  const [nowMin, setNowMin] = useState<number | null>(null);
  const [today, setToday] = useState<string>('');
  useEffect(() => {
    const tick = () => {
      const now = new Date().toISOString();
      setToday(limaToday());
      setNowMin(limaMinutes(now));
    };
    tick();
    const t = setInterval(tick, 60_000);
    return () => clearInterval(t);
  }, []);

  const visible = items.filter((a) => days.includes(limaDate(a.starts_at)));
  const first = Math.min(DEFAULT_HOURS[0], ...visible.map((a) => Math.floor(limaMinutes(a.starts_at) / 60)));
  const last = Math.max(DEFAULT_HOURS[1], ...visible.map((a) => Math.ceil((limaMinutes(a.starts_at) + 30) / 60)));
  const hours = Array.from({ length: last - first }, (_, i) => first + i);
  const lanes = layout(visible);
  const multi = days.length > 1;

  const slot = (date: string) => (e: MouseEvent<HTMLDivElement>) => {
    if (e.target !== e.currentTarget) return;
    const y = e.nativeEvent.offsetY;
    const minutes = first * 60 + Math.floor(y / PX_PER_MIN / 30) * 30;
    const h = Math.min(23, Math.floor(minutes / 60));
    onSlot(date, `${String(h).padStart(2, '0')}:${String(minutes % 60).padStart(2, '0')}`);
  };

  return (
    <div className="overflow-hidden rounded-[20px] border border-line-card bg-surface">
      {multi ? (
        <div className="grid border-b border-line-card" style={{ gridTemplateColumns: `56px repeat(${days.length}, minmax(0, 1fr))` }}>
          <span />
          {days.map((d) => {
            const { weekday, day } = shortDay(d);
            const isToday = d === today;
            return (
              <button
                key={d}
                type="button"
                onClick={() => onDay?.(d)}
                className="flex cursor-pointer flex-col items-center gap-0.5 border-0 border-l border-line-soft bg-transparent py-2.5"
              >
                <span className="text-xs font-bold text-ink-muted uppercase">{weekday}</span>
                <span
                  className={cn(
                    'flex size-9 items-center justify-center rounded-full text-[17px] font-extrabold',
                    isToday ? 'bg-brand-700 text-white' : 'text-ink',
                  )}
                >
                  {day}
                </span>
              </button>
            );
          })}
        </div>
      ) : null}

      <div className="max-h-[calc(100dvh-230px)] min-h-[420px] overflow-y-auto">
        <div className="relative grid" style={{ gridTemplateColumns: `56px repeat(${days.length}, minmax(0, 1fr))` }}>
          {/* Horas */}
          <div className="relative" style={{ height: hours.length * HOUR_PX }}>
            {hours.map((h, i) => (
              <span key={h} className="absolute right-2 text-xs font-bold text-ink-subtle tabular" style={{ top: i * HOUR_PX + 4 }}>
                {String(h).padStart(2, '0')}:00
              </span>
            ))}
          </div>

          {days.map((d) => {
            const dayItems = visible.filter((a) => limaDate(a.starts_at) === d);
            return (
              <div
                key={d}
                role="presentation"
                onClick={slot(d)}
                className="relative cursor-copy border-l border-line-soft"
                style={{
                  height: hours.length * HOUR_PX,
                  backgroundImage: `repeating-linear-gradient(to bottom, var(--color-line-soft) 0 1px, transparent 1px ${HOUR_PX}px)`,
                }}
                title="Toca un espacio libre para agendar"
              >
                {d === today && nowMin !== null && nowMin >= first * 60 && nowMin < last * 60 ? (
                  <div className="pointer-events-none absolute inset-x-0 z-10 flex items-center" style={{ top: (nowMin - first * 60) * PX_PER_MIN }}>
                    <span className="-ml-1 size-2.5 rounded-full bg-brand-700" />
                    <span className="h-0.5 flex-1 bg-brand-700" />
                  </div>
                ) : null}

                {dayItems.map((a) => {
                  const top = (limaMinutes(a.starts_at) - first * 60) * PX_PER_MIN;
                  const minutes = (new Date(a.ends_at).getTime() - new Date(a.starts_at).getTime()) / 60000;
                  const height = Math.max(minutes * PX_PER_MIN - 3, 30);
                  const { lane, lanes: n } = lanes.get(a.id) ?? { lane: 0, lanes: 1 };
                  const st = APPOINTMENT_STATUS[a.status];
                  const on = a.id === selectedId;
                  const muted = a.status === 'cancelled' || a.status === 'no_show';
                  return (
                    <button
                      key={a.id}
                      type="button"
                      onClick={() => onSelect(a)}
                      aria-label={`${limaTime(a.starts_at)} ${a.name}, ${st.label}`}
                      className={cn(
                        'absolute flex cursor-pointer flex-col items-start justify-center gap-0.5 overflow-hidden rounded-xl border-[1.5px] px-2 py-1 text-left',
                        on ? 'z-20 border-ink shadow-[0_6px_18px_rgba(17,17,17,.18)]' : 'border-transparent',
                        a.status === 'done' ? 'bg-st-done-bg' : a.status === 'confirmed' ? 'bg-ap-confirmed-bg' : muted ? 'bg-surface-2' : 'bg-brand-50',
                      )}
                      style={{ top: top + 1, height, left: `calc(${(lane / n) * 100}% + 3px)`, width: `calc(${100 / n}% - 6px)` }}
                    >
                      {height < 50 ? (
                        <span className="flex w-full min-w-0 items-center gap-1.5">
                          <span aria-hidden className={cn('size-2 shrink-0 rounded-full', st.dot)} />
                          <span className="shrink-0 text-xs font-bold text-ink-muted tabular">{limaTime(a.starts_at)}</span>
                          <span className={cn('min-w-0 truncate text-sm font-extrabold', muted ? 'text-ink-muted line-through' : 'text-ink')}>{a.name}</span>
                        </span>
                      ) : (
                        <>
                          <span className="flex w-full items-center gap-1.5">
                            <span aria-hidden className={cn('size-2 shrink-0 rounded-full', st.dot)} />
                            <span className="text-xs font-bold text-ink-muted tabular">{limaTime(a.starts_at)}</span>
                          </span>
                          <span className={cn('w-full truncate text-sm leading-tight font-extrabold', muted ? 'text-ink-muted line-through' : 'text-ink')}>
                            {a.name}
                          </span>
                          {height > 60 && a.reason ? <span className="w-full truncate text-xs font-semibold text-ink-muted">{a.reason}</span> : null}
                        </>
                      )}
                    </button>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
