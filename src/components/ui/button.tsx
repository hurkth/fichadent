import Link from 'next/link';
import { forwardRef, type AnchorHTMLAttributes, type ButtonHTMLAttributes, type ComponentProps } from 'react';
import { LoaderCircle } from 'lucide-react';
import { cn } from '@/lib/cn';

export type ButtonVariant = 'primary' | 'secondary' | 'whatsapp' | 'ghost' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg' | 'icon';

const VARIANTS: Record<ButtonVariant, string> = {
  primary: 'btn-glow bg-brand-700 text-white border-transparent hover:bg-brand-900',
  secondary: 'bg-white/85 text-ink border-transparent shadow-[inset_0_1px_0_#fff,0_2px_8px_rgba(20,40,60,.08)] hover:bg-white',
  whatsapp: 'bg-whatsapp text-white border-transparent shadow-[inset_0_1px_0_rgba(255,255,255,.3)] hover:brightness-110',
  ghost: 'bg-transparent text-brand-700 border-transparent hover:text-brand-900',
  danger: 'bg-alert text-white border-transparent hover:brightness-110',
};

const SIZES: Record<ButtonSize, string> = {
  sm: 'min-h-12 px-5 text-[15px] rounded-full',
  md: 'min-h-[52px] px-6 text-base rounded-full',
  lg: 'min-h-16 px-8 text-lg rounded-full',
  icon: 'size-[52px] p-0 rounded-full',
};

/** Clases del botón, reutilizables en enlaces y en <label> que abren archivos. */
export function buttonClasses(variant: ButtonVariant = 'primary', size: ButtonSize = 'md', className?: string) {
  return cn(
    'inline-flex items-center justify-center gap-2 border-[1.5px] font-bold whitespace-nowrap no-underline',
    'cursor-pointer transition-colors disabled:cursor-not-allowed disabled:opacity-50',
    'aria-disabled:pointer-events-none aria-disabled:opacity-50',
    VARIANTS[variant],
    SIZES[size],
    className,
  );
}

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  /** Deshabilita y muestra un spinner: evita doble envío. */
  loading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = 'primary', size = 'md', loading = false, disabled, className, children, type = 'button', ...props },
  ref,
) {
  return (
    <button
      ref={ref}
      type={type}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={buttonClasses(variant, size, className)}
      {...props}
    >
      {loading ? <LoaderCircle className="size-5 animate-spin" aria-hidden /> : null}
      {children}
    </button>
  );
});

type LinkProps = ComponentProps<typeof Link>;

export interface ButtonLinkProps extends Omit<LinkProps, 'className'> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
  disabled?: boolean;
}

/** Enlace interno con aspecto de botón. */
export function ButtonLink({ variant = 'primary', size = 'md', className, disabled, ...props }: ButtonLinkProps) {
  return (
    <Link
      aria-disabled={disabled || undefined}
      tabIndex={disabled ? -1 : undefined}
      className={buttonClasses(variant, size, className)}
      {...props}
    />
  );
}

export interface ButtonAnchorProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
}

/** Enlace externo (wa.me, tel:) con aspecto de botón. */
export function ButtonAnchor({ variant = 'primary', size = 'md', className, disabled, href, ...props }: ButtonAnchorProps) {
  return (
    <a
      href={disabled ? undefined : href}
      aria-disabled={disabled || undefined}
      className={buttonClasses(variant, size, className)}
      {...props}
    />
  );
}
