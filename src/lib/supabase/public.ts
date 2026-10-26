import 'server-only';
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database';
import { supabaseEnv } from './env';

/**
 * Cliente sin sesión (rol anon) para páginas públicas: landing y webs de consultorios.
 * No lee cookies, así la página se puede cachear. Corta a los 4 s para no colgar el render.
 */
export function createPublicClient() {
  const { url, key } = supabaseEnv();
  return createClient<Database>(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: { fetch: (input, init) => fetch(input, { ...init, signal: AbortSignal.timeout(4000) }) },
  });
}
