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
