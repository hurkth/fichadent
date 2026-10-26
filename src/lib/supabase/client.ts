'use client';

import { createBrowserClient } from '@supabase/ssr';
import type { Database } from '@/types/database';
import { supabaseEnv } from './env';

let client: ReturnType<typeof createBrowserClient<Database>> | undefined;

/** Cliente de navegador (singleton). Usado por el buscador en vivo y la subida de fotos. */
export function createClient() {
  client ??= createBrowserClient<Database>(
    supabaseEnv().url,
    supabaseEnv().key,
  );
  return client;
}
