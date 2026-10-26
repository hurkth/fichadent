import { NextResponse, type NextRequest } from 'next/server';
import { isMarketingPath, updateSession } from '@/lib/supabase/middleware';

export async function middleware(request: NextRequest) {
  // Vista previa de pantallas con datos de ejemplo: solo en desarrollo, sin Supabase.
  if (request.nextUrl.pathname.startsWith('/dev')) {
    return process.env.NODE_ENV === 'development'
      ? NextResponse.next()
      : new NextResponse(null, { status: 404 });
  }
  // Páginas públicas (landing, webs de consultorios, SEO): no se consulta Supabase, con o sin sesión.
  if (isMarketingPath(request.nextUrl.pathname)) return NextResponse.next();
  return updateSession(request);
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|icon.svg|.*\\.(?:svg|png|jpg|jpeg|webp)$).*)'],
};
