import { useParams } from 'react-router-dom';
import { HardDrive, Layers, Users, Activity } from 'lucide-react';
import { MetricCard } from '../shared/metric-card';
import { useKafkaOverview } from '@/api/hooks/use-kafka';
import { formatNumber } from '@/lib/utils';

export function KafkaDashboard() {
  const { connId } = useParams();
  const cid = Number(connId);
  const { data, isLoading } = useKafkaOverview(cid);

  if (isLoading) {
    return <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">{[1, 2, 3, 4].map((i) => <div key={i} className="h-28 animate-pulse rounded-xl border border-border bg-card" />)}</div>;
  }

  if (!data) {
    return <div className="flex h-64 items-center justify-center text-muted-foreground">Failed to connect to Kafka. Check your connection settings.</div>;
  }

  return (
    <div>
      <div className="mb-2">
        <h2 className="text-lg font-semibold">Cluster Overview</h2>
        <p className="text-xs text-muted-foreground">Cluster ID: {data.clusterId} &middot; Controller: Broker {data.controller}</p>
      </div>

      <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <MetricCard label="Brokers" value={formatNumber(data.brokers?.length || 0)} icon={<HardDrive className="h-4 w-4" />} />
        <MetricCard label="Topics" value={formatNumber(data.topicCount || 0)} icon={<Layers className="h-4 w-4" />} />
        <MetricCard label="Consumer Groups" value={formatNumber(data.consumerGroupCount || 0)} icon={<Users className="h-4 w-4" />} />
        <MetricCard label="Controller" value={`Broker ${data.controller}`} icon={<Activity className="h-4 w-4" />} />
      </div>

      {data.brokers && (
        <div className="rounded-xl border border-border bg-card">
          <div className="border-b border-border px-4 py-3"><h3 className="text-sm font-semibold">Brokers</h3></div>
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/30 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                <th className="px-4 py-2.5 text-left">Node ID</th>
                <th className="px-4 py-2.5 text-left">Host</th>
                <th className="px-4 py-2.5 text-left">Port</th>
                <th className="px-4 py-2.5 text-left">Role</th>
              </tr>
            </thead>
            <tbody>
              {data.brokers.map((b: any) => (
                <tr key={b.nodeId} className="border-b border-border last:border-0 text-sm">
                  <td className="px-4 py-2.5 font-medium">{b.nodeId}</td>
                  <td className="px-4 py-2.5">{b.host}</td>
                  <td className="px-4 py-2.5">{b.port}</td>
                  <td className="px-4 py-2.5">
                    {b.nodeId === data.controller ? (
                      <span className="rounded-full bg-blue-500/10 px-2 py-0.5 text-[10px] font-medium text-blue-500">Controller</span>
                    ) : (
                      <span className="text-muted-foreground">Follower</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
