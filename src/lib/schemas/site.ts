import { z } from 'zod';

const optional = (max: number) =>
  z
    .string()
    .trim()
    .max(max, `Máximo ${max} caracteres`)
    .transform((v) => (v === '' ? null : v));

/** "Consultorio Dental Sonrisa" → "consultorio-dental-sonrisa" */
export function slugify(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 50)
    .replace(/-+$/g, '');
}

/** Ajustes › Mi web. */
export const clinicSiteSchema = z.object({
  slug: z
    .string()
    .trim()
    .toLowerCase()
    .regex(/^[a-z0-9](?:[a-z0-9-]{1,48}[a-z0-9])$/, 'Usa de 3 a 50 letras, números o guiones (sin tildes ni espacios)'),
  published: z.boolean(),
  headline: optional(120),
  about: optional(1200),
  hours: optional(300),
  city: optional(60),
  maps_url: optional(500).refine((v) => v === null || /^https:\/\//.test(v), 'Pega el enlace completo de Google Maps (https://…)'),
  show_prices: z.boolean(),
});

export type ClinicSiteInput = z.input<typeof clinicSiteSchema>;
export type ClinicSiteValues = z.output<typeof clinicSiteSchema>;
