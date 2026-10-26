'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { LogOut, Settings } from 'lucide-react';
import { signOut } from '@/lib/actions/auth';
import { cn } from '@/lib/cn';
import { nameInitials } from '@/lib/format';
import { useClinic } from './clinic-context';

/** Avatar con iniciales → consultorio, Ajustes y cerrar sesión. */
export function UserMenu({ size = 'md' }: { size?: 'sm' | 'md' }) {
  const { displayName, email, clinic } = useClinic();
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
          'flex cursor-pointer items-center justify-center rounded-full border-0 bg-brand-50 font-extrabold text-brand-900',
          size === 'md' ? 'size-12 text-[13px]' : 'size-11 text-xs',
        )}
      >
        {nameInitials(displayName)}
      </button>
      {open ? (
        <div
          className={cn(
            'absolute z-40 w-64 rounded-2xl border border-line-card bg-surface p-2 shadow-[0_12px_30px_rgba(17,17,17,.12)]',
            size === 'md' ? 'bottom-0 left-[60px]' : 'top-[52px] right-0',
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
