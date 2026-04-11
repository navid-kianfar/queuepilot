import { cn } from '@/lib/utils';
import { forwardRef } from 'react';

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, className, ...props }, ref) => {
    return (
      <div className={className}>
        {label && (
          <label className="mb-1.5 block text-xs font-medium text-muted-foreground">{label}</label>
        )}
        <textarea
          ref={ref}
          className={cn(
            'w-full rounded-lg border bg-background px-3 py-2 text-sm text-foreground font-mono outline-none transition-all resize-y',
            'placeholder:text-muted-foreground/50',
            'hover:border-ring/50 focus:border-ring focus:ring-2 focus:ring-ring/20',
            'disabled:cursor-not-allowed disabled:opacity-50',
            error ? 'border-destructive' : 'border-input',
          )}
          {...props}
        />
        {error && <p className="mt-1 text-xs text-destructive">{error}</p>}
      </div>
    );
  },
);

Textarea.displayName = 'Textarea';
