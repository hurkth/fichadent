/**
 * Variables de Supabase. Acepta el nombre nuevo (PUBLISHABLE_KEY, llaves sb_publishable_…)
 * y el antiguo (ANON_KEY). Se leen de forma literal para que Next las incluya en el navegador.
 */
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export function supabaseEnv(): { url: string; key: string } {
  if (!url || !/^https:\/\/[a-z0-9-]+\.supabase\.co\/?$/.test(url.trim())) {
    throw new Error(
      'NEXT_PUBLIC_SUPABASE_URL falta o no es válida. Debe ser solo la URL del proyecto, por ejemplo ' +
        'https://abcdefghijkl.supabase.co (Supabase > Project Settings > API > Project URL). Revisa .env.local y reinicia npm run dev.',
    );
  }
  if (!key) {
    throw new Error(
      'Falta la llave pública de Supabase. Define NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY (sb_publishable_…) ' +
        'o NEXT_PUBLIC_SUPABASE_ANON_KEY en .env.local y reinicia npm run dev.',
    );
  }
  return { url: url.trim().replace(/\/$/, ''), key: key.trim() };
}
