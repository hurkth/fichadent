import 'server-only';
import { cache } from 'react';
import { createClient } from '@/lib/supabase/server';
import type { ClinicPlan, ClinicSession } from '@/types/domain';

interface MySessionRow {
  user_id: string;
  display_name: string;
  role: ClinicSession['role'];
  clinic: {
    id: string;
    name: string;
    phone: string | null;
    address: string | null;
    logo_path: string | null;
    brand_color: string;
    plan: ClinicPlan;
    trial_ends_at: string;
    trial_days_left: number;
  };
}

/**
 * Usuario logueado + su consultorio (rpc my_session).
 * null = sin sesión o sin consultorio activo.
 */
export const getSession = cache(async (): Promise<ClinicSession | null> => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase.rpc('my_session');
  if (error || !data) return null;
  const row = data as unknown as MySessionRow;

  let logoUrl: string | null = null;
  if (row.clinic.logo_path) {
    const { data: signed } = await supabase.storage.from('patient-files').createSignedUrl(row.clinic.logo_path, 60 * 60);
    logoUrl = signed?.signedUrl ?? null;
  }

  return {
    userId: row.user_id,
    displayName: row.display_name,
    role: row.role,
    email: user.email ?? '',
    clinic: {
      id: row.clinic.id,
      name: row.clinic.name,
      phone: row.clinic.phone,
      address: row.clinic.address,
      logoPath: row.clinic.logo_path,
      logoUrl,
      brandColor: row.clinic.brand_color,
      plan: row.clinic.plan,
      trialEndsAt: row.clinic.trial_ends_at,
      trialDaysLeft: row.clinic.trial_days_left,
    },
  };
});
