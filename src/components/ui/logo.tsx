/* eslint-disable @next/next/no-img-element -- URL firmada de Storage: next/image no aporta aquí */
import { cn } from '@/lib/cn';

export const PRODUCT_NAME = 'Fichadent';

/** Isotipo de Fichadent: ficha con una muela. Usa el color de marca activo. */
export function LogoMark({ size = 52, className }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" aria-hidden className={cn('text-brand-700', className)}>
      <rect x="4" y="4" width="40" height="40" rx="12" fill="currentColor" />
      <path
        d="M15.5 17.2c0-3.3 3.1-4.8 8.5-3.6 5.4-1.2 8.5.3 8.5 3.6 0 4.2-1.8 6.2-2.4 10.2-.5 3.3-1.1 5.9-2.7 5.9-1.8 0-1.8-5.3-3.4-5.3s-1.6 5.3-3.4 5.3c-1.6 0-2.2-2.6-2.7-5.9-.6-4-2.4-6-2.4-10.2Z"
        fill="#fff"
      />
    </svg>
  );
}

/** Isotipo + "Fichadent" (+ bajada). */
export function Logo({ className, compact }: { className?: string; compact?: boolean }) {
  return (
    <div className={cn('flex items-center gap-3', className)}>
      <LogoMark size={compact ? 36 : 48} />
      <div className="flex flex-col gap-1">
        <span className={cn('leading-none font-extrabold tracking-[-.02em] text-ink', compact ? 'text-xl' : 'text-[28px]')}>
          {PRODUCT_NAME}
        </span>
        {compact ? null : <span className="text-[11px] font-bold tracking-[.22em] text-ink-muted">HISTORIA CLÍNICA DENTAL</span>}
      </div>
    </div>
  );
}

/** Logo del consultorio. Sin logo subido → recuadro "Tu logo aquí". */
export function ClinicLogo({
  url,
  name,
  size = 56,
  className,
}: {
  url: string | null;
  name: string;
  size?: number;
  className?: string;
}) {
  if (url) {
    return (
      <img
        src={url}
        alt={`Logo de ${name}`}
        width={size}
        height={size}
        className={cn('rounded-2xl bg-surface object-contain', className)}
        style={{ width: size, height: size }}
      />
    );
  }
  return (
    <span
      className={cn(
        'flex shrink-0 flex-col items-center justify-center rounded-2xl border-[1.5px] border-dashed border-brand-500 bg-brand-25 text-center leading-tight font-bold text-brand-700',
        className,
      )}
      style={{ width: size, height: size, fontSize: Math.max(9, Math.round(size / 5.5)) }}
      title="Sube tu logo en Ajustes"
    >
      Tu logo
      <br />
      aquí
    </span>
  );
}
