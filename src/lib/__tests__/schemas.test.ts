import { describe, expect, it } from 'vitest';
import { patientSchema } from '../schemas/patient';
import { visitSchema } from '../schemas/visit';

const base = {
  first_names: ' Milagros ',
  last_names: 'Ccori Huanca',
  dni: '47205318',
  birth_date: '1992-11-09',
  phone: '965 418 203',
  email: '',
  address: '',
  occupation: 'Docente',
  marital_status: 'conviviente' as const,
  conditions: [],
};

describe('patientSchema (F04)', () => {
  it('normaliza y acepta un paciente válido', () => {
    const r = patientSchema.parse(base);
    expect(r.first_names).toBe('Milagros');
    expect(r.phone).toBe('965418203');
    expect(r.email).toBeNull();
    expect(r.address).toBeNull();
  });

  it('DNI y celular obligatorios con formato peruano', () => {
    const r = patientSchema.safeParse({ ...base, dni: '123', phone: '812345678' });
    expect(r.success).toBe(false);
    const paths = r.error!.issues.map((i) => i.path[0]);
    expect(paths).toContain('dni');
    expect(paths).toContain('phone');
  });

  it('rechaza fechas de nacimiento futuras', () => {
    expect(patientSchema.safeParse({ ...base, birth_date: '2999-01-01' }).success).toBe(false);
  });
});
