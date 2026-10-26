import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import type { Database } from '@/types/database';
import { supabaseEnv } from './env';

/** Cookies propias para "Mantener la sesión iniciada en esta tablet" (F01). */
export const SESSION_COOKIE = 'fd_session'; // cookie de sesión: muere al cerrar el navegador
export const REMEMBER_COOKIE = 'fd_remember'; // persistente: 30 días

const PUBLIC_PATHS = ['/login', '/registro', '/reset-password', '/auth'];

/** Páginas de marketing (landing, SEO). Se sirven sin sesión y sin tocar Supabase. */
const MARKETING_PATHS = [
  '/precios',
  '/software-dental',
  '/historia-clinica-odontologica',
  '/agenda-para-dentistas',
  '/blog',
  '/privacidad',
  '/terminos',
];
const MARKETING_FILES = ['/sitemap.xml', '/robots.txt', '/manifest.webmanifest'];

export function isMarketingPath(path: string): boolean {
  return (
    path === '/' ||
    MARKETING_FILES.includes(path) ||
    path.startsWith('/opengraph-image') ||
    MARKETING_PATHS.some((p) => path === p || path.startsWith(`${p}/`))
  );
}

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient<Database>(
    supabaseEnv().url,
    supabaseEnv().key,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (toSet) => {
          toSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          toSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
        },
      },
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const path = request.nextUrl.pathname;
  const isPublic = PUBLIC_PATHS.some((p) => path === p || path.startsWith(`${p}/`)) || isMarketingPath(path);

  const redirectTo = (pathname: string, search = '') => {
    const url = request.nextUrl.clone();
    url.pathname = pathname;
    url.search = search;
    const res = NextResponse.redirect(url);
    response.cookies.getAll().forEach((c) => res.cookies.set(c));
    return res;
  };

  if (!user && !isPublic) {
    return redirectTo('/login');
  }

  if (user && !isPublic) {
    // Sesión sin "mantener iniciada" y el navegador se cerró: cerrar sesión.
    const keep = request.cookies.has(REMEMBER_COOKIE) || request.cookies.has(SESSION_COOKIE);
    if (!keep) {
      await supabase.auth.signOut();
      return redirectTo('/login');
    }
  }

  // Con sesión: el login, el registro y la landing llevan directo al consultorio.
  if (user && (path === '/' || path === '/login' || path === '/registro')) {
    const keep = request.cookies.has(REMEMBER_COOKIE) || request.cookies.has(SESSION_COOKIE);
    if (keep) return redirectTo('/inicio');
  }

  return response;
}
