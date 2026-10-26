import Link from 'next/link';
import { Menu } from 'lucide-react';
import { LogoMark } from '@/components/ui/logo';
import { LOGIN_HREF, SIGNUP_HREF } from './links';

const LINKS = [
  { href: '/#funciones', label: 'Funciones' },
  { href: '/#como-funciona', label: 'Cómo funciona' },
  { href: '/#precios', label: 'Precios' },
  { href: '/#preguntas', label: 'Preguntas' },
];

/** Cápsula de vidrio fija arriba. En móvil, los enlaces van en un menú nativo (<details>, sin JS). */
export function SiteNav() {
  return (
    <header className="sticky top-3 z-40 mx-auto w-full max-w-[1200px] px-4 pt-5 md:px-6">
      <nav aria-label="Principal" className="glass-float flex min-h-[68px] items-center justify-between gap-3 rounded-full py-2 pr-2 pl-4 md:pl-5">
        <Link href="/" className="flex items-center gap-2.5 text-ink no-underline" aria-label="Fichadent, inicio">
          <LogoMark size={40} />
          <span className="hidden text-[19px] font-extrabold tracking-[-0.03em] min-[380px]:inline">Fichadent</span>
        </Link>

        <ul className="m-0 hidden list-none items-center gap-1 p-0 text-[15px] font-semibold lg:flex">
          {LINKS.map((l) => (
            <li key={l.href}>
              <Link href={l.href} className="rounded-full px-3.5 py-3 text-ink no-underline hover:bg-white/60">
                {l.label}
              </Link>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-1.5">
          <Link href={LOGIN_HREF} className="hidden min-h-[52px] items-center rounded-full px-4 text-[15px] font-semibold text-ink no-underline hover:bg-white/60 sm:flex">
            Iniciar sesión
          </Link>
          <Link href={SIGNUP_HREF} className="btn-glow flex min-h-[52px] items-center rounded-full bg-brand-700 px-4 text-[15px] font-bold whitespace-nowrap text-white no-underline hover:bg-brand-900 sm:px-5">
            Prueba gratis
          </Link>
          <details className="relative lg:hidden">
            <summary className="flex size-[52px] cursor-pointer list-none items-center justify-center rounded-full bg-white/70 text-ink [&::-webkit-details-marker]:hidden" aria-label="Abrir menú">
              <Menu className="size-6" aria-hidden />
            </summary>
            <ul className="glass-float absolute top-[60px] right-0 m-0 flex w-60 list-none flex-col gap-1 rounded-[28px] p-2">
              {LINKS.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="flex min-h-12 items-center rounded-2xl px-4 text-base font-semibold text-ink no-underline hover:bg-white/70">
                    {l.label}
                  </Link>
                </li>
              ))}
              <li>
                <Link href={LOGIN_HREF} className="flex min-h-12 items-center rounded-2xl px-4 text-base font-semibold text-ink no-underline hover:bg-white/70">
                  Iniciar sesión
                </Link>
              </li>
            </ul>
          </details>
        </div>
      </nav>
    </header>
  );
}
