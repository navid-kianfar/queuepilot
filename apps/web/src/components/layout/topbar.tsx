import { useLocation, useParams } from 'react-router-dom';
import { Search, Sun, Moon, Monitor } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useThemeStore } from '@/hooks/use-theme';
import { useConnectionStore } from '@/stores/connection-store';
import { useState } from 'react';
import { SearchCommand } from '../shared/search-command';

export function Topbar() {
  const location = useLocation();
  const params = useParams();
  const { theme, setTheme } = useThemeStore();
  const connections = useConnectionStore((s) => s.connections);
  const [searchOpen, setSearchOpen] = useState(false);

  const activeConn = params.connId
    ? connections.find((c) => c.id === Number(params.connId))
    : null;

  const breadcrumbs = buildBreadcrumbs(location.pathname, activeConn?.name);

  const themeOptions = [
    { value: 'light' as const, icon: Sun, label: 'Light' },
    { value: 'dark' as const, icon: Moon, label: 'Dark' },
    { value: 'system' as const, icon: Monitor, label: 'System' },
  ];

  return (
    <>
      <header className="flex h-14 shrink-0 items-center justify-between border-b border-border bg-background/80 px-6 backdrop-blur-sm">
        {/* Breadcrumbs */}
        <nav className="flex items-center gap-1.5 text-sm">
          {breadcrumbs.map((crumb, i) => (
            <span key={i} className="flex items-center gap-1.5">
              {i > 0 && (
                <span className="text-muted-foreground/40">/</span>
              )}
              <span
                className={cn(
                  i === breadcrumbs.length - 1
                    ? 'font-medium text-foreground'
                    : 'text-muted-foreground',
                )}
              >
                {crumb}
              </span>
            </span>
          ))}
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {/* Search */}
          <button
            onClick={() => setSearchOpen(true)}
            className="flex items-center gap-2 rounded-lg border border-border bg-muted/50 px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <Search className="h-3.5 w-3.5" />
            <span>Search...</span>
            <kbd className="ml-2 rounded border border-border bg-background px-1.5 py-0.5 text-[10px] font-mono">
              ⌘K
            </kbd>
          </button>

          {/* Theme Toggle */}
          <div className="flex items-center rounded-lg border border-border bg-muted/50 p-0.5">
            {themeOptions.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setTheme(opt.value)}
                className={cn(
                  'rounded-md p-1.5 transition-colors',
                  theme === opt.value
                    ? 'bg-background text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground',
                )}
                title={opt.label}
              >
                <opt.icon className="h-3.5 w-3.5" />
              </button>
            ))}
          </div>
        </div>
      </header>

      <SearchCommand open={searchOpen} onOpenChange={setSearchOpen} />
    </>
  );
}

function buildBreadcrumbs(pathname: string, connName?: string): string[] {
  const parts = pathname.split('/').filter(Boolean);
  const crumbs: string[] = [];

  if (parts[0] === 'connections') {
    crumbs.push('Connections');
    if (parts[1] === 'new') crumbs.push('New');
    else if (parts[2] === 'edit') crumbs.push('Edit');
  } else if (parts[0] === 'c') {
    if (connName) crumbs.push(connName);
    if (parts[2]) {
      const type = parts[2].charAt(0).toUpperCase() + parts[2].slice(1);
      crumbs.push(type);
    }
    for (let i = 3; i < parts.length; i++) {
      crumbs.push(parts[i].charAt(0).toUpperCase() + parts[i].slice(1).replace(/-/g, ' '));
    }
  } else if (parts[0] === 'settings') {
    crumbs.push('Settings');
  } else {
    crumbs.push('Connections');
  }

  return crumbs;
}
