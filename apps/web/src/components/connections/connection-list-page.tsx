import { useNavigate } from 'react-router-dom';
import { useConfirm } from '../ui/confirm-dialog';
import {
  Plus,
  Rabbit,
  Waves,
  Cpu,
  Server,
  Trash2,
  Pencil,
  MoreHorizontal,
  Zap,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useConnections, useDeleteConnection } from '@/api/hooks/use-connections';
import { EmptyState } from '../shared/empty-state';
import { BrokerType, BROKER_LABELS } from '@queuepilot/shared';
import { toast } from 'sonner';
import { useState } from 'react';

const brokerIcons: Record<string, React.ElementType> = {
  rabbitmq: Rabbit,
  kafka: Waves,
  bullmq: Cpu,
};

const brokerGradients: Record<string, string> = {
  rabbitmq: 'from-orange-500/10 to-orange-600/5',
  kafka: 'from-blue-500/10 to-blue-600/5',
  bullmq: 'from-red-500/10 to-red-600/5',
};

export function Component() {
  const navigate = useNavigate();
  const confirmAction = useConfirm();
  const { data: connections = [], isLoading } = useConnections();
  const deleteConnection = useDeleteConnection();
  const [menuOpenId, setMenuOpenId] = useState<number | null>(null);

  const handleDelete = async (id: number, name: string) => {
    const ok = await confirmAction({ title: 'Delete Connection', description: `Delete "${name}"? This cannot be undone.`, confirmText: 'Delete', variant: 'danger' });
    if (!ok) return;
    deleteConnection.mutate(id, {
      onSuccess: () => toast.success(`Deleted "${name}"`),
      onError: () => toast.error('Failed to delete connection'),
    });
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-40 animate-pulse rounded-xl border border-border bg-card"
          />
        ))}
      </div>
    );
  }

  if (connections.length === 0) {
    return (
      <EmptyState
        icon={<Server className="h-8 w-8" />}
        title="No connections yet"
        description="Add your first RabbitMQ, Kafka, or BullMQ connection to get started with QueuePilot."
        action={
          <button
            onClick={() => navigate('/connections/new')}
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            <Plus className="h-4 w-4" />
            Add Connection
          </button>
        }
      />
    );
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Connections</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage your RabbitMQ, Kafka, and BullMQ server connections.
          </p>
        </div>
        <button
          onClick={() => navigate('/connections/new')}
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
        >
          <Plus className="h-4 w-4" />
          Add Connection
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {connections.map((conn) => {
          const Icon = brokerIcons[conn.type] || Server;
          const gradient = brokerGradients[conn.type] || 'from-gray-500/10 to-gray-600/5';

          return (
            <div
              key={conn.id}
              className="group relative cursor-pointer rounded-xl border border-border bg-card transition-all hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5"
              onClick={() => navigate(`/c/${conn.id}/${conn.type}`)}
            >
              <div className={cn('absolute inset-0 rounded-xl bg-gradient-to-br opacity-50', gradient)} />
              <div className="relative p-5">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className="flex h-10 w-10 items-center justify-center rounded-xl"
                      style={{ backgroundColor: conn.color + '20' }}
                    >
                      <Icon className="h-5 w-5" style={{ color: conn.color }} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">{conn.name}</h3>
                      <p className="text-xs text-muted-foreground">
                        {BROKER_LABELS[conn.type as BrokerType]}
                      </p>
                    </div>
                  </div>

                  <div className="relative">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setMenuOpenId(menuOpenId === conn.id ? null : conn.id);
                      }}
                      className="rounded-md p-1.5 text-muted-foreground opacity-0 transition-all hover:bg-muted group-hover:opacity-100"
                    >
                      <MoreHorizontal className="h-4 w-4" />
                    </button>
                    {menuOpenId === conn.id && (
                      <div className="absolute right-0 top-8 z-10 w-36 rounded-lg border border-border bg-popover p-1 shadow-lg">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/connections/${conn.id}/edit`);
                            setMenuOpenId(null);
                          }}
                          className="flex w-full items-center gap-2 rounded-md px-3 py-1.5 text-sm text-foreground hover:bg-accent"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                          Edit
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(conn.id, conn.name);
                            setMenuOpenId(null);
                          }}
                          className="flex w-full items-center gap-2 rounded-md px-3 py-1.5 text-sm text-destructive hover:bg-destructive/10"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-4 flex items-center gap-4 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Zap className="h-3 w-3" />
                    {conn.host}:{conn.port}
                  </span>
                  <span
                    className={cn(
                      'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium',
                      conn.isActive
                        ? 'bg-emerald-500/10 text-emerald-500'
                        : 'bg-muted text-muted-foreground',
                    )}
                  >
                    <span
                      className={cn(
                        'h-1.5 w-1.5 rounded-full',
                        conn.isActive ? 'bg-emerald-500' : 'bg-muted-foreground',
                      )}
                    />
                    {conn.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
