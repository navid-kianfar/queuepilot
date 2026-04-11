import { useParams } from 'react-router-dom';
import { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { useConfirm } from '../ui/confirm-dialog';
import { DataTable } from '../shared/data-table';
import { Dialog, DialogButton } from '../ui/dialog';
import { Input } from '../ui/input';
import { cn } from '@/lib/utils';
import { useRmqUsers, useRmqCreateUser, useRmqDeleteUser } from '@/api/hooks/use-rabbitmq';
import { toast } from 'sonner';
import type { ColumnDef } from '@tanstack/react-table';

export function RmqUsers() {
  const { connId } = useParams();
  const cid = Number(connId);
  const { data: users = [], isLoading } = useRmqUsers(cid);
  const createUser = useRmqCreateUser(cid);
  const deleteUser = useRmqDeleteUser(cid);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ username: '', password: '', tags: 'management' });
  const confirmAction = useConfirm();

  const tagOptions = ['administrator', 'management', 'monitoring', 'policymaker'];

  const columns: ColumnDef<any, any>[] = [
    { accessorKey: 'name', header: 'Username', cell: ({ getValue }) => <span className="font-medium">{getValue()}</span> },
    { accessorKey: 'tags', header: 'Tags', cell: ({ getValue }) => {
      const raw = getValue();
      const tags: string[] = Array.isArray(raw) ? raw : typeof raw === 'string' ? raw.split(',').map((t: string) => t.trim()).filter(Boolean) : [];
      return (
        <div className="flex flex-wrap gap-1">
          {tags.map((tag: string) => (
            <span key={tag} className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium">{tag}</span>
          ))}
          {tags.length === 0 && <span className="text-xs text-muted-foreground italic">none</span>}
        </div>
      );
    }},
    { accessorKey: 'hashing_algorithm', header: 'Hash Algo' },
    { id: 'actions', header: '', cell: ({ row }) => (
      <button
        onClick={async (e) => { e.stopPropagation(); if (await confirmAction({ title: 'Delete User', description: `Delete user "${row.original.name}"?`, confirmText: 'Delete', variant: 'danger' })) deleteUser.mutate(row.original.name, { onSuccess: () => toast.success('User deleted') }); }}
        className="rounded-md p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
      >
        <Trash2 className="h-3.5 w-3.5" />
      </button>
    )},
  ];

  if (isLoading) return <div className="h-64 animate-pulse rounded-xl border border-border bg-card" />;

  return (
    <div>
      <DataTable data={users} columns={columns} searchPlaceholder="Search users..." exportFilename="rmq-users"
        actions={<button onClick={() => setShowCreate(true)} className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-xs font-medium text-primary-foreground hover:bg-primary/90"><Plus className="h-3.5 w-3.5" /> Create User</button>}
      />
      <Dialog open={showCreate} onClose={() => setShowCreate(false)} title="Create User" description="Add a new RabbitMQ user with tags"
        footer={<><DialogButton variant="secondary" onClick={() => setShowCreate(false)}>Cancel</DialogButton><DialogButton variant="primary" onClick={() => { createUser.mutate(form, { onSuccess: () => { toast.success('User created'); setShowCreate(false); setForm({ username: '', password: '', tags: 'management' }); } }); }} disabled={!form.username || !form.password}>Create</DialogButton></>}>
        <div className="space-y-4">
          <Input label="Username" value={form.username} onChange={(e) => setForm((f) => ({ ...f, username: e.target.value }))} placeholder="john" />
          <Input label="Password" type="password" value={form.password} onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))} placeholder="Enter password" />
          <div>
            <label className="mb-2 block text-xs font-medium text-muted-foreground">Tags</label>
            <div className="flex flex-wrap gap-2">
              {tagOptions.map((tag) => {
                const isSelected = form.tags.includes(tag);
                return (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => {
                      const tags = form.tags.split(',').map((t) => t.trim()).filter(Boolean);
                      setForm((f) => ({ ...f, tags: isSelected ? tags.filter((t) => t !== tag).join(', ') : [...tags, tag].join(', ') }));
                    }}
                    className={cn(
                      'rounded-lg border px-3 py-1.5 text-xs font-medium transition-all',
                      isSelected
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-border text-muted-foreground hover:border-primary/30 hover:text-foreground',
                    )}
                  >
                    {tag}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </Dialog>
    </div>
  );
}
