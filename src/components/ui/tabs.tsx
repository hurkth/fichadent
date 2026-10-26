import Link from 'next/link';
import { cn } from '@/lib/cn';

export interface TabItem {
  id: string;
  label: string;
  shortLabel?: string;
  count?: number;
}

export interface LinkTabsProps {
  tabs: TabItem[];
  value: string;
  hrefFor: (id: string) => string;
  label: string;
  className?: string;
}

/** Pestañas como enlaces (estado en la URL). Scroll horizontal en móvil. */
export function LinkTabs({ tabs, value, hrefFor, label, className }: LinkTabsProps) {
  return (
    <nav aria-label={label} className={cn('mb-2 flex max-w-full gap-1 self-start overflow-x-auto rounded-full bg-fill p-1 whitespace-nowrap [scrollbar-width:none]', className)}>
      {tabs.map((t) => {
        const on = t.id === value;
        return (
          <Link
            key={t.id}
            href={hrefFor(t.id)}
            replace
            scroll={false}
            aria-current={on ? 'page' : undefined}
            className={cn(
              'flex min-h-11 items-center rounded-full px-4 text-[15px] no-underline md:min-h-12 md:px-5 md:text-base',
              on ? 'bg-white font-extrabold text-ink shadow-[0_2px_10px_rgba(20,40,60,.1)]' : 'font-semibold text-ink-muted hover:text-ink',
            )}
          >
            {t.shortLabel ? (
              <>
                <span className="md:hidden">{t.shortLabel}</span>
                <span className="hidden md:inline">{t.label}</span>
              </>
            ) : (
              t.label
            )}
            {t.count !== undefined ? <span className="ml-1.5 text-ink-muted">· {t.count}</span> : null}
          </Link>
        );
      })}
    </nav>
  );
}
