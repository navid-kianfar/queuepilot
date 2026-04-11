import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useState } from 'react';
import { ArrowLeft, Eraser, Trash2, RefreshCw, Send, Eye, Download } from 'lucide-react';
import { useConfirm } from '../ui/confirm-dialog';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Select } from '../ui/select';
import { MessageEditor } from '../ui/message-editor';
import { JsonViewer } from '../shared/json-viewer';
import { MetricCard } from '../shared/metric-card';
import { useRmqQueueByName, useRmqPurgeQueue, useRmqDeleteQueue, useRmqGetMessages, useRmqPublishMessage } from '@/api/hooks/use-rabbitmq';
import { rabbitmqApi } from '@/api/endpoints/rabbitmq';
import { formatNumber, formatBytes } from '@/lib/utils';
import { toast } from 'sonner';

export function RmqQueueDetail() {
  const { connId, name } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const cid = Number(connId);
  const decodedVhost = searchParams.get('vhost') || '/';
  const decodedName = decodeURIComponent(name || '');

  const { data: queue, isLoading } = useRmqQueueByName(cid, decodedName, decodedVhost);
  const purgeQueue = useRmqPurgeQueue(cid);
  const deleteQueue = useRmqDeleteQueue(cid);
  const getMessages = useRmqGetMessages(cid);
  const publishMessage = useRmqPublishMessage(cid);

  const [activeTab, setActiveTab] = useState<'overview' | 'messages' | 'publish' | 'bindings'>('overview');
  const [messages, setMessages] = useState<any[]>([]);
  const [msgCount, setMsgCount] = useState('10');
  const [ackMode, setAckMode] = useState('ack_requeue_true');
  const [loadingMsgs, setLoadingMsgs] = useState(false);
  const [selectedMsg, setSelectedMsg] = useState<any>(null);
  const [pubForm, setPubForm] = useState({ routing_key: '', payload: '{\n  \n}', delivery_mode: '2', content_type: 'application/json' });
  const [bindings, setBindings] = useState<any[]>([]);
  const [bindingsLoaded, setBindingsLoaded] = useState(false);
  const confirmAction = useConfirm();

  const fetchMessages = () => {
    setLoadingMsgs(true);
    getMessages.mutate({ vhost: decodedVhost, queue: decodedName, data: { count: Number(msgCount), ackmode: ackMode, encoding: 'auto' } }, {
      onSuccess: (data) => { setMessages(data || []); setLoadingMsgs(false); },
      onError: () => { toast.error('Failed to fetch messages'); setLoadingMsgs(false); },
    });
  };

  const loadBindings = async () => {
    if (bindingsLoaded) return;
    try {
      const data = await rabbitmqApi.getQueueBindingsByName(cid, decodedName, decodedVhost);
      setBindings(data || []);
      setBindingsLoaded(true);
    } catch { toast.error('Failed to load bindings'); }
  };

  const handlePublish = () => {
    // Publish to default exchange with queue name as routing key
    publishMessage.mutate({
      vhost: decodedVhost,
      exchange: '',
      data: {
        routing_key: pubForm.routing_key || decodedName,
        payload: pubForm.payload,
        payload_encoding: 'string',
        properties: {
          delivery_mode: Number(pubForm.delivery_mode),
          content_type: pubForm.content_type,
        },
      },
    }, {
      onSuccess: () => toast.success('Message published to queue'),
      onError: () => toast.error('Failed to publish'),
    });
  };

  if (isLoading) {
    return <div className="h-64 animate-pulse rounded-xl border border-border bg-card" />;
  }

  if (!queue) {
    return <div className="flex h-64 items-center justify-center text-muted-foreground">Queue not found</div>;
  }

  const tabs = [
    { id: 'overview' as const, label: 'Overview' },
    { id: 'messages' as const, label: 'Messages' },
    { id: 'publish' as const, label: 'Publish' },
    { id: 'bindings' as const, label: 'Bindings' },
  ];

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <button onClick={() => navigate(`/c/${connId}/rabbitmq/queues`)} className="mb-3 inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="h-3.5 w-3.5" /> Back to Queues
        </button>
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-bold">{decodedName}</h2>
              <Badge variant={queue.state === 'running' ? 'success' : 'warning'} dot>{queue.state}</Badge>
              {queue.type && <Badge variant="info">{queue.type}</Badge>}
              {queue.durable && <Badge variant="outline">Durable</Badge>}
            </div>
            <p className="mt-1 text-xs text-muted-foreground">VHost: {decodedVhost} {queue.policy && `| Policy: ${queue.policy}`}</p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={async () => {
              toast.info('Downloading messages...');
              try {
                const blob = await rabbitmqApi.downloadMessages(cid, decodedVhost, decodedName, 1000);
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `${decodedName}-messages.json.gz`;
                a.click();
                URL.revokeObjectURL(url);
                toast.success('Download started');
              } catch { toast.error('Failed to download'); }
            }}
              className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-foreground hover:bg-accent transition-colors">
              <Download className="h-3.5 w-3.5" /> Download
            </button>
            <button onClick={async () => { if (await confirmAction({ title: 'Purge Queue', description: 'Purge all messages?', confirmText: 'Purge', variant: 'warning' })) purgeQueue.mutate({ vhost: decodedVhost, name: decodedName }, { onSuccess: () => toast.success('Queue purged') }); }}
              className="inline-flex items-center gap-1.5 rounded-lg border border-orange-500/30 px-3 py-1.5 text-xs font-medium text-orange-500 hover:bg-orange-500/10 transition-colors">
              <Eraser className="h-3.5 w-3.5" /> Purge
            </button>
            <button onClick={async () => { if (await confirmAction({ title: 'Delete Queue', description: `Delete queue "${decodedName}"? All messages will be lost.`, confirmText: 'Delete', variant: 'danger' })) deleteQueue.mutate({ vhost: decodedVhost, name: decodedName }, { onSuccess: () => { toast.success('Queue deleted'); navigate(`/c/${connId}/rabbitmq/queues`); } }); }}
              className="inline-flex items-center gap-1.5 rounded-lg border border-destructive/30 px-3 py-1.5 text-xs font-medium text-destructive hover:bg-destructive/10 transition-colors">
              <Trash2 className="h-3.5 w-3.5" /> Delete
            </button>
          </div>
        </div>
      </div>

      {/* Metrics */}
      <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-5">
        <MetricCard label="Ready" value={formatNumber(queue.messages_ready || 0)} />
        <MetricCard label="Unacked" value={formatNumber(queue.messages_unacknowledged || 0)} />
        <MetricCard label="Total" value={formatNumber(queue.messages || 0)} />
        <MetricCard label="Consumers" value={formatNumber(queue.consumers || 0)} />
        <MetricCard label="Memory" value={formatBytes(queue.memory || 0)} />
      </div>

      {/* Tabs */}
      <div className="mb-4 flex items-center gap-1 border-b border-border pb-px">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => { setActiveTab(tab.id); if (tab.id === 'bindings') loadBindings(); }}
            className={`border-b-2 px-4 py-2.5 text-xs font-medium transition-colors ${
              activeTab === tab.id ? 'border-primary text-foreground' : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="rounded-xl border border-border bg-card p-5">
          <h3 className="mb-3 text-sm font-semibold">Queue Arguments</h3>
          {queue.arguments && Object.keys(queue.arguments).length > 0 ? (
            <JsonViewer data={queue.arguments} collapsed={2} />
          ) : (
            <p className="text-xs text-muted-foreground italic">No arguments configured</p>
          )}

          {queue.effective_policy_definition && (
            <div className="mt-5">
              <h3 className="mb-3 text-sm font-semibold">Effective Policy</h3>
              <JsonViewer data={queue.effective_policy_definition} collapsed={2} />
            </div>
          )}
        </div>
      )}

      {activeTab === 'messages' && (
        <div>
          <div className="mb-4 flex items-center gap-3">
            <Select label="" value={msgCount} onChange={setMsgCount} options={[{ value: '5', label: '5 messages' }, { value: '10', label: '10 messages' }, { value: '25', label: '25 messages' }, { value: '50', label: '50 messages' }]} />
            <Select label="" value={ackMode} onChange={setAckMode} options={[
              { value: 'ack_requeue_true', label: 'Nack (requeue)' },
              { value: 'ack_requeue_false', label: 'Ack (remove from queue)' },
              { value: 'reject_requeue_true', label: 'Reject (requeue)' },
              { value: 'reject_requeue_false', label: 'Reject (discard)' },
            ]} />
            <button onClick={fetchMessages} disabled={loadingMsgs}
              className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-xs font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50">
              {loadingMsgs ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <Eye className="h-3.5 w-3.5" />}
              Get Messages
            </button>
          </div>

          {messages.length === 0 ? (
            <div className="flex h-48 items-center justify-center rounded-xl border border-dashed border-border bg-card text-sm text-muted-foreground">
              {loadingMsgs ? 'Loading...' : 'Click "Get Messages" to browse the queue'}
            </div>
          ) : (
            <div className="space-y-2">
              {messages.map((msg: any, i: number) => (
                <div key={i} onClick={() => setSelectedMsg(selectedMsg === msg ? null : msg)}
                  className="cursor-pointer rounded-xl border border-border bg-card p-4 transition-colors hover:border-primary/30">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <Badge variant="outline">#{i + 1}</Badge>
                      <span>Exchange: <span className="text-foreground font-medium">{msg.exchange || '(default)'}</span></span>
                      <span>Key: <span className="text-foreground font-mono">{msg.routing_key}</span></span>
                      <span>{msg.payload_bytes} bytes</span>
                      {msg.redelivered && <Badge variant="warning">Redelivered</Badge>}
                    </div>
                  </div>
                  {selectedMsg === msg && (
                    <div className="mt-3 border-t border-border pt-3">
                      <div className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Payload</div>
                      <div className="rounded-lg bg-muted/30 p-3">
                        <JsonViewer data={msg.payload} collapsed={5} />
                      </div>
                      {msg.properties && Object.keys(msg.properties).length > 0 && (
                        <div className="mt-3">
                          <div className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Properties</div>
                          <div className="rounded-lg bg-muted/30 p-3">
                            <JsonViewer data={msg.properties} collapsed={2} />
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'publish' && (
        <div className="max-w-xl">
          <div className="space-y-4 rounded-xl border border-border bg-card p-5">
            <Input label="Routing Key" value={pubForm.routing_key} onChange={(e) => setPubForm((f) => ({ ...f, routing_key: e.target.value }))} placeholder={decodedName} hint={`Default: ${decodedName} (direct to this queue)`} />
            <MessageEditor label="Payload" value={pubForm.payload} onChange={(v) => setPubForm((f) => ({ ...f, payload: v }))} />
            <div className="grid grid-cols-2 gap-4">
              <Select label="Delivery Mode" value={pubForm.delivery_mode} onChange={(v) => setPubForm((f) => ({ ...f, delivery_mode: v }))} options={[{ value: '2', label: 'Persistent (2)' }, { value: '1', label: 'Transient (1)' }]} />
              <Input label="Content-Type" value={pubForm.content_type} onChange={(e) => setPubForm((f) => ({ ...f, content_type: e.target.value }))} />
            </div>
            <button onClick={handlePublish} className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90">
              <Send className="h-4 w-4" /> Publish Message
            </button>
          </div>
        </div>
      )}

      {activeTab === 'bindings' && (
        <div className="rounded-xl border border-border overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/50 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                <th className="px-4 py-3 text-left">Source</th>
                <th className="px-4 py-3 text-left">Routing Key</th>
                <th className="px-4 py-3 text-left">Arguments</th>
              </tr>
            </thead>
            <tbody>
              {bindings.length === 0 ? (
                <tr><td colSpan={3} className="px-4 py-8 text-center text-sm text-muted-foreground">No bindings</td></tr>
              ) : bindings.map((b: any, i: number) => (
                <tr key={i} className="border-b border-border last:border-0 text-sm">
                  <td className="px-4 py-3 font-medium">{b.source || '(default)'}</td>
                  <td className="px-4 py-3 font-mono text-xs">{b.routing_key || '*'}</td>
                  <td className="px-4 py-3">{b.arguments && Object.keys(b.arguments).length > 0 ? <JsonViewer data={b.arguments} collapsed={1} /> : '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
