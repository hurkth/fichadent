'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { ExternalLink, Globe, LogOut, PenLine, Settings, Tags } from 'lucide-react';
import { signOut } from '@/lib/actions/auth';
import { cn } from '@/lib/cn';
import { nameInitials } from '@/lib/format';
import { useOnlineStatus } from '@/hooks/use-online-status';
import { useClinic } from './clinic-context';

/** Avatar con iniciales → consultorio, Ajustes y cerrar sesión. */
export function UserMenu({ size = 'md', placement = 'down' }: { size?: 'sm' | 'md'; placement?: 'up' | 'down' }) {
  const online = useOnlineStatus();
  const { displayName, email, clinic, isPlatformAdmin } = useClinic();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        aria-label="Cuenta, ajustes y cerrar sesión"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className={cn(
          'relative flex cursor-pointer items-center justify-center rounded-full border-0 bg-brand-700 font-extrabold text-white shadow-[inset_0_1px_0_rgba(255,255,255,.4)]',
          size === 'md' ? 'size-12 text-[13px]' : 'size-11 text-xs',
        )}
      >
        {nameInitials(displayName)}
        <span
          aria-label={online ? 'En línea' : 'Sin conexión'}
          role="status"
          className={cn('absolute -right-0.5 -bottom-0.5 size-3.5 rounded-full border-2 border-white', online ? 'bg-live' : 'bg-warn')}
        />
      </button>
      {open ? (
        <div
          className={cn(
            'glass-float absolute z-50 w-64 rounded-[24px] p-2',
            placement === 'up' ? 'right-0 bottom-[64px]' : 'top-[56px] right-0',
          )}
        >
          <div className="flex flex-col gap-0.5 px-3 pt-2 pb-3">
            <span className="text-base font-extrabold text-ink">{displayName}</span>
            <span className="truncate text-sm font-semibold text-ink-muted">{clinic.name}</span>
            <span className="truncate text-xs font-medium text-ink-subtle">{email}</span>
          </div>
          <Link
            href="/ajustes"
            onClick={() => setOpen(false)}
            className="flex min-h-12 items-center gap-3 rounded-xl px-3 text-base font-bold text-ink no-underline hover:bg-bg"
          >
            <Settings className="size-5" aria-hidden />
            Ajustes del consultorio
          </Link>
          <Link
            href="/ajustes?seccion=precios"
            onClick={() => setOpen(false)}
            className="flex min-h-12 items-center gap-3 rounded-xl px-3 text-base font-bold text-ink no-underline hover:bg-bg"
          >
            <Tags className="size-5" aria-hidden />
            Precios de intervenciones
          </Link>
          <Link
            href="/ajustes?seccion=web"
            onClick={() => setOpen(false)}
            className="flex min-h-12 items-center gap-3 rounded-xl px-3 text-base font-bold text-ink no-underline hover:bg-bg"
          >
            <Globe className="size-5" aria-hidden />
            Mi web
          </Link>
          {isPlatformAdmin ? (
            <Link
              href="/admin/landing"
              onClick={() => setOpen(false)}
              className="flex min-h-12 items-center gap-3 rounded-xl px-3 text-base font-bold text-ink no-underline hover:bg-bg"
            >
              <PenLine className="size-5" aria-hidden />
              Editar landing de Fichadent
            </Link>
          ) : null}
          <Link
            href="/"
            onClick={() => setOpen(false)}
            className="flex min-h-12 items-center gap-3 rounded-xl px-3 text-base font-bold text-ink no-underline hover:bg-bg"
          >
            <ExternalLink className="size-5" aria-hidden />
            Ver fichadent.com
          </Link>
          <form action={signOut}>
            <button
              type="submit"
              className="flex min-h-12 w-full cursor-pointer items-center gap-3 rounded-xl border-0 bg-transparent px-3 text-left text-base font-bold text-ink hover:bg-bg"
            >
              <LogOut className="size-5" aria-hidden />
              Cerrar sesión
            </button>
          </form>
        </div>
      ) : null}
    </div>
  );
}
