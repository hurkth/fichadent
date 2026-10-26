import type { ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/cn';

const TONES = {
  neutral: 'bg-surface-2 text-ink-muted',
  gold: 'bg-brand-50 text-brand-700',
  pink: 'bg-brand-50 text-brand-900',
  alert: 'bg-alert-50 text-alert',
};

export interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  /** Botones; ocupan el ancho de la tarjeta. */
  actions?: ReactNode;
  tone?: keyof typeof TONES;
  className?: string;
}

/** Vacíos y "sin resultados" (F07): título corto, una línea y una acción. */
export function EmptyState({ icon: Icon, title, description, actions, tone = 'neutral', className }: EmptyStateProps) {
  return (
    <section
      className={cn(
        'flex flex-col items-center justify-center gap-3 glass-card rounded-[28px] px-6 py-10 text-center',
        tone === 'alert' ? 'border-alert-200' : 'border-line-card',
        className,
      )}
    >
      <span className={cn('flex size-[72px] items-center justify-center rounded-full', TONES[tone])}>
        <Icon className="size-8" aria-hidden />
      </span>
      <h2 className="m-0 text-[19px] font-extrabold md:text-[22px]">{title}</h2>
      {description ? <p className="m-0 max-w-[420px] text-[15px] leading-normal font-medium text-ink-muted md:text-base">{description}</p> : null}
      {actions ? <div className="mt-1.5 flex w-full max-w-sm flex-col gap-3 sm:w-auto sm:max-w-none sm:flex-row">{actions}</div> : null}
    </section>
  );
}
