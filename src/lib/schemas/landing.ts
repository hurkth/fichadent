import { z } from 'zod';

const text = (max: number, label = 'Este texto') => z.string().trim().min(1, `${label} no puede quedar vacío`).max(max, `Máximo ${max} caracteres`);
const lines = (maxItems: number, maxLen: number) => z.array(z.string().trim().min(1).max(maxLen)).max(maxItems);

/** /admin/landing: contenido editable de la landing de Fichadent. */
export const landingSchema = z.object({
  seo: z.object({ title: text(70, 'El título SEO'), description: text(170, 'La descripción SEO') }),
  hero: z.object({
    eyebrow: text(80),
    titleStart: text(80),
    titleHighlight: text(60),
    titleEnd: z.string().trim().max(40),
    subtitle: text(260),
    primaryCta: text(40),
    secondaryCta: text(40),
    checks: lines(4, 60),
  }),
  plansTitle: text(80),
  plansSubtitle: text(120),
  plans: z
    .array(
      z.object({
        id: z.string().trim().regex(/^[a-z0-9-]{2,40}$/),
        name: text(40, 'El nombre del plan'),
        price: z.number().min(0).max(99999).nullable(),
        featured: z.boolean().optional(),
        features: lines(10, 80),
        cta: z.object({ label: text(40), kind: z.enum(['signup', 'whatsapp']) }),
      }),
    )
    .min(1, 'Deja al menos un plan')
    .max(3),
  origin: z.object({ eyebrow: text(50), title: text(100), text: text(400), bullets: lines(4, 60) }),
  faqs: z.array(z.object({ q: text(120, 'La pregunta'), a: text(600, 'La respuesta') })).max(12),
  finalCta: z.object({ titleStart: text(60), titleHighlight: text(40), subtitle: text(120) }),
});

export type LandingInput = z.input<typeof landingSchema>;
