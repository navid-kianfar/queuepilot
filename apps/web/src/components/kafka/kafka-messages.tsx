import { useParams } from 'react-router-dom';
import { useState } from 'react';
import { Send } from 'lucide-react';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { MessageEditor } from '../ui/message-editor';
import { useKafkaProduceMessage } from '@/api/hooks/use-kafka';
import { toast } from 'sonner';

export function KafkaMessages() {
  const { connId } = useParams();
  const cid = Number(connId);
  const produceMessage = useKafkaProduceMessage(cid);
  const [form, setForm] = useState({ topic: '', key: '', value: '{\n  \n}', headers: '' });

  const handleProduce = () => {
    let headers: Record<string, string> = {};
    if (form.headers) {
      try { headers = JSON.parse(form.headers); } catch { toast.error('Invalid JSON in headers'); return; }
    }
    produceMessage.mutate({
      topic: form.topic,
      messages: [{ key: form.key || undefined, value: form.value, headers: Object.keys(headers).length > 0 ? headers : undefined }],
    }, {
      onSuccess: () => toast.success('Message produced'),
      onError: () => toast.error('Failed to produce message'),
    });
  };

  return (
    <div className="mx-auto max-w-2xl">
      <h2 className="mb-4 text-lg font-semibold">Produce Message</h2>
      <div className="space-y-4 rounded-xl border border-border bg-card p-6">
        <Input label="Topic" value={form.topic} onChange={(e) => setForm((f) => ({ ...f, topic: e.target.value }))} placeholder="my-topic" />
        <Input label="Key (optional)" value={form.key} onChange={(e) => setForm((f) => ({ ...f, key: e.target.value }))} placeholder="message-key" />
        <MessageEditor label="Value" value={form.value} onChange={(v) => setForm((f) => ({ ...f, value: v }))} />
        <Textarea label="Headers (JSON, optional)" value={form.headers} onChange={(e) => setForm((f) => ({ ...f, headers: e.target.value }))} rows={3} placeholder='{"content-type": "application/json"}' />
        <button onClick={handleProduce} disabled={!form.topic || !form.value || produceMessage.isPending} className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50">
          <Send className="h-4 w-4" /> Produce Message
        </button>
      </div>
    </div>
  );
}
