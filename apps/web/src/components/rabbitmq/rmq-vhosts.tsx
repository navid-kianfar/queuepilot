import { useParams } from 'react-router-dom';
import { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { useConfirm } from '../ui/confirm-dialog';
import { DataTable } from '../shared/data-table';
import { Dialog, DialogButton } from '../ui/dialog';
import { Input } from '../ui/input';
import { useRmqVhosts, useRmqCreateVhost, useRmqDeleteVhost } from '@/api/hooks/use-rabbitmq';
import { formatNumber } from '@/lib/utils';
import { toast } from 'sonner';
import type { ColumnDef } from '@tanstack/react-table';

export function RmqVhosts() {
  const { connId } = useParams();
  const cid = Number(connId);
  const { data: vhosts = [], isLoading } = useRmqVhosts(cid);
  const createVhost = useRmqCreateVhost(cid);
  const deleteVhost = useRmqDeleteVhost(cid);
  const [showCreate, setShowCreate] = useState(false);
  const [name, setName] = useState('');
  const confirmAction = useConfirm();

  const columns: ColumnDef<any, any>[] = [
    { accessorKey: 'name', header: 'Name', cell: ({ getValue }) => <span className="font-medium">{getValue()}</span> },
    { accessorKey: 'messages', header: 'Messages', cell: ({ getValue }) => formatNumber(getValue() || 0) },
    { accessorKey: 'messages_ready', header: 'Ready', cell: ({ getValue }) => formatNumber(getValue() || 0) },
    { accessorKey: 'messages_unacknowledged', header: 'Unacked', cell: ({ getValue }) => formatNumber(getValue() || 0) },
    { accessorKey: 'tracing', header: 'Tracing', cell: ({ getValue }) => getValue() ? 'On' : 'Off' },
    { id: 'actions', header: '', cell: ({ row }) => row.original.name !== '/' && (
      <button
        onClick={async (e) => { e.stopPropagation(); if (await confirmAction({ title: 'Delete VHost', description: `Delete vhost "${row.original.name}"? All exchanges, queues, and bindings in this vhost will be deleted.`, confirmText: 'Delete', variant: 'danger' })) deleteVhost.mutate(row.original.name, { onSuccess: () => toast.success('VHost deleted') }); }}
        className="rounded-md p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
      >
        <Trash2 className="h-3.5 w-3.5" />
      </button>
    )},
  ];

  if (isLoading) return <div className="h-64 animate-pulse rounded-xl border border-border bg-card" />;

  return (
    <div>
      <DataTable data={vhosts} columns={columns} searchPlaceholder="Search vhosts..." exportFilename="vhosts"
        actions={<button onClick={() => setShowCreate(true)} className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-xs font-medium text-primary-foreground hover:bg-primary/90"><Plus className="h-3.5 w-3.5" /> Create VHost</button>}
      />
      <Dialog open={showCreate} onClose={() => setShowCreate(false)} title="Create Virtual Host" description="Add a new vhost to the broker" size="sm"
        footer={<><DialogButton variant="secondary" onClick={() => setShowCreate(false)}>Cancel</DialogButton><DialogButton variant="primary" onClick={() => { createVhost.mutate({ name }, { onSuccess: () => { toast.success('VHost created'); setShowCreate(false); setName(''); } }); }} disabled={!name}>Create</DialogButton></>}>
        <Input label="VHost Name" value={name} onChange={(e) => setName(e.target.value)} placeholder="my-vhost" />
      </Dialog>
    </div>
  );
}
