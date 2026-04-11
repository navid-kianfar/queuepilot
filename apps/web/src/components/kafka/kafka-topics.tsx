import { useParams, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { Plus, Trash2, Eye } from 'lucide-react';
import { useConfirm } from '../ui/confirm-dialog';
import { DataTable } from '../shared/data-table';
import { JsonViewer } from '../shared/json-viewer';
import { Dialog, DialogButton } from '../ui/dialog';
import { Input } from '../ui/input';
import { useKafkaTopics, useKafkaCreateTopic, useKafkaDeleteTopic, useKafkaBrowseMessages } from '@/api/hooks/use-kafka';
import { toast } from 'sonner';
import type { ColumnDef } from '@tanstack/react-table';

export function KafkaTopics() {
  const { connId } = useParams();
  const navigate = useNavigate();
  const cid = Number(connId);
  const { data: topics = [], isLoading } = useKafkaTopics(cid);
  const createTopic = useKafkaCreateTopic(cid);
  const deleteTopic = useKafkaDeleteTopic(cid);
  const browseMessages = useKafkaBrowseMessages(cid);
  const [showCreate, setShowCreate] = useState(false);
  const [showMessages, setShowMessages] = useState<string | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [form, setForm] = useState({ name: '', numPartitions: 3, replicationFactor: 1 });
  const confirmAction = useConfirm();

  const columns: ColumnDef<any, any>[] = [
    { accessorKey: 'name', header: 'Topic', cell: ({ getValue }) => <span className="font-medium">{getValue()}</span> },
    { accessorKey: 'partitions', header: 'Partitions' },
    { accessorKey: 'replicationFactor', header: 'Replication' },
    { id: 'actions', header: '', cell: ({ row }) => (
      <div className="flex items-center gap-1">
        <button onClick={(e) => { e.stopPropagation(); handleBrowse(row.original.name); }} className="rounded-md p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground" title="Browse messages">
          <Eye className="h-3.5 w-3.5" />
        </button>
        <button onClick={async (e) => { e.stopPropagation(); if (await confirmAction({ title: 'Delete Topic', description: `Delete topic "${row.original.name}"?`, confirmText: 'Delete', variant: 'danger' })) deleteTopic.mutate(row.original.name, { onSuccess: () => toast.success('Topic deleted') }); }} className="rounded-md p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive">
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>
    )},
  ];

  const handleBrowse = (topic: string) => {
    setShowMessages(topic);
    setMessages([]);
    browseMessages.mutate({ topic, partition: 0, limit: 20 }, {
      onSuccess: (data) => setMessages(data || []),
      onError: () => toast.error('Failed to browse messages'),
    });
  };

  if (isLoading) return <div className="h-64 animate-pulse rounded-xl border border-border bg-card" />;

  return (
    <div>
      <DataTable data={topics} columns={columns} searchPlaceholder="Search topics..." exportFilename="kafka-topics"
        onRowClick={(row: any) => navigate(`/c/${connId}/kafka/topics/${encodeURIComponent(row.name)}`)}
        actions={<button onClick={() => setShowCreate(true)} className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-xs font-medium text-primary-foreground hover:bg-primary/90"><Plus className="h-3.5 w-3.5" /> Create Topic</button>}
      />

      <Dialog open={showCreate} onClose={() => setShowCreate(false)} title="Create Topic" description="Create a new Kafka topic"
        footer={<><DialogButton variant="secondary" onClick={() => setShowCreate(false)}>Cancel</DialogButton><DialogButton variant="primary" onClick={() => { createTopic.mutate(form, { onSuccess: () => { toast.success('Topic created'); setShowCreate(false); } }); }} disabled={!form.name}>Create</DialogButton></>}>
        <div className="space-y-4">
          <Input label="Topic Name" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} placeholder="my-topic" />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Partitions" type="number" value={form.numPartitions} onChange={(e) => setForm((f) => ({ ...f, numPartitions: parseInt(e.target.value) || 1 }))} />
            <Input label="Replication Factor" type="number" value={form.replicationFactor} onChange={(e) => setForm((f) => ({ ...f, replicationFactor: parseInt(e.target.value) || 1 }))} />
          </div>
        </div>
      </Dialog>

      {showMessages && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-4xl max-h-[80vh] overflow-auto rounded-xl border border-border bg-card p-6 shadow-2xl">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold">Messages - {showMessages}</h3>
                <p className="text-xs text-muted-foreground">{messages.length} messages</p>
              </div>
              <button onClick={() => setShowMessages(null)} className="rounded-lg border border-border px-3 py-1.5 text-sm hover:bg-accent">Close</button>
            </div>
            {messages.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">{browseMessages.isPending ? 'Loading...' : 'No messages'}</p>
            ) : (
              <div className="space-y-3">
                {messages.map((msg: any, i: number) => (
                  <div key={i} className="rounded-lg border border-border bg-muted/30 p-4">
                    <div className="mb-2 flex items-center gap-3 text-xs text-muted-foreground">
                      <span>Partition: <span className="text-foreground">{msg.partition}</span></span>
                      <span>Offset: <span className="text-foreground font-mono">{msg.offset}</span></span>
                      {msg.key && <span>Key: <span className="text-foreground">{msg.key}</span></span>}
                      <span>{msg.size} bytes</span>
                      <span>{new Date(parseInt(msg.timestamp)).toLocaleString()}</span>
                    </div>
                    <JsonViewer data={msg.value} collapsed={3} />
                    {msg.headers && Object.keys(msg.headers).length > 0 && (
                      <div className="mt-2 border-t border-border pt-2">
                        <p className="text-[10px] font-medium text-muted-foreground mb-1">Headers</p>
                        <JsonViewer data={msg.headers} collapsed={1} />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
