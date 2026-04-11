import { useParams } from 'react-router-dom';
import { Waves, HardDrive, Users, Activity } from 'lucide-react';
import { MetricCard } from '../shared/metric-card';

export function Component() {
  const { connId: _connId } = useParams();

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Kafka Dashboard</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Cluster overview and broker status
        </p>
      </div>

      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          label="Brokers"
          value="--"
          icon={<HardDrive className="h-4 w-4" />}
        />
        <MetricCard
          label="Topics"
          value="--"
          icon={<Waves className="h-4 w-4" />}
        />
        <MetricCard
          label="Consumer Groups"
          value="--"
          icon={<Users className="h-4 w-4" />}
        />
        <MetricCard
          label="Throughput"
          value="--"
          icon={<Activity className="h-4 w-4" />}
        />
      </div>

      <div className="flex h-64 items-center justify-center rounded-xl border border-dashed border-border bg-card">
        <div className="text-center text-muted-foreground">
          <Waves className="mx-auto mb-2 h-8 w-8 opacity-30" />
          <p className="text-sm font-medium">Kafka features coming in Phase 4</p>
        </div>
      </div>
    </div>
  );
}
