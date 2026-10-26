import { describe, expect, it } from 'vitest';
import {
  addMonths,
  agendaRange,
  agendaTitle,
  limaDate,
  limaTime,
  monthGrid,
  reminderMessage,
  shiftDate,
  time12,
  toIso,
  weekStart,
} from '../agenda';

describe('agenda: fechas en Lima', () => {
  it('convierte ISO UTC a fecha y hora de Lima', () => {
    expect(limaDate('2026-10-06T03:30:00Z')).toBe('2026-10-05');
    expect(limaTime('2026-10-06T03:30:00Z')).toBe('22:30');
    expect(toIso('2026-10-05', '16:30')).toBe('2026-10-05T16:30:00-05:00');
    expect(limaTime(toIso('2026-10-05', '09:15'))).toBe('09:15');
  });

  it('la semana empieza en lunes', () => {
    expect(weekStart('2026-10-05')).toBe('2026-10-05'); // lunes
    expect(weekStart('2026-10-11')).toBe('2026-10-05'); // domingo
    expect(weekStart('2026-10-01')).toBe('2026-09-28');
  });

  it('el mes muestra semanas completas', () => {
    const g = monthGrid('2026-10-15');
    expect(g[0]).toBe('2026-09-28');
    expect(g.length % 7).toBe(0);
    expect(g).toContain('2026-10-31');
    expect(g[g.length - 1]).toBe('2026-11-01');
  });

  it('rangos y flechas', () => {
    expect(agendaRange('dia', '2026-10-05')).toMatchObject({ from: '2026-10-05T00:00:00-05:00', to: '2026-10-06T00:00:00-05:00' });
    expect(agendaRange('semana', '2026-10-08').days).toHaveLength(7);
    expect(shiftDate('mes', '2026-01-31', 1)).toBe('2026-02-28');
    expect(addMonths('2026-12-15', 1)).toBe('2027-01-15');
  });

  it('títulos', () => {
    expect(agendaTitle('dia', '2026-10-05', '2026-10-05')).toBe('Hoy · lunes 5 de octubre');
    expect(agendaTitle('dia', '2026-10-06', '2026-10-05')).toBe('Mañana · martes 6 de octubre');
    expect(agendaTitle('semana', '2026-10-07', '2026-10-05')).toBe('5 – 11 oct 2026');
    expect(agendaTitle('semana', '2026-09-30', '2026-10-05')).toBe('28 sep – 4 oct 2026');
    expect(agendaTitle('mes', '2026-10-07', '2026-10-05')).toBe('Octubre 2026');
  });

  it('hora en 12 h', () => {
    expect(time12('16:00')).toBe('4:00 p. m.');
    expect(time12('00:30')).toBe('12:30 a. m.');
    expect(time12('12:05')).toBe('12:05 p. m.');
  });

  it('mensaje de recordatorio', () => {
    const msg = reminderMessage({
      name: 'María Fernanda Torres',
      clinicName: 'Consultorio Sonrisa',
      startsAt: '2026-10-05T16:00:00-05:00',
      today: '2026-10-05',
    });
    expect(msg).toBe(
      'Hola, María. Te recordamos tu cita en Consultorio Sonrisa hoy lunes 5 de octubre a las 4:00 p. m. Responde SÍ para confirmar o escríbenos si necesitas cambiar la hora. ¡Gracias!',
    );
    expect(reminderMessage({ name: 'Ana', clinicName: 'X', startsAt: '2026-10-08T09:00:00-05:00', today: '2026-10-05' })).toContain(
      'el jueves 8 de octubre a las 9:00 a. m.',
    );
  });
});
