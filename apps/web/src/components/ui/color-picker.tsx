import { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Plus, Check } from 'lucide-react';

interface ColorPickerProps {
  value: string;
  onChange: (value: string) => void;
  /** Quick-pick swatches shown inline */
  presets?: string[];
  className?: string;
}

const HEX_RE = /^#([0-9a-fA-F]{6})$/;

/**
 * Replaces the native <input type="color"> (which opens the OS picker) with a
 * fully in-app control: inline preset swatches plus a popover for entering a
 * custom hex value. Matches the hand-built popover pattern used by Select.
 */
export function ColorPicker({ value, onChange, presets = [], className }: ColorPickerProps) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState(value);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => {
    if (open) setDraft(value);
  }, [open, value]);

  const isCustom = !presets.includes(value);
  const validDraft = HEX_RE.test(draft);

  const commit = () => {
    if (validDraft) {
      onChange(draft);
      setOpen(false);
    }
  };

  return (
    <div className={cn('flex items-center gap-2', className)} ref={ref}>
      {presets.map((c) => (
        <button
          key={c}
          type="button"
          aria-label={`Color ${c}`}
          onClick={() => onChange(c)}
          className={cn(
            'h-7 w-7 rounded-full transition-all',
            value === c ? 'ring-2 ring-ring ring-offset-2 ring-offset-background scale-110' : 'hover:scale-110',
          )}
          style={{ backgroundColor: c }}
        />
      ))}

      <div className="relative ml-1">
        <button
          type="button"
          aria-label="Custom color"
          onClick={() => setOpen((o) => !o)}
          className={cn(
            'flex h-7 w-7 items-center justify-center rounded-full transition-all',
            isCustom
              ? 'ring-2 ring-ring ring-offset-2 ring-offset-background'
              : 'border-2 border-dashed border-border text-muted-foreground hover:border-primary/50',
          )}
          style={isCustom ? { backgroundColor: value } : undefined}
        >
          {!isCustom && <Plus className="h-3 w-3" />}
        </button>

        {open && (
          <div className="absolute right-0 top-[calc(100%+6px)] z-50 w-52 rounded-xl border border-border bg-popover p-3 shadow-xl animate-in fade-in-0 zoom-in-95 duration-150">
            <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Custom hex</label>
            <div className="flex items-center gap-2">
              <div
                className="h-8 w-8 shrink-0 rounded-lg border border-border"
                style={{ backgroundColor: validDraft ? draft : 'transparent' }}
              />
              <input
                autoFocus
                value={draft}
                onChange={(e) => {
                  const v = e.target.value.startsWith('#') ? e.target.value : `#${e.target.value}`;
                  setDraft(v.slice(0, 7));
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') commit();
                  if (e.key === 'Escape') setOpen(false);
                }}
                placeholder="#6366f1"
                spellCheck={false}
                className="w-full rounded-lg border border-input bg-background px-2.5 py-1.5 font-mono text-sm outline-none transition-all focus:border-ring focus:ring-2 focus:ring-ring/20"
              />
            </div>
            <button
              type="button"
              onClick={commit}
              disabled={!validDraft}
              className="mt-2.5 flex w-full items-center justify-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Check className="h-3.5 w-3.5" /> Apply
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
