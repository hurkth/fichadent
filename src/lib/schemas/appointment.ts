import { z } from 'zod';
import { DURATIONS } from '@/lib/agenda';
import { digits } from '@/lib/format';

/** Nueva cita / reprogramar. Paciente registrado o nombre + celular libre. */
export const appointmentSchema = z
  .object({
    patient_id: z.string().uuid().nullable(),
    guest_name: z.string().trim().max(80, 'Máximo 80 caracteres'),
    guest_phone: z
      .string()
      .transform((v) => digits(v))
      .refine((v) => v === '' || /^9\d{8}$/.test(v), 'El celular debe tener 9 dígitos y empezar con 9'),
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Elige la fecha'),
    time: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'Elige la hora'),
    duration: z.coerce.number().refine((n) => DURATIONS.includes(n), 'Duración no válida'),
    reason: z.string().trim().max(120),
    notes: z.string().trim().max(500),
  })
  .superRefine((v, ctx) => {
    if (!v.patient_id && v.guest_name.length < 2) {
      ctx.addIssue({ code: 'custom', path: ['guest_name'], message: 'Elige un paciente o escribe el nombre' });
    }
  });

export type AppointmentFormValues = z.input<typeof appointmentSchema>;
