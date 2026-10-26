import '@fontsource-variable/inter';
import type { Metadata, Viewport } from 'next';
import Link from 'next/link';
import { LogoMark } from '@/components/ui/logo';
import { SiteNav } from '@/components/marketing/site-nav';
import { CITIES } from '@/content/landing';

export const metadata: Metadata = {
  robots: { index: true, follow: true },
};

export const viewport: Viewport = { themeColor: '#ECEEF0' };

/** Páginas públicas (landing y SEO): fondo malla, nav de vidrio y pie. Sin Supabase. */
export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="font-apple marketing-backdrop min-h-dvh overflow-x-clip pb-8 text-[#1D1D1F]">
      <a href="#contenido" className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:rounded-full focus:bg-white focus:px-4 focus:py-3">
        Ir al contenido
      </a>
      <SiteNav />
      <div id="contenido">{children}</div>
      <footer className="mx-auto mt-[110px] w-full max-w-[1200px] px-4 md:px-6">
        <div className="grid grid-cols-1 gap-7 rounded-[36px] bg-white/50 p-8 text-[15px] shadow-[inset_0_1px_0_#fff] sm:grid-cols-2 lg:grid-cols-4 md:p-9">
          <div className="flex flex-col gap-2.5">
            <span className="flex items-center gap-2 text-[19px] font-extrabold tracking-[-0.03em]">
              <LogoMark size={32} />
              Fichadent
            </span>
            <p className="m-0 leading-normal text-ink-muted">Historia clínica dental y agenda para consultorios en Perú.</p>
          </div>
          <nav aria-label="Producto" className="flex flex-col gap-2.5">
            <h2 className="m-0 mb-1 text-[13px] font-extrabold tracking-[0.08em] text-ink-muted">PRODUCTO</h2>
            <Link href="/#funciones" className="font-semibold text-ink no-underline hover:underline">Software dental</Link>
            <Link href="/#historia-clinica" className="font-semibold text-ink no-underline hover:underline">Historia clínica odontológica</Link>
            <Link href="/#agenda" className="font-semibold text-ink no-underline hover:underline">Agenda para dentistas</Link>
            <Link href="/#precios" className="font-semibold text-ink no-underline hover:underline">Precios</Link>
          </nav>
          <div className="flex flex-col gap-2.5">
            <h2 className="m-0 mb-1 text-[13px] font-extrabold tracking-[0.08em] text-ink-muted">EN TODO EL PERÚ</h2>
            <p className="m-0 leading-normal text-ink-muted">
              Software dental para consultorios en {CITIES.map((c) => c.name).join(', ')} y cualquier ciudad del país. Soporte por WhatsApp en horario de Perú.
            </p>
          </div>
          <nav aria-label="Cuenta" className="flex flex-col gap-2.5">
            <h2 className="m-0 mb-1 text-[13px] font-extrabold tracking-[0.08em] text-ink-muted">CUENTA</h2>
            <Link href="/registro" className="font-semibold text-ink no-underline hover:underline">Crear cuenta gratis</Link>
            <Link href="/login" className="font-semibold text-ink no-underline hover:underline">Iniciar sesión</Link>
            <Link href="/#preguntas" className="font-semibold text-ink no-underline hover:underline">Preguntas frecuentes</Link>
          </nav>
        </div>
        <p className="mt-5 text-center text-[13.5px] text-ink-muted">© {new Date().getFullYear()} Fichadent · Hecho en Perú</p>
      </footer>
    </div>
  );
}
