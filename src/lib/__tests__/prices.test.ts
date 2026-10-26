import { describe, expect, it } from 'vitest';
import { formatSoles, parseSoles, sumPrices } from '../format';
import { servicePricesSchema, newServiceSchema } from '../schemas/services';

describe('precios', () => {
  it('formatea soles sin decimales cuando es entero', () => {
    expect(formatSoles(80)).toBe('S/ 80');
    expect(formatSoles(80.5)).toBe('S/ 80.50');
    expect(formatSoles(1200)).toBe('S/ 1,200');
    expect(formatSoles(null)).toBe('');
  });

  it('lee precios escritos de varias formas', () => {
    expect(parseSoles('80')).toBe(80);
    expect(parseSoles('S/ 80')).toBe(80);
    expect(parseSoles('80,50')).toBe(80.5);
    expect(parseSoles('80.5')).toBe(80.5);
    expect(parseSoles('1,200')).toBe(1200);
    expect(parseSoles('1.200,50')).toBe(1200.5);
    expect(parseSoles('')).toBeNull();
    expect(parseSoles('abc')).toBeNaN();
  });

  it('suma ignorando los que no tienen precio', () => {
    expect(sumPrices([{ price: 80 }, { price: null }, { price: 120.5 }, {}])).toBe(200.5);
  });

  it('valida la lista de precios', () => {
    const id = '7f1c0a9e-2b3d-4c5e-8f60-718293a4b5c6';
    expect(servicePricesSchema.safeParse([{ serviceId: id, price: 80, hidden: false }]).success).toBe(true);
    expect(servicePricesSchema.safeParse([{ serviceId: id, price: -1, hidden: false }]).success).toBe(false);
    expect(servicePricesSchema.safeParse([{ serviceId: id, price: null, hidden: true }]).success).toBe(true);
  });

  it('valida una intervención nueva', () => {
    expect(newServiceSchema.safeParse({ name: 'Carilla', category: 'Prevención y estética', requiresTooth: true, price: 350 }).success).toBe(true);
    expect(newServiceSchema.safeParse({ name: 'C', category: 'X', requiresTooth: false, price: null }).success).toBe(false);
  });
});

import { countdownLabel, firstName } from '../greeting';

describe('saludo y cuenta regresiva', () => {
  it('saca el primer nombre sin el título', () => {
    expect(firstName('Dra. Lucía Mamani')).toBe('Lucía');
    expect(firstName('Dr Juan Pérez')).toBe('Juan');
    expect(firstName('Ana')).toBe('Ana');
  });
  it('formatea minutos', () => {
    expect(countdownLabel(20)).toEqual({ value: '20', unit: 'min' });
    expect(countdownLabel(80)).toEqual({ value: '1 h 20', unit: 'para la cita' });
    expect(countdownLabel(120)).toEqual({ value: '2 h', unit: 'para la cita' });
  });
});

import { clinicSiteSchema, slugify } from '../schemas/site';

describe('web del consultorio', () => {
  it('arma la dirección desde el nombre', () => {
    expect(slugify('Consultorio Dental Sonrisa')).toBe('consultorio-dental-sonrisa');
    expect(slugify('  Odontología Pérez & Ñahui ')).toBe('odontologia-perez-nahui');
  });
  it('valida la dirección y el enlace de Maps', () => {
    const base = { slug: 'sonrisa-puno', published: true, headline: '', about: '', hours: '', city: 'Puno', maps_url: '', show_prices: true };
    expect(clinicSiteSchema.safeParse(base).success).toBe(true);
    expect(clinicSiteSchema.safeParse({ ...base, slug: 'Sonrisa Puno' }).success).toBe(false);
    expect(clinicSiteSchema.safeParse({ ...base, maps_url: 'maps.google.com/x' }).success).toBe(false);
  });
});
