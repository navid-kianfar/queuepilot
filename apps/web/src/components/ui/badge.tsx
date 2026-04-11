import { cn } from '@/lib/utils';

type BadgeVariant = 'default' | 'success' | 'warning' | 'error' | 'info' | 'outline';

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  dot?: boolean;
  className?: string;
}

const variants: Record<BadgeVariant, string> = {
  default: 'bg-muted text-muted-foreground',
  success: 'bg-emerald-500/10 text-emerald-500',
  warning: 'bg-orange-500/10 text-orange-500',
  error: 'bg-red-500/10 text-red-500',
  info: 'bg-blue-500/10 text-blue-500',
  outline: 'border border-border text-muted-foreground',
};

export function Badge({ children, variant = 'default', dot, className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[10px] font-medium',
        variants[variant],
        className,
      )}
    >
      {dot && (
        <span className={cn('h-1.5 w-1.5 rounded-full', {
          'bg-muted-foreground': variant === 'default' || variant === 'outline',
          'bg-emerald-500': variant === 'success',
          'bg-orange-500': variant === 'warning',
          'bg-red-500': variant === 'error',
          'bg-blue-500': variant === 'info',
        })} />
      )}
      {children}
    </span>
  );
}
