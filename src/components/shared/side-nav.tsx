'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ClinicLogo } from '@/components/ui/logo';
import { cn } from '@/lib/cn';
import { useClinic } from './clinic-context';
import { ConnectionIndicator } from './connection-indicator';
import { NAV_ITEMS } from './nav-items';
import { UserMenu } from './user-menu';

/** Tablet (≥ 768 px): barra lateral de 104 px con el logo del consultorio. */
export function SideNav() {
  const path = usePathname();
  const { clinic } = useClinic();
  return (
    <nav
      aria-label="Principal"
      className="sticky top-0 hidden h-dvh w-[104px] shrink-0 flex-col items-center gap-2 border-r border-line-card bg-surface py-5 md:flex"
    >
      <Link href="/" aria-label={`${clinic.name}, ir al inicio`} className="mb-3 flex items-center justify-center no-underline">
        <ClinicLogo url={clinic.logoUrl} name={clinic.name} size={60} />
      </Link>
      {NAV_ITEMS.map(({ href, label, icon: Icon, match }) => {
        const on = match(path);
        return (
          <Link
            key={href}
            href={href}
            aria-current={on ? 'page' : undefined}
            className={cn(
              'flex h-[72px] w-[84px] flex-col items-center justify-center gap-1.5 rounded-2xl text-xs font-bold no-underline',
              on ? 'bg-brand-50 text-brand-900' : 'text-ink-muted hover:text-ink',
            )}
          >
            <Icon className="size-[22px]" aria-hidden />
            {label}
          </Link>
        );
      })}
      <div className="flex-1" />
      <ConnectionIndicator />
      <UserMenu />
    </nav>
  );
}
