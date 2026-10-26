import 'server-only';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import type { Database } from '@/types/database';
import { supabaseEnv } from './env';

/** Cliente para Server Components, Server Actions y Route Handlers. */
export async function createClient() {
  const cookieStore = await cookies();
  return createServerClient<Database>(
    supabaseEnv().url,
    supabaseEnv().key,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (toSet) => {
          try {
            toSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
          } catch {
            // Llamado desde un Server Component: el middleware refresca la sesión.
          }
        },
      },
    },
  );
}
