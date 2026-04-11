import JsonView from '@uiw/react-json-view';
import { darkTheme } from '@uiw/react-json-view/dark';
import { lightTheme } from '@uiw/react-json-view/light';
import { useThemeStore } from '@/hooks/use-theme';

interface JsonViewerProps {
  data: unknown;
  collapsed?: number;
  className?: string;
}

export function JsonViewer({ data, collapsed = 2, className }: JsonViewerProps) {
  const theme = useThemeStore((s) => s.theme);
  const isDark = theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);

  if (data === null || data === undefined) {
    return <span className="text-xs text-muted-foreground italic">null</span>;
  }

  // Try to parse string as JSON
  let parsed = data;
  if (typeof data === 'string') {
    try {
      parsed = JSON.parse(data);
    } catch {
      return (
        <pre className={`whitespace-pre-wrap break-all text-xs font-mono text-foreground ${className || ''}`}>
          {data}
        </pre>
      );
    }
  }

  if (typeof parsed !== 'object') {
    return <span className="text-sm text-foreground">{String(parsed)}</span>;
  }

  return (
    <div className={className}>
      <JsonView
        value={parsed as object}
        style={isDark ? darkTheme : lightTheme}
        collapsed={collapsed}
        displayDataTypes={false}
        enableClipboard={true}
      />
    </div>
  );
}
