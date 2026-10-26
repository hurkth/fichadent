'use client';

import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useRef, useState } from 'react';
import { Plus, Search, X } from 'lucide-react';
import { ClinicLogo } from '@/components/ui/logo';
import { cn } from '@/lib/cn';
import { useClinic } from './clinic-context';
import { NAV_ITEMS } from './nav-items';
import { UserMenu } from './user-menu';

/** Botón "+" según la pantalla: nuevo paciente, nueva cita o nueva visita. */
function plusAction(path: string): { href: string; label: string } {
  const visit = path.match(/^\/pacientes\/([0-9a-f-]{36})(?:\/|$)/);
  if (visit && !path.includes('/visitas/') && !path.endsWith('/editar')) return { href: `/pacientes/${visit[1]}/visitas/nueva`, label: 'Nueva visita' };
  if (path.startsWith('/agenda')) return { href: '/agenda?nueva=1', label: 'Nueva cita' };
  return { href: '/pacientes/nuevo', label: 'Nuevo paciente' };
}

/**
 * Buscador del dock. En /inicio escribe en ?q= (lo lee HomeSearch y muestra resultados flotantes);
 * en el resto de pantallas lleva a /inicio?q=.
 */
function DockSearch() {
  const path = usePathname();
  const params = useSearchParams();
  const router = useRouter();
  const onHome = path === '/inicio';
  const urlQ = onHome ? (params.get('q') ?? '') : '';
  const [q, setQ] = useState(urlQ);
  const ref = useRef<HTMLInputElement>(null);

  useEffect(() => setQ(urlQ), [urlQ]);

  const change = (value: string) => {
    setQ(value);
    if (onHome) {
      const url = new URL(window.location.href);
      if (value.trim()) url.searchParams.set('q', value);
      else url.searchParams.delete('q');
      window.history.replaceState(null, '', url);
    } else if (value.trim()) {
      router.push(`/inicio?q=${encodeURIComponent(value)}`);
    }
  };

  return (
    <label className="glass-float flex h-[68px] min-w-0 flex-1 items-center gap-3 rounded-full pr-2.5 pl-6 text-ink-muted">
      <Search className="size-[22px] shrink-0" strokeWidth={2.2} aria-hidden />
      <input
        ref={ref}
        type="search"
        aria-label="Buscar paciente por nombre, DNI o celular"
        placeholder="Buscar por nombre, DNI o celular"
        autoComplete="off"
        enterKeyHint="search"
        autoFocus={onHome && !!urlQ}
        value={q}
        onChange={(e) => change(e.target.value)}
        onKeyDown={(e) => e.key === 'Escape' && change('')}
        className="h-full min-w-0 flex-1 border-0 bg-transparent text-lg font-semibold text-ink outline-none [&::-webkit-search-cancel-button]:hidden"
      />
      {q ? (
        <button
          type="button"
          aria-label="Borrar búsqueda"
          onClick={() => {
            change('');
            ref.current?.focus();
          }}
          className="flex size-12 shrink-0 cursor-pointer items-center justify-center rounded-full border-0 bg-fill text-ink"
        >
          <X className="size-5" aria-hidden />
        </button>
      ) : null}
    </label>
  );
}

/** Tablet (≥ 768 px): dock flotante abajo — logo, pestañas y cuenta · buscador · "+". */
export function Dock() {
  const path = usePathname();
  const { clinic } = useClinic();
  const plus = plusAction(path);

  return (
    <div className="fixed inset-x-10 bottom-5 z-40 hidden h-[68px] items-center gap-3 md:flex">
      <nav aria-label="Principal" className="glass-float flex h-[68px] shrink-0 items-center gap-0.5 rounded-full p-1.5">
        <Link href="/inicio" aria-label={`${clinic.name}, ir al inicio`} className="mr-1 flex no-underline">
          <ClinicLogo url={clinic.logoUrl} name={clinic.name} size={52} className="rounded-full" />
        </Link>
        {NAV_ITEMS.map(({ href, label, icon: Icon, match }) => {
          const on = match(path);
          return (
            <Link
              key={href}
              href={href}
              aria-current={on ? 'page' : undefined}
              className={cn(
                'flex h-14 flex-col items-center justify-center gap-0.5 rounded-full px-5 text-[11px] no-underline',
                on ? 'bg-brand-700/15 font-bold text-brand-900 shadow-[inset_0_1px_0_rgba(255,255,255,.8)]' : 'font-semibold text-ink hover:bg-white/60',
              )}
            >
              <Icon className="size-[22px]" strokeWidth={on ? 2.2 : 1.9} aria-hidden />
              {label}
            </Link>
          );
        })}
        <span className="ml-1">
          <UserMenu placement="up" />
        </span>
      </nav>
      <Suspense fallback={<div className="glass-float h-[68px] flex-1 rounded-full" />}>
        <DockSearch />
      </Suspense>
      <Link
        href={plus.href}
        aria-label={plus.label}
        title={plus.label}
        className="btn-glow flex size-[68px] shrink-0 items-center justify-center rounded-full bg-brand-700 text-white no-underline hover:bg-brand-900"
      >
        <Plus className="size-7" strokeWidth={2.4} aria-hidden />
      </Link>
    </div>
  );
}

/** Móvil (< 768 px): barra de vidrio flotante con 3 pestañas + "+". */
export function MobileDock() {
  const path = usePathname();
  const plus = plusAction(path);
  return (
    <div className="fixed inset-x-4 bottom-[max(16px,env(safe-area-inset-bottom))] z-40 flex h-16 items-center gap-2.5 md:hidden">
      <nav aria-label="Principal" className="glass-float flex h-16 flex-1 items-center rounded-full p-1.5">
        {NAV_ITEMS.map(({ href, label, icon: Icon, match }) => {
          const on = match(path);
          return (
            <Link
              key={href}
              href={href}
              aria-current={on ? 'page' : undefined}
              className={cn(
                'flex h-[52px] flex-1 flex-col items-center justify-center gap-0.5 rounded-full text-[11px] no-underline',
                on ? 'bg-brand-700/15 font-bold text-brand-900' : 'font-semibold text-ink',
              )}
            >
              <Icon className="size-[22px]" aria-hidden />
              {label}
            </Link>
          );
        })}
      </nav>
      <Link href={plus.href} aria-label={plus.label} className="btn-glow flex size-16 shrink-0 items-center justify-center rounded-full bg-brand-700 text-white no-underline">
        <Plus className="size-7" strokeWidth={2.4} aria-hidden />
      </Link>
    </div>
  );
}
