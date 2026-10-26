import { describe, expect, it } from 'vitest';
import { appointmentSchema } from '../schemas/appointment';
import { clinicSettingsSchema, signUpSchema } from '../schemas/clinic';

const base = { patient_id: null, guest_name: '', guest_phone: '', date: '2026-10-05', time: '09:30', duration: 30, reason: '', notes: '' };

describe('appointmentSchema', () => {
  it('pide paciente o nombre', () => {
    expect(appointmentSchema.safeParse(base).success).toBe(false);
    expect(appointmentSchema.safeParse({ ...base, guest_name: 'Roberto Ccori' }).success).toBe(true);
    expect(appointmentSchema.safeParse({ ...base, patient_id: '00000000-0000-4000-8000-000000000001' }).success).toBe(true);
  });

  it('valida celular, hora y duración', () => {
    expect(appointmentSchema.safeParse({ ...base, guest_name: 'X Y', guest_phone: '12345' }).success).toBe(false);
    expect(appointmentSchema.safeParse({ ...base, guest_name: 'X Y', time: '25:00' }).success).toBe(false);
    expect(appointmentSchema.safeParse({ ...base, guest_name: 'X Y', duration: 37 }).success).toBe(false);
    expect(appointmentSchema.parse({ ...base, guest_name: 'X Y', guest_phone: '987 654 321' }).guest_phone).toBe('987654321');
  });
});

describe('registro y ajustes', () => {
  it('registro válido normaliza correo y celular', () => {
    const r = signUpSchema.parse({ full_name: 'Dra. Ana', clinic_name: 'Sonrisa', phone: '987 654 321', email: ' Ana@Mail.com ', password: '12345678' });
    expect(r.email).toBe('ana@mail.com');
    expect(r.phone).toBe('987654321');
  });

  it('contraseña mínima de 8', () => {
    expect(signUpSchema.safeParse({ full_name: 'Dra. Ana', clinic_name: 'Sonrisa', phone: '987654321', email: 'a@b.co', password: '123' }).success).toBe(false);
  });

  it('color solo de la paleta', () => {
    const ok = { name: 'Sonrisa', display_name: 'Dra. Ana', phone: '', address: '', brand_color: '#1D4ED8' };
    expect(clinicSettingsSchema.safeParse(ok).success).toBe(true);
    expect(clinicSettingsSchema.safeParse({ ...ok, brand_color: '#FFFF00' }).success).toBe(false);
  });
});
