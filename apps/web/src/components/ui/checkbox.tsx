import { cn } from '@/lib/utils';
import { Check, Minus } from 'lucide-react';

interface CheckboxProps {
  checked: boolean;
  /** Visually shows a dash; aria-checked becomes "mixed" */
  indeterminate?: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  label?: string;
  className?: string;
  /** Stop click from bubbling (e.g. inside a clickable table row) */
  stopPropagation?: boolean;
  'aria-label'?: string;
}

export function Checkbox({
  checked,
  indeterminate,
  onChange,
  disabled,
  label,
  className,
  stopPropagation,
  'aria-label': ariaLabel,
}: CheckboxProps) {
  const box = (
    <button
      type="button"
      role="checkbox"
      aria-checked={indeterminate ? 'mixed' : checked}
      aria-label={ariaLabel}
      disabled={disabled}
      onClick={(e) => {
        if (stopPropagation) e.stopPropagation();
        if (!disabled) onChange(!checked);
      }}
      className={cn(
        'flex h-4 w-4 shrink-0 items-center justify-center rounded border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1',
        checked || indeterminate
          ? 'border-primary bg-primary text-primary-foreground'
          : 'border-input bg-background hover:border-ring/60',
        disabled && 'cursor-not-allowed opacity-50',
        !label && className,
      )}
    >
      {indeterminate ? (
        <Minus className="h-3 w-3" strokeWidth={3} />
      ) : checked ? (
        <Check className="h-3 w-3" strokeWidth={3} />
      ) : null}
    </button>
  );

  if (!label) return box;

  return (
    <label
      className={cn(
        'flex items-center gap-2 select-none',
        disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer',
        className,
      )}
    >
      {box}
      <span className="text-sm text-foreground">{label}</span>
    </label>
  );
}
