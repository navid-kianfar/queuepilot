import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Command } from 'cmdk';
import { Search, Rabbit, Waves, Cpu, Server, Plus } from 'lucide-react';
import { useConnectionStore } from '@/stores/connection-store';

const brokerIcons: Record<string, React.ElementType> = {
  rabbitmq: Rabbit,
  kafka: Waves,
  bullmq: Cpu,
};

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SearchCommand({ open, onOpenChange }: Props) {
  const navigate = useNavigate();
  const connections = useConnectionStore((s) => s.connections);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        onOpenChange(!open);
      }
    };
    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, [open, onOpenChange]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={() => onOpenChange(false)}
      />
      <div className="absolute left-1/2 top-[20%] w-full max-w-lg -translate-x-1/2 px-4">
        <Command className="rounded-xl border border-border bg-popover shadow-2xl overflow-hidden">
          <div className="flex items-center border-b border-border px-4">
            <Search className="mr-3 h-4 w-4 shrink-0 text-muted-foreground" />
            <Command.Input
              placeholder="Search connections, queues, topics..."
              className="flex h-12 w-full bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
              autoFocus
            />
          </div>
          <Command.List className="max-h-[320px] overflow-y-auto p-2">
            <Command.Empty className="py-12 text-center">
              <Server className="mx-auto mb-3 h-8 w-8 text-muted-foreground/30" />
              <p className="text-sm font-medium text-muted-foreground">No results found</p>
              <p className="mt-1 text-xs text-muted-foreground/60">Try a different search term</p>
            </Command.Empty>

            {connections.length > 0 && (
              <Command.Group className="mb-2">
                <div className="mb-1.5 px-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/60">
                  Connections
                </div>
                {connections.map((conn) => {
                  const Icon = brokerIcons[conn.type] || Server;
                  return (
                    <Command.Item
                      key={conn.id}
                      value={`${conn.name} ${conn.type} ${conn.host}`}
                      onSelect={() => {
                        navigate(`/c/${conn.id}/${conn.type}`);
                        onOpenChange(false);
                      }}
                      className="flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-foreground transition-colors data-[selected=true]:bg-accent mb-0.5"
                    >
                      <div
                        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
                        style={{ backgroundColor: conn.color + '15' }}
                      >
                        <Icon
                          className="h-4 w-4"
                          style={{ color: conn.color }}
                        />
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="font-medium truncate">{conn.name}</span>
                        <span className="text-[11px] text-muted-foreground truncate">
                          {conn.type} &middot; {conn.host}:{conn.port}
                        </span>
                      </div>
                    </Command.Item>
                  );
                })}
              </Command.Group>
            )}

            <Command.Group className="mt-1">
              <div className="mb-1.5 px-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/60">
                Quick Actions
              </div>
              <Command.Item
                value="new connection add"
                onSelect={() => {
                  navigate('/connections/new');
                  onOpenChange(false);
                }}
                className="flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-foreground transition-colors data-[selected=true]:bg-accent"
              >
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                  <Plus className="h-4 w-4 text-primary" />
                </div>
                <div className="flex flex-col">
                  <span className="font-medium">Add new connection</span>
                  <span className="text-[11px] text-muted-foreground">RabbitMQ, Kafka, or BullMQ</span>
                </div>
              </Command.Item>
            </Command.Group>
          </Command.List>

          <div className="border-t border-border px-4 py-2 flex items-center gap-4 text-[10px] text-muted-foreground/50">
            <span><kbd className="rounded border border-border bg-muted px-1 py-0.5 font-mono">↑↓</kbd> Navigate</span>
            <span><kbd className="rounded border border-border bg-muted px-1 py-0.5 font-mono">↵</kbd> Select</span>
            <span><kbd className="rounded border border-border bg-muted px-1 py-0.5 font-mono">Esc</kbd> Close</span>
          </div>
        </Command>
      </div>
    </div>
  );
}
