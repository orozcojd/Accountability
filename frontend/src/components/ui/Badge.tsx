/**
 * Badge/Tag Component
 * Used for: Re-election indicators, status labels, party affiliation
 */

import { cn } from '@/lib/utils';

export type BadgeVariant = 'info' | 'warning' | 'success' | 'neutral';

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  className?: string;
}

const variantStyles: Record<BadgeVariant, string> = {
  info: 'bg-info-light text-info border-info/20',
  warning: 'bg-warning-light text-warning border-warning/20',
  success: 'bg-success-light text-success border-success/20',
  neutral: 'bg-light-gray text-dark-gray border-medium-gray/20',
};

export function Badge({ children, variant = 'info', className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center px-3 py-1 rounded-full text-body-small font-semibold border',
        variantStyles[variant],
        className
      )}
    >
      {children}
    </span>
  );
}
