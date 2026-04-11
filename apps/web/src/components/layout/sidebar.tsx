import { useNavigate, useParams } from 'react-router-dom';
import {
  Rabbit,
  Waves,
  Cpu,
  Plus,
  ChevronLeft,
  ChevronRight,
  Server,
  Settings,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSidebarStore } from '@/stores/sidebar-store';
import { useConnectionStore } from '@/stores/connection-store';
import { useConnections } from '@/api/hooks/use-connections';
import { BrokerType, BROKER_LABELS } from '@queuepilot/shared';
import { useEffect } from 'react';

const brokerIcons: Record<string, React.ElementType> = {
  rabbitmq: Rabbit,
  kafka: Waves,
  bullmq: Cpu,
};

const brokerColors: Record<string, string> = {
  rabbitmq: 'text-orange-500',
  kafka: 'text-blue-400',
  bullmq: 'text-red-500',
};

export function Sidebar() {
  const navigate = useNavigate();
  const params = useParams();
  const collapsed = useSidebarStore((s) => s.collapsed);
  const toggleCollapsed = useSidebarStore((s) => s.toggleCollapsed);
  const { activeConnectionId, setActiveConnection, setConnections } =
    useConnectionStore();
  const { data: connections = [] } = useConnections();

  useEffect(() => {
    if (connections.length > 0) {
      setConnections(connections);
    }
  }, [connections, setConnections]);

  const grouped = connections.reduce(
    (acc, conn) => {
      if (!acc[conn.type]) acc[conn.type] = [];
      acc[conn.type].push(conn);
      return acc;
    },
    {} as Record<string, typeof connections>,
  );

  const handleConnectionClick = (id: number, type: string) => {
    setActiveConnection(id);
    navigate(`/c/${id}/${type}`);
  };

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 z-40 flex h-full flex-col border-r border-sidebar-border bg-sidebar transition-all duration-300',
        collapsed ? 'w-[60px]' : 'w-[260px]',
      )}
    >
      {/* Logo */}
      <div className="flex h-14 items-center border-b border-sidebar-border px-4">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600">
            <Server className="h-4 w-4 text-white" />
          </div>
          {!collapsed && (
            <span className="text-sm font-bold tracking-tight text-sidebar-foreground">
              QueuePilot
            </span>
          )}
        </div>
      </div>

      {/* Add Connection */}
      <div className="px-3 pt-3">
        <button
          onClick={() => navigate('/connections/new')}
          className={cn(
            'flex w-full items-center gap-2 rounded-lg border border-dashed border-sidebar-border px-3 py-2 text-xs font-medium text-muted-foreground transition-colors hover:border-primary/40 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
            collapsed && 'justify-center px-0',
          )}
        >
          <Plus className="h-3.5 w-3.5" />
          {!collapsed && <span>Add Connection</span>}
        </button>
      </div>

      {/* Connection List */}
      <nav className="flex-1 overflow-y-auto px-3 py-3">
        {Object.entries(grouped).map(([type, conns]) => {
          const Icon = brokerIcons[type] || Server;
          const colorClass = brokerColors[type] || 'text-muted-foreground';

          return (
            <div key={type} className="mb-4">
              {!collapsed && (
                <div className="mb-1.5 flex items-center gap-1.5 px-2">
                  <Icon className={cn('h-3 w-3', colorClass)} />
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                    {BROKER_LABELS[type as BrokerType] || type}
                  </span>
                </div>
              )}
              {conns.map((conn) => {
                const isActive =
                  params.connId === String(conn.id) ||
                  activeConnectionId === conn.id;
                return (
                  <button
                    key={conn.id}
                    onClick={() => handleConnectionClick(conn.id, conn.type)}
                    className={cn(
                      'flex w-full items-center gap-2.5 rounded-md px-2 py-1.5 text-sm transition-colors',
                      isActive
                        ? 'bg-sidebar-accent text-sidebar-accent-foreground font-medium'
                        : 'text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground',
                      collapsed && 'justify-center px-0',
                    )}
                    title={collapsed ? conn.name : undefined}
                  >
                    <div
                      className="h-2 w-2 shrink-0 rounded-full"
                      style={{ backgroundColor: conn.color || '#6366f1' }}
                    />
                    {!collapsed && (
                      <span className="truncate">{conn.name}</span>
                    )}
                  </button>
                );
              })}
            </div>
          );
        })}

        {connections.length === 0 && !collapsed && (
          <div className="px-2 py-8 text-center">
            <Server className="mx-auto mb-2 h-8 w-8 text-muted-foreground/30" />
            <p className="text-xs text-muted-foreground">No connections yet</p>
            <p className="text-[10px] text-muted-foreground/60">
              Add your first connection to get started
            </p>
          </div>
        )}
      </nav>

      {/* Bottom Actions */}
      <div className="border-t border-sidebar-border px-3 py-2">
        <button
          onClick={() => navigate('/settings')}
          className={cn(
            'flex w-full items-center gap-2.5 rounded-md px-2 py-1.5 text-sm text-sidebar-foreground/70 transition-colors hover:bg-sidebar-accent/50 hover:text-sidebar-foreground',
            collapsed && 'justify-center px-0',
          )}
        >
          <Settings className="h-4 w-4" />
          {!collapsed && <span>Settings</span>}
        </button>
      </div>

      {/* Collapse Toggle */}
      <button
        onClick={toggleCollapsed}
        className="absolute -right-3 top-20 z-50 flex h-6 w-6 items-center justify-center rounded-full border border-sidebar-border bg-sidebar text-muted-foreground shadow-sm transition-colors hover:bg-sidebar-accent hover:text-sidebar-foreground"
      >
        {collapsed ? (
          <ChevronRight className="h-3 w-3" />
        ) : (
          <ChevronLeft className="h-3 w-3" />
        )}
      </button>
    </aside>
  );
}
