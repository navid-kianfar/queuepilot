import { useParams } from 'react-router-dom';
import { Cpu, Clock, CheckCircle2, XCircle } from 'lucide-react';
import { MetricCard } from '../shared/metric-card';

export function Component() {
  const { connId: _connId } = useParams();

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">BullMQ Dashboard</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Queue overview and job metrics
        </p>
      </div>

      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          label="Queues"
          value="--"
          icon={<Cpu className="h-4 w-4" />}
        />
        <MetricCard
          label="Active Jobs"
          value="--"
          icon={<Clock className="h-4 w-4" />}
        />
        <MetricCard
          label="Completed"
          value="--"
          icon={<CheckCircle2 className="h-4 w-4" />}
        />
        <MetricCard
          label="Failed"
          value="--"
          icon={<XCircle className="h-4 w-4" />}
        />
      </div>

      <div className="flex h-64 items-center justify-center rounded-xl border border-dashed border-border bg-card">
        <div className="text-center text-muted-foreground">
          <Cpu className="mx-auto mb-2 h-8 w-8 opacity-30" />
          <p className="text-sm font-medium">BullMQ features coming in Phase 3</p>
        </div>
      </div>
    </div>
  );
}
