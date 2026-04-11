import { useParams, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { Plus, Trash2, Eraser } from 'lucide-react';
import { useConfirm } from '../ui/confirm-dialog';
import { DataTable } from '../shared/data-table';
import { Dialog, DialogButton } from '../ui/dialog';
import { Input } from '../ui/input';
import { Select } from '../ui/select';
import { Switch } from '../ui/switch';
import { Badge } from '../ui/badge';
import { useRmqQueues, useRmqCreateQueue, useRmqDeleteQueue, useRmqPurgeQueue } from '@/api/hooks/use-rabbitmq';
import { formatNumber, formatBytes } from '@/lib/utils';
import { toast } from 'sonner';
import type { ColumnDef } from '@tanstack/react-table';

export function RmqQueues() {
  const { connId } = useParams();
  const navigate = useNavigate();
  const cid = Number(connId);
  const { data: queues = [], isLoading } = useRmqQueues(cid);
  const createQueue = useRmqCreateQueue(cid);
  const deleteQueue = useRmqDeleteQueue(cid);
  const purgeQueue = useRmqPurgeQueue(cid);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ vhost: '/', name: '', durable: true, type: 'classic' });
  const confirmAction = useConfirm();

  const columns: ColumnDef<any, any>[] = [
    { accessorKey: 'name', header: 'Name', cell: ({ row }) => (
      <div>
        <span className="font-medium text-foreground">{row.original.name}</span>
        {row.original.policy && <Badge variant="info" className="ml-2">{row.original.policy}</Badge>}
      </div>
    )},
    { accessorKey: 'vhost', header: 'VHost' },
    { accessorKey: 'type', header: 'Type', cell: ({ getValue }) => <Badge variant="default">{String(getValue()).toUpperCase()}</Badge> },
    { accessorKey: 'messages_ready', header: 'Ready', cell: ({ getValue }) => <span className="font-mono text-xs">{formatNumber(getValue() || 0)}</span> },
    { accessorKey: 'messages_unacknowledged', header: 'Unacked', cell: ({ getValue }) => <span className="font-mono text-xs">{formatNumber(getValue() || 0)}</span> },
    { accessorKey: 'messages', header: 'Total', cell: ({ getValue }) => <span className="font-mono text-xs font-semibold">{formatNumber(getValue() || 0)}</span> },
    { accessorKey: 'consumers', header: 'Consumers' },
    { accessorKey: 'memory', header: 'Memory', cell: ({ getValue }) => formatBytes(getValue() || 0) },
    { id: 'actions', header: '', cell: ({ row }) => (
      <div className="flex items-center gap-1">
        <button onClick={async (e) => { e.stopPropagation(); if (await confirmAction({ title: 'Purge Queue', description: `Purge all messages from "${row.original.name}"?`, confirmText: 'Purge', variant: 'warning' })) purgeQueue.mutate({ vhost: row.original.vhost, name: row.original.name }, { onSuccess: () => toast.success('Purged') }); }}
          className="rounded-md p-1.5 text-muted-foreground hover:bg-orange-500/10 hover:text-orange-500" title="Purge">
          <Eraser className="h-3.5 w-3.5" />
        </button>
        <button onClick={async (e) => { e.stopPropagation(); if (await confirmAction({ title: 'Delete Queue', description: `Delete queue "${row.original.name}"?`, confirmText: 'Delete', variant: 'danger' })) deleteQueue.mutate({ vhost: row.original.vhost, name: row.original.name }, { onSuccess: () => toast.success('Deleted') }); }}
          className="rounded-md p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive">
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>
    )},
  ];

  if (isLoading) return <div className="h-64 animate-pulse rounded-xl border border-border bg-card" />;

  return (
    <div>
      <DataTable
        data={queues}
        columns={columns}
        searchPlaceholder="Search queues..."
        exportFilename="queues"
        onRowClick={(row: any) => navigate(`/c/${connId}/rabbitmq/queues/detail/${encodeURIComponent(row.name)}?vhost=${encodeURIComponent(row.vhost)}`)}
        actions={
          <button onClick={() => setShowCreate(true)} className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-xs font-medium text-primary-foreground hover:bg-primary/90">
            <Plus className="h-3.5 w-3.5" /> Create Queue
          </button>
        }
      />

      <Dialog open={showCreate} onClose={() => setShowCreate(false)} title="Create Queue" description="Declare a new queue on the broker"
        footer={<><DialogButton variant="secondary" onClick={() => setShowCreate(false)}>Cancel</DialogButton><DialogButton variant="primary" onClick={() => { createQueue.mutate(form, { onSuccess: () => { toast.success('Queue created'); setShowCreate(false); setForm({ vhost: '/', name: '', durable: true, type: 'classic' }); } }); }} disabled={!form.name}>Create</DialogButton></>}>
        <div className="space-y-4">
          <Input label="Queue Name" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} placeholder="my.queue" />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Virtual Host" value={form.vhost} onChange={(e) => setForm((f) => ({ ...f, vhost: e.target.value }))} />
            <Select label="Type" value={form.type} onChange={(v) => setForm((f) => ({ ...f, type: v }))} options={[{ value: 'classic', label: 'Classic' }, { value: 'quorum', label: 'Quorum' }, { value: 'stream', label: 'Stream' }]} />
          </div>
          <Switch checked={form.durable} onChange={(v) => setForm((f) => ({ ...f, durable: v }))} label="Durable" description="Survive broker restart" />
        </div>
      </Dialog>
    </div>
  );
}
