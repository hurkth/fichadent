import { z } from 'zod';
import { BRAND_COLORS } from '@/lib/constants';
import { digits } from '@/lib/format';

const optionalText = z
  .string()
  .trim()
  .transform((v) => (v === '' ? null : v));

/** Ajustes del consultorio. */
export const clinicSettingsSchema = z.object({
  name: z.string().trim().min(2, 'Ingresa el nombre del consultorio').max(80, 'Máximo 80 caracteres'),
  display_name: z.string().trim().min(2, 'Ingresa tu nombre').max(60, 'Máximo 60 caracteres'),
  phone: z
    .string()
    .transform((v) => digits(v))
    .refine((v) => v === '' || /^9\d{8}$/.test(v), 'El celular debe tener 9 dígitos y empezar con 9')
    .transform((v) => (v === '' ? null : v)),
  address: optionalText,
  brand_color: z
    .string()
    .refine((v) => BRAND_COLORS.some((c) => c.value === v), 'Elige uno de los colores'),
});

export type ClinicSettingsValues = z.input<typeof clinicSettingsSchema>;

/** Registro de doctor (autoregistro, 5 días de prueba). */
export const signUpSchema = z.object({
  full_name: z.string().trim().min(3, 'Ingresa tu nombre, ej. Dra. Ana Quispe').max(60, 'Máximo 60 caracteres'),
  clinic_name: z.string().trim().min(2, 'Ingresa el nombre de tu consultorio').max(80, 'Máximo 80 caracteres'),
  phone: z
    .string()
    .transform((v) => digits(v))
    .refine((v) => /^9\d{8}$/.test(v), 'El celular debe tener 9 dígitos y empezar con 9'),
  email: z.string().trim().toLowerCase().regex(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Correo no válido'),
  password: z.string().min(8, 'Mínimo 8 caracteres').max(72, 'Máximo 72 caracteres'),
});

export type SignUpValues = z.input<typeof signUpSchema>;
