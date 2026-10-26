/**
 * Fechas de la agenda. Perú no tiene horario de verano: Lima = UTC−5 todo el año,
 * así que las fechas "YYYY-MM-DD" y horas "HH:MM" se trabajan como texto en hora de Lima
 * y se convierten a ISO con el offset fijo −05:00.
 */
export const LIMA_OFFSET = '-05:00';

export type AgendaView = 'dia' | 'semana' | 'mes';
export const AGENDA_VIEWS: { value: AgendaView; label: string }[] = [
  { value: 'dia', label: 'Día' },
  { value: 'semana', label: 'Semana' },
  { value: 'mes', label: 'Mes' },
];

export function isAgendaView(v: unknown): v is AgendaView {
  return v === 'dia' || v === 'semana' || v === 'mes';
}

const WEEKDAYS = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
const WEEKDAYS_SHORT = ['dom', 'lun', 'mar', 'mié', 'jue', 'vie', 'sáb'];
const MONTHS = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
const MONTHS_SHORT = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];

export function isDateString(v: unknown): v is string {
  return typeof v === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(v) && !Number.isNaN(Date.parse(`${v}T00:00:00Z`));
}

/** Día de hoy en Lima. */
export function limaToday(now: Date = new Date()): string {
  return limaDate(now.toISOString());
}

/** ISO (cualquier zona) → "YYYY-MM-DD" en Lima. */
export function limaDate(iso: string): string {
  const d = new Date(new Date(iso).getTime() - 5 * 3600_000);
  return d.toISOString().slice(0, 10);
}

/** ISO → "HH:MM" en Lima. */
export function limaTime(iso: string): string {
  const d = new Date(new Date(iso).getTime() - 5 * 3600_000);
  return d.toISOString().slice(11, 16);
}

/** Minutos desde las 00:00 de Lima. */
export function limaMinutes(iso: string): number {
  const [h, m] = limaTime(iso).split(':').map(Number);
  return h! * 60 + m!;
}

/** "2026-10-05" + "16:30" → "2026-10-05T16:30:00-05:00" */
export function toIso(date: string, time: string): string {
  return `${date}T${time}:00${LIMA_OFFSET}`;
}

function utc(date: string): Date {
  return new Date(`${date}T00:00:00Z`);
}

export function addDays(date: string, n: number): string {
  const d = utc(date);
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}

export function addMonths(date: string, n: number): string {
  const d = utc(date);
  const day = d.getUTCDate();
  d.setUTCDate(1);
  d.setUTCMonth(d.getUTCMonth() + n);
  const last = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + 1, 0)).getUTCDate();
  d.setUTCDate(Math.min(day, last));
  return d.toISOString().slice(0, 10);
}

/** 0 = domingo … 6 = sábado */
export function weekday(date: string): number {
  return utc(date).getUTCDay();
}

/** Lunes de la semana de `date`. */
export function weekStart(date: string): string {
  const wd = weekday(date);
  return addDays(date, wd === 0 ? -6 : 1 - wd);
}

export function monthStart(date: string): string {
  return `${date.slice(0, 7)}-01`;
}

/** Días visibles del mes: semanas completas de lunes a domingo (35 o 42 días). */
export function monthGrid(date: string): string[] {
  const first = weekStart(monthStart(date));
  const nextMonth = monthStart(addMonths(monthStart(date), 1));
  const days: string[] = [];
  for (let d = first; d < nextMonth || days.length % 7 !== 0; d = addDays(d, 1)) days.push(d);
  return days;
}

/** Rango [from, to) en ISO para pedir a rpc('agenda'). */
export function agendaRange(view: AgendaView, date: string): { from: string; to: string; days: string[] } {
  if (view === 'dia') return { from: toIso(date, '00:00'), to: toIso(addDays(date, 1), '00:00'), days: [date] };
  if (view === 'semana') {
    const start = weekStart(date);
    const days = Array.from({ length: 7 }, (_, i) => addDays(start, i));
    return { from: toIso(start, '00:00'), to: toIso(addDays(start, 7), '00:00'), days };
  }
  const days = monthGrid(date);
  return { from: toIso(days[0]!, '00:00'), to: toIso(addDays(days[days.length - 1]!, 1), '00:00'), days };
}

