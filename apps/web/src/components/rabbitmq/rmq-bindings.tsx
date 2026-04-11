import { useParams } from 'react-router-dom';
import { useState } from 'react';
import { Plus } from 'lucide-react';
import { DataTable } from '../shared/data-table';
import { Dialog, DialogButton } from '../ui/dialog';
import { Input } from '../ui/input';
import { Select } from '../ui/select';
import { useRmqBindings, useRmqCreateBinding } from '@/api/hooks/use-rabbitmq';
import { toast } from 'sonner';
import type { ColumnDef } from '@tanstack/react-table';

export function RmqBindings() {
  const { connId } = useParams();
  const cid = Number(connId);
  const { data: bindings = [], isLoading } = useRmqBindings(cid);
  const createBinding = useRmqCreateBinding(cid);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ vhost: '/', source: '', destination_type: 'queue', destination: '', routing_key: '' });

  const columns: ColumnDef<any, any>[] = [
    { accessorKey: 'source', header: 'Source', cell: ({ getValue }) => <span className="font-medium">{getValue() || '(default)'}</span> },
    { accessorKey: 'destination', header: 'Destination', cell: ({ getValue }) => <span className="font-medium">{getValue()}</span> },
    { accessorKey: 'destination_type', header: 'Type', cell: ({ getValue }) => (
      <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium uppercase">{getValue()}</span>
    )},
    { accessorKey: 'routing_key', header: 'Routing Key', cell: ({ getValue }) => (
      <span className="font-mono text-xs">{getValue() || '*'}</span>
    )},
    { accessorKey: 'vhost', header: 'VHost' },
  ];

  const handleCreate = () => {
    createBinding.mutate(form, {
      onSuccess: () => { toast.success('Binding created'); setShowCreate(false); },
      onError: () => toast.error('Failed to create binding'),
    });
  };

  if (isLoading) return <div className="h-64 animate-pulse rounded-xl border border-border bg-card" />;

  return (
    <div>
      <DataTable
        data={bindings}
        columns={columns}
        searchPlaceholder="Search bindings..."
        exportFilename="bindings"
        actions={
          <button onClick={() => setShowCreate(true)} className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-xs font-medium text-primary-foreground hover:bg-primary/90">
            <Plus className="h-3.5 w-3.5" /> Create Binding
          </button>
        }
      />

      <Dialog open={showCreate} onClose={() => setShowCreate(false)} title="Create Binding" description="Bind an exchange to a queue or another exchange"
        footer={<><DialogButton variant="secondary" onClick={() => setShowCreate(false)}>Cancel</DialogButton><DialogButton variant="primary" onClick={handleCreate} disabled={!form.source || !form.destination}>Create</DialogButton></>}>
        <div className="space-y-4">
          <Input label="Source Exchange" value={form.source} onChange={(e) => setForm((f) => ({ ...f, source: e.target.value }))} placeholder="amq.direct" />
          <div className="grid grid-cols-2 gap-4">
            <Select label="Destination Type" value={form.destination_type} onChange={(v) => setForm((f) => ({ ...f, destination_type: v }))} options={[{ value: 'queue', label: 'Queue' }, { value: 'exchange', label: 'Exchange' }]} />
            <Input label="Destination" value={form.destination} onChange={(e) => setForm((f) => ({ ...f, destination: e.target.value }))} placeholder="my.queue" />
          </div>
          <Input label="Routing Key" value={form.routing_key} onChange={(e) => setForm((f) => ({ ...f, routing_key: e.target.value }))} placeholder="#" />
          <Input label="Virtual Host" value={form.vhost} onChange={(e) => setForm((f) => ({ ...f, vhost: e.target.value }))} />
        </div>
      </Dialog>
    </div>
  );
}
