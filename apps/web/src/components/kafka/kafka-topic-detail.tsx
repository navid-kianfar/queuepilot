import { useParams, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { ArrowLeft, Trash2, Eye, Send, RefreshCw } from 'lucide-react';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Select } from '../ui/select';
import { Textarea } from '../ui/textarea';
import { MessageEditor } from '../ui/message-editor';
import { useConfirm } from '../ui/confirm-dialog';
import { JsonViewer } from '../shared/json-viewer';
import { MetricCard } from '../shared/metric-card';
import { useKafkaTopic, useKafkaDeleteTopic, useKafkaBrowseMessages, useKafkaProduceMessage } from '@/api/hooks/use-kafka';
import { formatNumber } from '@/lib/utils';
import { toast } from 'sonner';

export function KafkaTopicDetail() {
  const { connId, name } = useParams();
  const navigate = useNavigate();
  const confirmAction = useConfirm();
  const cid = Number(connId);
  const topicName = decodeURIComponent(name || '');

  const { data: topic, isLoading } = useKafkaTopic(cid, topicName);
  const deleteTopic = useKafkaDeleteTopic(cid);
  const browseMessages = useKafkaBrowseMessages(cid);
  const produceMessage = useKafkaProduceMessage(cid);

  const [activeTab, setActiveTab] = useState<'partitions' | 'messages' | 'produce'>('partitions');
  const [messages, setMessages] = useState<any[]>([]);
  const [loadingMsgs, setLoadingMsgs] = useState(false);
  const [browsePartition, setBrowsePartition] = useState('0');
  const [browseLimit, setBrowseLimit] = useState('20');
  const [selectedMsg, setSelectedMsg] = useState<any>(null);
  const [pubForm, setPubForm] = useState({ key: '', value: '{\n  \n}', headers: '', partition: '' });

  const fetchMessages = () => {
    setLoadingMsgs(true);
    browseMessages.mutate({ topic: topicName, partition: Number(browsePartition), limit: Number(browseLimit) }, {
      onSuccess: (data) => { setMessages(data || []); setLoadingMsgs(false); },
      onError: () => { toast.error('Failed to browse messages'); setLoadingMsgs(false); },
    });
  };

  const handleProduce = () => {
    let headers: Record<string, string> | undefined;
    if (pubForm.headers) {
      try { headers = JSON.parse(pubForm.headers); } catch { toast.error('Invalid JSON in headers'); return; }
    }
    produceMessage.mutate({
      topic: topicName,
      messages: [{ key: pubForm.key || undefined, value: pubForm.value, headers, partition: pubForm.partition ? Number(pubForm.partition) : undefined }],
    }, {
      onSuccess: () => toast.success('Message produced'),
      onError: () => toast.error('Failed to produce'),
    });
  };

  if (isLoading) return <div className="h-64 animate-pulse rounded-xl border border-border bg-card" />;
  if (!topic) return <div className="flex h-64 items-center justify-center text-muted-foreground">Topic not found</div>;

  const totalMessages = (topic.partitions || []).reduce((sum: number, p: any) => sum + (Number(p.highWatermark) - Number(p.lowWatermark)), 0);

  const tabs = [
    { id: 'partitions' as const, label: 'Partitions' },
    { id: 'messages' as const, label: 'Messages' },
    { id: 'produce' as const, label: 'Produce' },
  ];

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <button onClick={() => navigate(`/c/${connId}/kafka/topics`)} className="mb-3 inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="h-3.5 w-3.5" /> Back to Topics
        </button>
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-bold">{topicName}</h2>
              <Badge variant="info">{topic.partitions?.length || 0} partitions</Badge>
              <Badge variant="outline">RF {topic.replicationFactor}</Badge>
            </div>
          </div>
          <button onClick={async () => {
            if (await confirmAction({ title: 'Delete Topic', description: `Delete topic "${topicName}"? All messages will be permanently lost.`, confirmText: 'Delete', variant: 'danger' })) {
              deleteTopic.mutate(topicName, { onSuccess: () => { toast.success('Topic deleted'); navigate(`/c/${connId}/kafka/topics`); } });
            }
          }} className="inline-flex items-center gap-1.5 rounded-lg border border-destructive/30 px-3 py-1.5 text-xs font-medium text-destructive hover:bg-destructive/10 transition-colors">
            <Trash2 className="h-3.5 w-3.5" /> Delete
          </button>
        </div>
      </div>

      {/* Metrics */}
      <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <MetricCard label="Partitions" value={formatNumber(topic.partitions?.length || 0)} />
        <MetricCard label="Replication" value={String(topic.replicationFactor)} />
        <MetricCard label="Messages (est.)" value={formatNumber(totalMessages)} />
        <MetricCard label="High Watermark" value={formatNumber(Math.max(0, ...(topic.partitions || []).map((p: any) => Number(p.highWatermark))))} />
      </div>

      {/* Tabs */}
      <div className="mb-4 flex items-center gap-1 border-b border-border pb-px">
        {tabs.map((tab) => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            className={`border-b-2 px-4 py-2.5 text-xs font-medium transition-colors ${activeTab === tab.id ? 'border-primary text-foreground' : 'border-transparent text-muted-foreground hover:text-foreground'}`}>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Partitions */}
      {activeTab === 'partitions' && (
        <div className="rounded-xl border border-border overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/50 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                <th className="px-4 py-3 text-left">Partition</th>
                <th className="px-4 py-3 text-left">Leader</th>
                <th className="px-4 py-3 text-left">Replicas</th>
                <th className="px-4 py-3 text-left">ISR</th>
                <th className="px-4 py-3 text-left">Low Watermark</th>
                <th className="px-4 py-3 text-left">High Watermark</th>
                <th className="px-4 py-3 text-left">Messages</th>
              </tr>
            </thead>
            <tbody>
              {(topic.partitions || []).map((p: any) => (
                <tr key={p.partitionId} className="border-b border-border last:border-0 text-sm">
                  <td className="px-4 py-2.5 font-medium">{p.partitionId}</td>
                  <td className="px-4 py-2.5"><Badge variant="info">Broker {p.leader}</Badge></td>
                  <td className="px-4 py-2.5 font-mono text-xs">{(p.replicas || []).join(', ')}</td>
                  <td className="px-4 py-2.5 font-mono text-xs">{(p.isr || []).join(', ')}</td>
                  <td className="px-4 py-2.5 font-mono text-xs">{p.lowWatermark}</td>
                  <td className="px-4 py-2.5 font-mono text-xs">{p.highWatermark}</td>
                  <td className="px-4 py-2.5 font-mono text-xs font-semibold">{Number(p.highWatermark) - Number(p.lowWatermark)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Messages */}
      {activeTab === 'messages' && (
        <div>
          <div className="mb-4 flex items-center gap-3">
            <Select label="" value={browsePartition} onChange={setBrowsePartition}
              options={(topic.partitions || []).map((p: any) => ({ value: String(p.partitionId), label: `Partition ${p.partitionId}` }))} />
            <Select label="" value={browseLimit} onChange={setBrowseLimit}
              options={[{ value: '10', label: '10 messages' }, { value: '20', label: '20 messages' }, { value: '50', label: '50 messages' }]} />
            <button onClick={fetchMessages} disabled={loadingMsgs}
              className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-xs font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50">
              {loadingMsgs ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <Eye className="h-3.5 w-3.5" />} Browse
            </button>
          </div>
          {messages.length === 0 ? (
            <div className="flex h-48 items-center justify-center rounded-xl border border-dashed border-border bg-card text-sm text-muted-foreground">
              {loadingMsgs ? 'Loading...' : 'Click "Browse" to fetch messages from the selected partition'}
            </div>
          ) : (
            <div className="space-y-2">
              {messages.map((msg: any, i: number) => (
                <div key={i} onClick={() => setSelectedMsg(selectedMsg === msg ? null : msg)}
                  className="cursor-pointer rounded-xl border border-border bg-card p-4 transition-colors hover:border-primary/30">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <Badge variant="outline">P{msg.partition}:O{msg.offset}</Badge>
                      {msg.key && <span>Key: <span className="text-foreground font-mono">{msg.key}</span></span>}
                      <span>{msg.size} bytes</span>
                      <span>{new Date(Number(msg.timestamp)).toLocaleString()}</span>
                    </div>
                  </div>
                  {selectedMsg === msg && (
                    <div className="mt-3 border-t border-border pt-3 space-y-3">
                      <div>
                        <div className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Value</div>
                        <div className="rounded-lg bg-muted/30 p-3"><JsonViewer data={msg.value} collapsed={5} /></div>
                      </div>
                      {msg.headers && Object.keys(msg.headers).length > 0 && (
                        <div>
                          <div className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Headers</div>
                          <div className="rounded-lg bg-muted/30 p-3"><JsonViewer data={msg.headers} collapsed={2} /></div>
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

      {/* Produce */}
      {activeTab === 'produce' && (
        <div className="max-w-xl">
          <div className="space-y-4 rounded-xl border border-border bg-card p-5">
            <Input label="Key (optional)" value={pubForm.key} onChange={(e) => setPubForm((f) => ({ ...f, key: e.target.value }))} placeholder="message-key" />
            <MessageEditor label="Value" value={pubForm.value} onChange={(v) => setPubForm((f) => ({ ...f, value: v }))} />
            <Textarea label="Headers (JSON, optional)" value={pubForm.headers} onChange={(e) => setPubForm((f) => ({ ...f, headers: e.target.value }))} rows={3} placeholder='{"content-type": "application/json"}' />
            <Select label="Partition (optional)" value={pubForm.partition} onChange={(v) => setPubForm((f) => ({ ...f, partition: v }))}
              options={[{ value: '', label: 'Auto (round-robin)' }, ...(topic.partitions || []).map((p: any) => ({ value: String(p.partitionId), label: `Partition ${p.partitionId}` }))]} />
            <button onClick={handleProduce} disabled={!pubForm.value || produceMessage.isPending}
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50">
              <Send className="h-4 w-4" /> Produce Message
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
