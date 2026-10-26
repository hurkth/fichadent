import { z } from 'zod';

const price = z
  .number({ error: 'Precio no válido' })
  .min(0, 'El precio no puede ser negativo')
  .max(999999, 'Precio demasiado alto')
  .nullable();

/** Ajustes › Precios: una fila por intervención. */
export const servicePricesSchema = z
  .array(
    z.object({
      serviceId: z.string().uuid(),
      price,
      hidden: z.boolean(),
    }),
  )
  .max(500);

export type ServicePriceInput = z.input<typeof servicePricesSchema>[number];

/** Ajustes › Precios › Agregar intervención propia del consultorio. */
export const newServiceSchema = z.object({
  name: z.string().trim().min(2, 'Escribe el nombre de la intervención').max(80, 'Máximo 80 caracteres'),
  category: z.string().trim().min(2, 'Elige o escribe una categoría').max(40, 'Máximo 40 caracteres'),
  requiresTooth: z.boolean(),
  price,
});

export type NewServiceInput = z.input<typeof newServiceSchema>;
