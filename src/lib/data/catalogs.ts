import 'server-only';
import { createClient } from '@/lib/supabase/server';
import type { Service } from '@/types/domain';

export type ServiceOption = Pick<Service, 'id' | 'name' | 'category' | 'requires_tooth' | 'sort_order'> & {
  /** Precio del consultorio (o el sugerido del catálogo). null = sin precio. */
  price: number | null;
};

export interface ServiceSetting extends ServiceOption {
  hidden: boolean;
  /** Intervención creada por el consultorio (no del catálogo global). */
  own: boolean;
}

/** Catálogo completo con el precio y la visibilidad de este consultorio (Ajustes › Precios). */
export async function getServiceSettings(): Promise<ServiceSetting[]> {
  const supabase = await createClient();
  const [services, settings] = await Promise.all([
    supabase.from('services').select('id, clinic_id, name, category, requires_tooth, sort_order, default_price').eq('active', true).order('sort_order'),
    supabase.from('clinic_services').select('service_id, price, hidden'),
  ]);
  if (services.error) throw services.error;
  // Si la migración 0003 aún no corre, el catálogo sigue funcionando sin precios.
  const byService = new Map((settings.error ? [] : settings.data ?? []).map((s) => [s.service_id, s]));

  return (services.data ?? []).map((s) => {
    const own = byService.get(s.id);
    return {
      id: s.id,
      name: s.name,
      category: s.category,
      requires_tooth: s.requires_tooth,
      sort_order: s.sort_order,
      price: own?.price ?? s.default_price ?? null,
      hidden: own?.hidden ?? false,
      own: s.clinic_id !== null,
    };
  });
}

/** Servicios visibles con su precio, para los chips de Nueva visita. */
export async function getServicesCatalog(): Promise<ServiceOption[]> {
  const all = await getServiceSettings();
  return all
    .filter((s) => !s.hidden)
    .map((s) => ({ id: s.id, name: s.name, category: s.category, requires_tooth: s.requires_tooth, sort_order: s.sort_order, price: s.price }));
}