/** Fecha a la que llevan las flechas ‹ ›. */
export function shiftDate(view: AgendaView, date: string, dir: 1 | -1): string {
  if (view === 'dia') return addDays(date, dir);
  if (view === 'semana') return addDays(date, 7 * dir);
  return addMonths(date, dir);
}

/** "lunes 5 de octubre" */
export function longDay(date: string): string {
  const d = utc(date);
  return `${WEEKDAYS[d.getUTCDay()]} ${d.getUTCDate()} de ${MONTHS[d.getUTCMonth()]}`;
}

/** "lun 5" */
export function shortDay(date: string): { weekday: string; day: number } {
  const d = utc(date);
  return { weekday: WEEKDAYS_SHORT[d.getUTCDay()]!, day: d.getUTCDate() };
}

export function weekdayShort(i: number): string {
  return WEEKDAYS_SHORT[i]!;
}

/** Título del encabezado según la vista. */
export function agendaTitle(view: AgendaView, date: string, today: string): string {
  if (view === 'dia') {
    const label = longDay(date);
    if (date === today) return `Hoy · ${label}`;
    if (date === addDays(today, 1)) return `Mañana · ${label}`;
    return label.charAt(0).toUpperCase() + label.slice(1);
  }
  if (view === 'semana') {
    const start = weekStart(date);
    const end = addDays(start, 6);
    const s = utc(start);
    const e = utc(end);
    const sameMonth = s.getUTCMonth() === e.getUTCMonth();
    return sameMonth
      ? `${s.getUTCDate()} – ${e.getUTCDate()} ${MONTHS_SHORT[e.getUTCMonth()]} ${e.getUTCFullYear()}`
      : `${s.getUTCDate()} ${MONTHS_SHORT[s.getUTCMonth()]} – ${e.getUTCDate()} ${MONTHS_SHORT[e.getUTCMonth()]} ${e.getUTCFullYear()}`;
  }
  const d = utc(date);
  const m = MONTHS[d.getUTCMonth()]!;
  return `${m.charAt(0).toUpperCase()}${m.slice(1)} ${d.getUTCFullYear()}`;
}

/** "16:30" → "4:30 p. m." */
export function time12(hhmm: string): string {
  const [h, m] = hhmm.split(':').map(Number);
  const suffix = h! < 12 ? 'a. m.' : 'p. m.';
  const h12 = h! % 12 === 0 ? 12 : h! % 12;
  return `${h12}:${String(m).padStart(2, '0')} ${suffix}`;
}

export function durationMinutes(startIso: string, endIso: string): number {
  return Math.round((new Date(endIso).getTime() - new Date(startIso).getTime()) / 60000);
}

/** Mensaje de WhatsApp prellenado para recordar la cita. */
export function reminderMessage({
  name,
  clinicName,
  startsAt,
  today = limaToday(),
}: {
  name: string;
  clinicName: string;
  startsAt: string;
  today?: string;
}): string {
  const first = name.trim().split(/\s+/)[0] ?? '';
  const date = limaDate(startsAt);
  const when = date === today ? `hoy ${longDay(date)}` : date === addDays(today, 1) ? `mañana ${longDay(date)}` : `el ${longDay(date)}`;
  return `Hola, ${first}. Te recordamos tu cita en ${clinicName} ${when} a las ${time12(limaTime(startsAt))} Responde SÍ para confirmar o escríbenos si necesitas cambiar la hora. ¡Gracias!`;
}

/** Horas que muestra la vista semana (se amplía si hay citas fuera). */
export const DEFAULT_HOURS: [number, number] = [8, 20];

export const DURATIONS = [15, 30, 45, 60, 90, 120];
