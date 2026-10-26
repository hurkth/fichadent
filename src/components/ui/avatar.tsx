import { cn } from '@/lib/cn';

const SIZES = {
  xs: 'size-8 text-[11px]',
  sm: 'size-11 text-[13px]',
  md: 'size-12 text-[15px]',
  lg: 'size-[52px] text-base',
  xl: 'size-14 text-[17px]',
  '2xl': 'size-16 text-[21px]',
  poster: 'size-14 text-[19px]',
  hero: 'size-24 text-[32px]',
};

/** Degradados de avatar (spec 03 §2.5). 0 = color del consultorio. Iniciales blancas con contraste AA. */
const TONES = [
  'linear-gradient(160deg, color-mix(in oklab, var(--color-brand-700) 70%, white), var(--color-brand-700))',
  'linear-gradient(160deg, #8E8CFF, #4F4DD6)',
  'linear-gradient(160deg, #F07C98, #B63A61)',
  'linear-gradient(160deg, #E0A040, #93600B)',
  'linear-gradient(160deg, #A1A1A6, #636366)',
  'linear-gradient(160deg, #5FA6F7, #2563C9)',
];

/** Tono estable a partir de un texto (id o nombre). */
export function avatarTone(seed: string): number {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  return h % TONES.length;
}

export interface AvatarProps {
  initials: string;
  size?: keyof typeof SIZES;
  /** Texto para elegir el color (nombre completo o id). Sin él, usa las iniciales. */
  seed?: string;
  className?: string;
}

/** Círculo con degradado e iniciales. Decorativo: el nombre siempre está al lado. */
export function Avatar({ initials, size = 'lg', seed, className }: AvatarProps) {
  return (
    <span
      aria-hidden
      className={cn(
        'flex shrink-0 items-center justify-center rounded-full font-extrabold tracking-[-0.02em] text-white shadow-[inset_0_1px_0_rgba(255,255,255,.45),0_6px_14px_rgba(0,0,0,.12)]',
        SIZES[size],
        className,
      )}
      style={{ background: TONES[avatarTone(seed ?? initials)] }}
    >
      {initials}
    </span>
  );
}
