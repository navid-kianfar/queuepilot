import { useParams } from 'react-router-dom';
import { Activity, Inbox, ArrowUpDown, Radio } from 'lucide-react';
import { MetricCard } from '../shared/metric-card';

export function Component() {
  const { connId: _connId } = useParams();

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">RabbitMQ Dashboard</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Cluster overview and real-time metrics
        </p>
      </div>

      {/* Metrics Grid */}
      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          label="Queues"
          value="--"
          icon={<Inbox className="h-4 w-4" />}
        />
        <MetricCard
          label="Message Rate"
          value="--"
          icon={<Activity className="h-4 w-4" />}
        />
        <MetricCard
          label="Connections"
          value="--"
          icon={<Radio className="h-4 w-4" />}
        />
        <MetricCard
          label="Channels"
          value="--"
          icon={<ArrowUpDown className="h-4 w-4" />}
        />
      </div>

      {/* Placeholder for charts */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="flex h-64 items-center justify-center rounded-xl border border-dashed border-border bg-card">
          <div className="text-center text-muted-foreground">
            <Activity className="mx-auto mb-2 h-8 w-8 opacity-30" />
            <p className="text-sm font-medium">Message Rates Chart</p>
            <p className="text-xs">Coming in Phase 2</p>
          </div>
        </div>
        <div className="flex h-64 items-center justify-center rounded-xl border border-dashed border-border bg-card">
          <div className="text-center text-muted-foreground">
            <Inbox className="mx-auto mb-2 h-8 w-8 opacity-30" />
            <p className="text-sm font-medium">Queue Depths Chart</p>
            <p className="text-xs">Coming in Phase 2</p>
          </div>
        </div>
      </div>
    </div>
  );
}
