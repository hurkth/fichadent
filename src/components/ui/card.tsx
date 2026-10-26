import type { HTMLAttributes, ElementType } from 'react';
import { cn } from '@/lib/cn';

export interface CardProps extends HTMLAttributes<HTMLElement> {
  as?: ElementType;
}

/** Superficie de vidrio (iOS 27) con radio 28 px. */
export function Card({ as: Tag = 'div', className, ...props }: CardProps) {
  return <Tag className={cn('glass-card rounded-[28px]', className)} {...props} />;
}
