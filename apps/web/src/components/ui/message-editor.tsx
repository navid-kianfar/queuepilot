import { useState, useCallback, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';
import { Code, AlignLeft, AlertCircle, Check, Copy, Maximize2, Minimize2 } from 'lucide-react';

interface MessageEditorProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  placeholder?: string;
  minHeight?: number;
  className?: string;
}

export function MessageEditor({ value, onChange, label, placeholder, minHeight = 240, className }: MessageEditorProps) {
  const [mode, setMode] = useState<'json' | 'text'>('json');
  const [jsonError, setJsonError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState(false);
  const [copied, setCopied] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const validateJson = useCallback((val: string) => {
    if (mode !== 'json' || !val.trim()) { setJsonError(null); return; }
    try {
      JSON.parse(val);
      setJsonError(null);
    } catch (e: any) {
      setJsonError(e.message?.replace(/^JSON\.parse: /, '') || 'Invalid JSON');
    }
  }, [mode]);

  useEffect(() => { validateJson(value); }, [value, validateJson]);

  const handleFormat = () => {
    if (mode !== 'json') return;
    try {
      const parsed = JSON.parse(value);
      onChange(JSON.stringify(parsed, null, 2));
      setJsonError(null);
    } catch {
      // can't format invalid json
    }
  };

  const handleMinify = () => {
    if (mode !== 'json') return;
    try {
      const parsed = JSON.parse(value);
      onChange(JSON.stringify(parsed));
    } catch {}
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleModeSwitch = (newMode: 'json' | 'text') => {
    setMode(newMode);
    if (newMode === 'json') {
      validateJson(value);
    } else {
      setJsonError(null);
    }
  };

  const lineCount = value.split('\n').length;

  return (
    <div className={cn('flex flex-col', className)}>
      {/* Header */}
      <div className="flex items-center justify-between mb-1.5">
        <div className="flex items-center gap-2">
          {label && <label className="text-xs font-medium text-muted-foreground">{label}</label>}
          {mode === 'json' && jsonError && (
            <span className="inline-flex items-center gap-1 text-[10px] text-destructive">
              <AlertCircle className="h-3 w-3" /> {jsonError.length > 40 ? jsonError.slice(0, 40) + '...' : jsonError}
            </span>
          )}
          {mode === 'json' && !jsonError && value.trim() && (
            <span className="inline-flex items-center gap-1 text-[10px] text-emerald-500">
              <Check className="h-3 w-3" /> Valid JSON
            </span>
          )}
        </div>

        {/* Mode Toggle + Actions */}
        <div className="flex items-center gap-1.5">
          {mode === 'json' && (
            <>
              <button type="button" onClick={handleFormat} className="rounded-md px-2 py-1 text-[10px] font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors" title="Format">
                Format
              </button>
              <button type="button" onClick={handleMinify} className="rounded-md px-2 py-1 text-[10px] font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors" title="Minify">
                Minify
              </button>
            </>
          )}
          <button type="button" onClick={handleCopy} className="rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors" title="Copy">
            {copied ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
          </button>
          <button type="button" onClick={() => setExpanded(!expanded)} className="rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors" title={expanded ? 'Collapse' : 'Expand'}>
            {expanded ? <Minimize2 className="h-3.5 w-3.5" /> : <Maximize2 className="h-3.5 w-3.5" />}
          </button>

          {/* Mode Switch */}
          <div className="flex items-center rounded-lg border border-border bg-muted/50 p-0.5">
            <button
              type="button"
              onClick={() => handleModeSwitch('json')}
              className={cn(
                'inline-flex items-center gap-1 rounded-md px-2.5 py-1 text-[11px] font-medium transition-all',
                mode === 'json'
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground',
              )}
            >
              <Code className="h-3 w-3" /> JSON
            </button>
            <button
              type="button"
              onClick={() => handleModeSwitch('text')}
              className={cn(
                'inline-flex items-center gap-1 rounded-md px-2.5 py-1 text-[11px] font-medium transition-all',
                mode === 'text'
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground',
              )}
            >
              <AlignLeft className="h-3 w-3" /> Text
            </button>
          </div>
        </div>
      </div>

      {/* Editor */}
      <div className={cn(
        'relative rounded-xl border bg-background transition-all overflow-hidden',
        jsonError && mode === 'json' ? 'border-destructive/50' : 'border-input',
        'focus-within:border-ring focus-within:ring-2 focus-within:ring-ring/20',
      )}>
        {/* Line numbers */}
        <div className="flex">
          {mode === 'json' && (
            <div className="flex-shrink-0 select-none border-r border-border bg-muted/30 px-2 py-3 text-right font-mono text-[11px] leading-[1.625rem] text-muted-foreground/40" style={{ minHeight }}>
              {Array.from({ length: Math.max(lineCount, 1) }, (_, i) => (
                <div key={i}>{i + 1}</div>
              ))}
            </div>
          )}
          <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder || (mode === 'json' ? '{\n  "key": "value"\n}' : 'Enter your message...')}
            spellCheck={false}
            className={cn(
              'w-full resize-none bg-transparent px-3 py-3 text-sm outline-none',
              'placeholder:text-muted-foreground/30',
              mode === 'json' ? 'font-mono text-[13px] leading-[1.625rem]' : 'leading-relaxed',
            )}
            style={{ minHeight: expanded ? minHeight * 2 : minHeight }}
          />
        </div>
      </div>

      {/* Footer */}
      <div className="mt-1 flex items-center justify-between text-[10px] text-muted-foreground/50">
        <span>{lineCount} line{lineCount !== 1 ? 's' : ''} &middot; {value.length} chars</span>
        <span>{mode === 'json' ? 'JSON mode' : 'Plain text mode'}</span>
      </div>
    </div>
  );
}
