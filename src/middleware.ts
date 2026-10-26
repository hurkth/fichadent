import { NextResponse, type NextRequest } from 'next/server';
import { isMarketingPath, updateSession } from '@/lib/supabase/middleware';

export async function middleware(request: NextRequest) {
  // Vista previa de pantallas con datos de ejemplo: solo en desarrollo, sin Supabase.
  if (request.nextUrl.pathname.startsWith('/dev')) {
    return process.env.NODE_ENV === 'development'
      ? NextResponse.next()
      : new NextResponse(null, { status: 404 });
  }
  // Páginas de marketing sin cookie de sesión: no se consulta Supabase (más rápido para Google).
  const path = request.nextUrl.pathname;
  const hasAuthCookie = request.cookies.getAll().some((c) => c.name.startsWith('sb-'));
  if (path !== '/' && isMarketingPath(path)) return NextResponse.next();
  if (path === '/' && !hasAuthCookie) return NextResponse.next();
  return updateSession(request);
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|icon.svg|.*\\.(?:svg|png|jpg|jpeg|webp)$).*)'],
};
