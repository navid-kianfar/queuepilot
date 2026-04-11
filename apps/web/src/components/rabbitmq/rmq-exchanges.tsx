import { useParams } from 'react-router-dom';
import { useState } from 'react';
import { Plus, Trash2, Send } from 'lucide-react';
import { useConfirm } from '../ui/confirm-dialog';
import { DataTable } from '../shared/data-table';
import { Dialog, DialogButton } from '../ui/dialog';
import { Input } from '../ui/input';
import { Select } from '../ui/select';
import { Switch } from '../ui/switch';
import { MessageEditor } from '../ui/message-editor';
import { Badge } from '../ui/badge';
import { useRmqExchanges, useRmqCreateExchange, useRmqDeleteExchange, useRmqPublishMessage } from '@/api/hooks/use-rabbitmq';
import { toast } from 'sonner';
import type { ColumnDef } from '@tanstack/react-table';

export function RmqExchanges() {
  const { connId } = useParams();
  const cid = Number(connId);
  const { data: exchanges = [], isLoading } = useRmqExchanges(cid);
  const createExchange = useRmqCreateExchange(cid);
  const deleteExchange = useRmqDeleteExchange(cid);
  const publishMessage = useRmqPublishMessage(cid);
  const [showCreate, setShowCreate] = useState(false);
  const [showPublish, setShowPublish] = useState<{ vhost: string; name: string } | null>(null);
  const [form, setForm] = useState({ vhost: '/', name: '', type: 'direct', durable: true });
  const [pubForm, setPubForm] = useState({ routing_key: '', payload: '{\n  \n}', delivery_mode: '2' });
  const confirmAction = useConfirm();

  const columns: ColumnDef<any, any>[] = [
    { accessorKey: 'name', header: 'Name', cell: ({ row }) => (
      <span className="font-medium text-foreground">{row.original.name || '(default)'}</span>
    )},
    { accessorKey: 'vhost', header: 'VHost' },
    { accessorKey: 'type', header: 'Type', cell: ({ getValue }) => <Badge variant="info">{String(getValue()).toUpperCase()}</Badge> },
    { accessorKey: 'durable', header: 'Durable', cell: ({ getValue }) => <Badge variant={getValue() ? 'success' : 'default'}>{getValue() ? 'Yes' : 'No'}</Badge> },
    { accessorKey: 'auto_delete', header: 'Auto-delete', cell: ({ getValue }) => getValue() ? 'Yes' : 'No' },
    { id: 'actions', header: '', cell: ({ row }) => (
      <div className="flex items-center gap-1">
        <button onClick={(e) => { e.stopPropagation(); setShowPublish({ vhost: row.original.vhost, name: row.original.name }); }} className="rounded-md p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground" title="Publish">
          <Send className="h-3.5 w-3.5" />
        </button>
        {row.original.name && (
          <button onClick={async (e) => { e.stopPropagation(); if (await confirmAction({ title: 'Delete Exchange', description: `Delete exchange "${row.original.name}"?`, confirmText: 'Delete', variant: 'danger' })) deleteExchange.mutate({ vhost: row.original.vhost, name: row.original.name }, { onSuccess: () => toast.success('Deleted') }); }} className="rounded-md p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive">
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
    )},
  ];

  if (isLoading) return <div className="h-64 animate-pulse rounded-xl border border-border bg-card" />;

  return (
    <div>
      <DataTable data={exchanges} columns={columns} searchPlaceholder="Search exchanges..." exportFilename="exchanges"
        actions={<button onClick={() => setShowCreate(true)} className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-xs font-medium text-primary-foreground hover:bg-primary/90"><Plus className="h-3.5 w-3.5" /> Create Exchange</button>}
      />

      <Dialog open={showCreate} onClose={() => setShowCreate(false)} title="Create Exchange" description="Declare a new exchange on the broker"
        footer={<><DialogButton variant="secondary" onClick={() => setShowCreate(false)}>Cancel</DialogButton><DialogButton variant="primary" onClick={() => { createExchange.mutate(form, { onSuccess: () => { toast.success('Exchange created'); setShowCreate(false); setForm({ vhost: '/', name: '', type: 'direct', durable: true }); } }); }} disabled={!form.name}>Create</DialogButton></>}>
        <div className="space-y-4">
          <Input label="Exchange Name" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} placeholder="my.exchange" />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Virtual Host" value={form.vhost} onChange={(e) => setForm((f) => ({ ...f, vhost: e.target.value }))} />
            <Select label="Type" value={form.type} onChange={(v) => setForm((f) => ({ ...f, type: v }))} options={[{ value: 'direct', label: 'Direct' }, { value: 'topic', label: 'Topic' }, { value: 'fanout', label: 'Fanout' }, { value: 'headers', label: 'Headers' }]} />
          </div>
          <Switch checked={form.durable} onChange={(v) => setForm((f) => ({ ...f, durable: v }))} label="Durable" description="Survive broker restart" />
        </div>
      </Dialog>

      <Dialog open={!!showPublish} onClose={() => setShowPublish(null)} title="Publish Message" description={showPublish ? `To: ${showPublish.name} (${showPublish.vhost})` : ''} size="lg"
        footer={<><DialogButton variant="secondary" onClick={() => setShowPublish(null)}>Cancel</DialogButton><DialogButton variant="primary" onClick={() => { if (!showPublish) return; publishMessage.mutate({ vhost: showPublish.vhost, exchange: showPublish.name, data: { routing_key: pubForm.routing_key, payload: pubForm.payload, payload_encoding: 'string', properties: { delivery_mode: Number(pubForm.delivery_mode) } } }, { onSuccess: () => { toast.success('Published'); setShowPublish(null); } }); }}>Publish</DialogButton></>}>
        <div className="space-y-4">
          <Input label="Routing Key" value={pubForm.routing_key} onChange={(e) => setPubForm((f) => ({ ...f, routing_key: e.target.value }))} placeholder="my.routing.key" />
          <MessageEditor label="Payload" value={pubForm.payload} onChange={(v) => setPubForm((f) => ({ ...f, payload: v }))} />
          <Select label="Delivery Mode" value={pubForm.delivery_mode} onChange={(v) => setPubForm((f) => ({ ...f, delivery_mode: v }))} options={[{ value: '2', label: 'Persistent (2)' }, { value: '1', label: 'Transient (1)' }]} />
        </div>
      </Dialog>
    </div>
  );
}
