import { useParams } from 'react-router-dom';
import { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { useConfirm } from '../ui/confirm-dialog';
import { DataTable } from '../shared/data-table';
import { JsonViewer } from '../shared/json-viewer';
import { Dialog, DialogButton } from '../ui/dialog';
import { Input } from '../ui/input';
import { Select } from '../ui/select';
import { Textarea } from '../ui/textarea';
import { useRmqPolicies, useRmqCreatePolicy, useRmqDeletePolicy } from '@/api/hooks/use-rabbitmq';
import { toast } from 'sonner';
import type { ColumnDef } from '@tanstack/react-table';

export function RmqPolicies() {
  const { connId } = useParams();
  const cid = Number(connId);
  const { data: policies = [], isLoading } = useRmqPolicies(cid);
  const createPolicy = useRmqCreatePolicy(cid);
  const deletePolicy = useRmqDeletePolicy(cid);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ vhost: '/', name: '', pattern: '.*', apply_to: 'all', definition: '{}', priority: 0 });
  const confirmAction = useConfirm();

  const columns: ColumnDef<any, any>[] = [
    { accessorKey: 'name', header: 'Name', cell: ({ getValue }) => <span className="font-medium">{getValue()}</span> },
    { accessorKey: 'vhost', header: 'VHost' },
    { accessorKey: 'pattern', header: 'Pattern', cell: ({ getValue }) => <span className="font-mono text-xs">{getValue()}</span> },
    { accessorKey: 'apply-to', header: 'Apply To', cell: ({ getValue }) => (
      <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium uppercase">{getValue()}</span>
    )},
    { accessorKey: 'priority', header: 'Priority' },
    { accessorKey: 'definition', header: 'Definition', cell: ({ getValue }) => <JsonViewer data={getValue()} collapsed={1} /> },
    { id: 'actions', header: '', cell: ({ row }) => (
      <button
        onClick={async (e) => { e.stopPropagation(); if (await confirmAction({ title: 'Delete Policy', description: `Delete policy "${row.original.name}"?`, confirmText: 'Delete', variant: 'danger' })) deletePolicy.mutate({ vhost: row.original.vhost, name: row.original.name }, { onSuccess: () => toast.success('Policy deleted') }); }}
        className="rounded-md p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
      >
        <Trash2 className="h-3.5 w-3.5" />
      </button>
    )},
  ];

  const handleCreate = () => {
    let def = {};
    try { def = JSON.parse(form.definition); } catch { toast.error('Invalid JSON in definition'); return; }
    createPolicy.mutate({ ...form, definition: def }, {
      onSuccess: () => { toast.success('Policy created'); setShowCreate(false); },
      onError: () => toast.error('Failed to create policy'),
    });
  };

  if (isLoading) return <div className="h-64 animate-pulse rounded-xl border border-border bg-card" />;

  return (
    <div>
      <DataTable data={policies} columns={columns} searchPlaceholder="Search policies..." exportFilename="policies"
        actions={<button onClick={() => setShowCreate(true)} className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-xs font-medium text-primary-foreground hover:bg-primary/90"><Plus className="h-3.5 w-3.5" /> Create Policy</button>}
      />
      <Dialog open={showCreate} onClose={() => setShowCreate(false)} title="Create Policy" description="Define a policy to apply settings to matching queues/exchanges" size="lg"
        footer={<><DialogButton variant="secondary" onClick={() => setShowCreate(false)}>Cancel</DialogButton><DialogButton variant="primary" onClick={handleCreate} disabled={!form.name || !form.pattern}>Create</DialogButton></>}>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input label="Policy Name" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} placeholder="my-policy" />
            <Input label="Virtual Host" value={form.vhost} onChange={(e) => setForm((f) => ({ ...f, vhost: e.target.value }))} />
          </div>
          <Input label="Pattern (regex)" value={form.pattern} onChange={(e) => setForm((f) => ({ ...f, pattern: e.target.value }))} placeholder="^my\." className="font-mono" />
          <div className="grid grid-cols-2 gap-4">
            <Select label="Apply To" value={form.apply_to} onChange={(v) => setForm((f) => ({ ...f, apply_to: v }))} options={[{ value: 'all', label: 'All' }, { value: 'queues', label: 'Queues' }, { value: 'exchanges', label: 'Exchanges' }]} />
            <Input label="Priority" type="number" value={form.priority} onChange={(e) => setForm((f) => ({ ...f, priority: parseInt(e.target.value) || 0 }))} />
          </div>
          <Textarea label="Definition (JSON)" value={form.definition} onChange={(e) => setForm((f) => ({ ...f, definition: e.target.value }))} rows={5} placeholder='{"ha-mode": "all", "message-ttl": 60000}' />
        </div>
      </Dialog>
    </div>
  );
}
