import { cn } from '@/lib/utils';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface MetricCardProps {
  label: string;
  value: string | number;
  change?: number;
  icon?: React.ReactNode;
  className?: string;
}

export function MetricCard({ label, value, change, icon, className }: MetricCardProps) {
  const trend =
    change === undefined || change === 0
      ? 'neutral'
      : change > 0
        ? 'up'
        : 'down';

  return (
    <div
      className={cn(
        'rounded-xl border border-border bg-card p-5 transition-colors hover:bg-accent/30',
        className,
      )}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          {label}
        </span>
        {icon && (
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted text-muted-foreground">
            {icon}
          </div>
        )}
      </div>
      <div className="mt-3 flex items-end gap-2">
        <span className="text-2xl font-bold tracking-tight text-foreground">
          {value}
        </span>
        {change !== undefined && (
          <span
            className={cn(
              'mb-0.5 flex items-center gap-0.5 text-xs font-medium',
              trend === 'up' && 'text-emerald-500',
              trend === 'down' && 'text-red-500',
              trend === 'neutral' && 'text-muted-foreground',
            )}
          >
            {trend === 'up' && <TrendingUp className="h-3 w-3" />}
            {trend === 'down' && <TrendingDown className="h-3 w-3" />}
            {trend === 'neutral' && <Minus className="h-3 w-3" />}
            {change > 0 ? '+' : ''}
            {change}%
          </span>
        )}
      </div>
    </div>
  );
}
