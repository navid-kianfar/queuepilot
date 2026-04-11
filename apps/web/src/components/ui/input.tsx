import { cn } from '@/lib/utils';
import { forwardRef } from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  icon?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, icon, className, ...props }, ref) => {
    return (
      <div className={className}>
        {label && (
          <label className="mb-1.5 block text-xs font-medium text-muted-foreground">{label}</label>
        )}
        <div className="relative">
          {icon && (
            <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
              {icon}
            </div>
          )}
          <input
            ref={ref}
            className={cn(
              'w-full rounded-lg border bg-background px-3 py-2 text-sm text-foreground outline-none transition-all',
              'placeholder:text-muted-foreground/50',
              'hover:border-ring/50 focus:border-ring focus:ring-2 focus:ring-ring/20',
              'disabled:cursor-not-allowed disabled:opacity-50',
              error ? 'border-destructive focus:border-destructive focus:ring-destructive/20' : 'border-input',
              icon && 'pl-9',
            )}
            {...props}
          />
        </div>
        {error && <p className="mt-1 text-xs text-destructive">{error}</p>}
        {hint && !error && <p className="mt-1 text-xs text-muted-foreground/60">{hint}</p>}
      </div>
    );
  },
);

Input.displayName = 'Input';
