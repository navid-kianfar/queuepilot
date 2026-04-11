import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Rabbit, Waves, Cpu, Loader2, CheckCircle2, XCircle, Palette } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Input } from '../ui/input';
import {
  useCreateConnection,
  useConnection,
  useUpdateConnection,
  useTestConnection,
} from '@/api/hooks/use-connections';
import {
  BrokerType,
  BROKER_LABELS,
  DEFAULT_PORTS,
  DEFAULT_COLORS,
} from '@queuepilot/shared';
import { toast } from 'sonner';

const brokerOptions = [
  { type: BrokerType.RABBITMQ, icon: Rabbit, label: 'RabbitMQ', desc: 'AMQP message broker' },
  { type: BrokerType.KAFKA, icon: Waves, label: 'Apache Kafka', desc: 'Event streaming platform' },
  { type: BrokerType.BULLMQ, icon: Cpu, label: 'BullMQ', desc: 'Redis-based queue' },
];

const colorPresets = ['#6366f1', '#8b5cf6', '#ec4899', '#ef4444', '#f97316', '#eab308', '#22c55e', '#06b6d4', '#3b82f6', '#64748b'];

export function Component() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = !!id;

  const { data: existingConn } = useConnection(id ? Number(id) : 0);
  const createConnection = useCreateConnection();
  const updateConnection = useUpdateConnection();
  const testConnection = useTestConnection();

  const [form, setForm] = useState({
    name: '',
    type: BrokerType.RABBITMQ,
    host: 'localhost',
    port: DEFAULT_PORTS[BrokerType.RABBITMQ],
    username: 'guest',
    password: 'guest',
    managementPort: 15672,
    color: DEFAULT_COLORS[BrokerType.RABBITMQ],
  });

  const [testResult, setTestResult] = useState<{
    status: 'idle' | 'testing' | 'success' | 'error';
    message?: string;
  }>({ status: 'idle' });

  useState(() => {
    if (existingConn) {
      setForm({
        name: existingConn.name,
        type: existingConn.type as BrokerType,
        host: existingConn.host,
        port: existingConn.port,
        username: '',
        password: '',
        managementPort: existingConn.metadata?.managementPort || 15672,
        color: existingConn.color,
      });
    }
  });

  const handleTypeChange = (type: BrokerType) => {
    setForm((f) => ({
      ...f,
      type,
      port: DEFAULT_PORTS[type],
      color: DEFAULT_COLORS[type],
      username: type === BrokerType.RABBITMQ ? 'guest' : '',
      password: type === BrokerType.RABBITMQ ? 'guest' : '',
    }));
    setTestResult({ status: 'idle' });
  };

  const handleTest = async () => {
    setTestResult({ status: 'testing' });
    try {
      const result = await testConnection.mutateAsync({
        type: form.type,
        host: form.host,
        port: form.port,
        username: form.username,
        password: form.password,
        metadata:
          form.type === BrokerType.RABBITMQ
            ? { managementPort: form.managementPort }
            : undefined,
      });
      setTestResult({
        status: result.success ? 'success' : 'error',
        message: result.success
          ? `Connected in ${result.latencyMs}ms`
          : result.error,
      });
    } catch {
      setTestResult({ status: 'error', message: 'Connection failed' });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const data = {
      name: form.name,
      type: form.type,
      host: form.host,
      port: form.port,
      username: form.username,
      password: form.password,
      color: form.color,
      metadata:
        form.type === BrokerType.RABBITMQ
          ? { managementPort: form.managementPort }
          : undefined,
    };
    try {
      if (isEdit) {
        await updateConnection.mutateAsync({ id: Number(id), data });
        toast.success('Connection updated');
      } else {
        await createConnection.mutateAsync(data);
        toast.success('Connection created');
      }
      navigate('/connections');
    } catch {
      toast.error('Failed to save connection');
    }
  };

  return (
    <div className="mx-auto max-w-2xl">
      <button
        onClick={() => navigate(-1)}
        className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Back
      </button>

      <h1 className="mb-1 text-2xl font-bold tracking-tight">
        {isEdit ? 'Edit Connection' : 'New Connection'}
      </h1>
      <p className="mb-8 text-sm text-muted-foreground">
        {isEdit ? 'Update your connection settings.' : 'Connect to a RabbitMQ, Kafka, or BullMQ server.'}
      </p>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Broker Type Selection */}
        {!isEdit && (
          <div className="grid grid-cols-3 gap-3">
            {brokerOptions.map((opt) => (
              <button
                key={opt.type}
                type="button"
                onClick={() => handleTypeChange(opt.type)}
                className={cn(
                  'flex flex-col items-center gap-2 rounded-xl border-2 p-5 transition-all',
                  form.type === opt.type
                    ? 'border-primary bg-primary/5 shadow-sm'
                    : 'border-border hover:border-primary/30 hover:bg-accent/30',
                )}
              >
                <opt.icon className={cn('h-7 w-7', form.type === opt.type ? 'text-primary' : 'text-muted-foreground')} />
                <div className="text-center">
                  <p className="text-sm font-semibold">{opt.label}</p>
                  <p className="text-[10px] text-muted-foreground">{opt.desc}</p>
                </div>
              </button>
            ))}
          </div>
        )}

        {/* Connection Details */}
        <div className="space-y-4 rounded-xl border border-border bg-card p-6">
          <h2 className="text-sm font-semibold">Connection Details</h2>

          <Input
            label="Connection Name"
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            placeholder={`My ${BROKER_LABELS[form.type]} Server`}
            required
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Host"
              value={form.host}
              onChange={(e) => setForm((f) => ({ ...f, host: e.target.value }))}
              placeholder="localhost"
              required
            />
            <Input
              label="Port"
              type="number"
              value={form.port}
              onChange={(e) => setForm((f) => ({ ...f, port: parseInt(e.target.value) || 0 }))}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Username"
              value={form.username}
              onChange={(e) => setForm((f) => ({ ...f, username: e.target.value }))}
              placeholder="guest"
            />
            <Input
              label="Password"
              type="password"
              value={form.password}
              onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
              placeholder="guest"
            />
          </div>

          {form.type === BrokerType.RABBITMQ && (
            <Input
              label="Management Port"
              type="number"
              value={form.managementPort}
              onChange={(e) => setForm((f) => ({ ...f, managementPort: parseInt(e.target.value) || 15672 }))}
              hint="HTTP API port for management plugin (default: 15672)"
              className="max-w-[50%]"
            />
          )}

          {/* Color Picker */}
          <div>
            <label className="mb-2 block text-xs font-medium text-muted-foreground">
              <Palette className="mr-1 inline h-3 w-3" /> Color
            </label>
            <div className="flex items-center gap-2">
              {colorPresets.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setForm((f) => ({ ...f, color: c }))}
                  className={cn(
                    'h-7 w-7 rounded-full transition-all',
                    form.color === c ? 'ring-2 ring-ring ring-offset-2 ring-offset-background scale-110' : 'hover:scale-110',
                  )}
                  style={{ backgroundColor: c }}
                />
              ))}
              <div className="relative ml-2">
                <input
                  type="color"
                  value={form.color}
                  onChange={(e) => setForm((f) => ({ ...f, color: e.target.value }))}
                  className="absolute inset-0 h-7 w-7 cursor-pointer opacity-0"
                />
                <div className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-dashed border-border text-muted-foreground hover:border-primary/50">
                  <span className="text-[10px]">+</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Test & Submit */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleTest}
            disabled={testResult.status === 'testing'}
            className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-accent disabled:opacity-50"
          >
            {testResult.status === 'testing' ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : testResult.status === 'success' ? (
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
            ) : testResult.status === 'error' ? (
              <XCircle className="h-4 w-4 text-destructive" />
            ) : null}
            Test Connection
          </button>

          {testResult.message && (
            <span className={cn('text-xs', testResult.status === 'success' ? 'text-emerald-500' : 'text-destructive')}>
              {testResult.message}
            </span>
          )}

          <div className="flex-1" />

          <button
            type="button"
            onClick={() => navigate(-1)}
            className="rounded-lg border border-border px-4 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={!form.name || !form.host}
            className="rounded-lg bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
          >
            {isEdit ? 'Update' : 'Create'} Connection
          </button>
        </div>
      </form>
    </div>
  );
}
