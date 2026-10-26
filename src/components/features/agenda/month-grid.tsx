'use client';

import { useEffect, useState } from 'react';
import { limaDate, limaTime, limaToday, weekdayShort } from '@/lib/agenda';
import { cn } from '@/lib/cn';
import { APPOINTMENT_STATUS } from '@/lib/constants';
import type { AgendaItem } from '@/types/domain';

const HEAD = [1, 2, 3, 4, 5, 6, 0].map(weekdayShort);

/** Mes: semanas de lunes a domingo; cada día muestra sus primeras citas. Tocar un día → vista Día. */
export function MonthGrid({
  days,
  month,
  items,
  onDay,
  onSelect,
}: {
  days: string[];
  /** "2026-10": días fuera del mes se ven atenuados. */
  month: string;
  items: AgendaItem[];
  onDay: (date: string) => void;
  onSelect: (a: AgendaItem) => void;
}) {
  const [today, setToday] = useState('');
  useEffect(() => setToday(limaToday()), []);

  const byDay = new Map<string, AgendaItem[]>();
  for (const a of items) {
    if (a.status === 'cancelled') continue;
    const d = limaDate(a.starts_at);
    byDay.set(d, [...(byDay.get(d) ?? []), a]);
  }

  return (
    <div className="overflow-hidden rounded-[20px] border border-line-card bg-surface">
      <div className="grid grid-cols-7 border-b border-line-card">
        {HEAD.map((h) => (
          <span key={h} className="py-2.5 text-center text-xs font-bold text-ink-muted uppercase">
            {h}
          </span>
        ))}
      </div>
      <div className="grid grid-cols-7">
        {days.map((d) => {
          const list = byDay.get(d) ?? [];
          const outside = !d.startsWith(month);
          return (
            <div
              key={d}
              className={cn('flex min-h-[76px] flex-col gap-1 border-t border-l border-line-soft p-1.5 md:min-h-[112px] md:p-2', outside && 'bg-bg')}
            >
              <button
                type="button"
                onClick={() => onDay(d)}
                aria-label={`Ver el día ${d}, ${list.length} citas`}
                className={cn(
                  'flex size-8 cursor-pointer items-center justify-center self-start rounded-full border-0 text-[15px] font-extrabold',
                  d === today ? 'bg-brand-700 text-white' : outside ? 'bg-transparent text-ink-subtle' : 'bg-transparent text-ink hover:bg-bg',
                )}
              >
                {Number(d.slice(8))}
              </button>
              {/* Tablet: primeras 3 citas */}
              <div className="hidden flex-col gap-1 md:flex">
                {list.slice(0, 3).map((a) => (
                  <button
                    key={a.id}
                    type="button"
                    onClick={() => onSelect(a)}
                    className="flex min-h-6 w-full cursor-pointer items-center gap-1.5 truncate rounded-md border-0 bg-brand-25 px-1.5 text-left text-xs font-bold text-ink hover:bg-brand-50"
                  >
                    <span aria-hidden className={cn('size-1.5 shrink-0 rounded-full', APPOINTMENT_STATUS[a.status].dot)} />
                    <span className="text-ink-muted tabular">{limaTime(a.starts_at)}</span>
                    <span className="truncate">{a.name}</span>
                  </button>
                ))}
                {list.length > 3 ? (
                  <button type="button" onClick={() => onDay(d)} className="cursor-pointer border-0 bg-transparent px-1.5 text-left text-xs font-extrabold text-brand-700">
                    +{list.length - 3} más
                  </button>
                ) : null}
              </div>
              {/* Móvil: cantidad */}
              {list.length > 0 ? (
                <button
                  type="button"
                  onClick={() => onDay(d)}
                  className="flex cursor-pointer items-center justify-center rounded-full border-0 bg-brand-50 py-0.5 text-xs font-extrabold text-brand-900 md:hidden"
                >
                  {list.length}
                </button>
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}
