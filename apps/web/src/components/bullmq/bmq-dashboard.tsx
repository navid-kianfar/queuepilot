import { useParams } from 'react-router-dom';
import { Clock, CheckCircle2, XCircle, Pause } from 'lucide-react';
import { MetricCard } from '../shared/metric-card';
import { useBullOverview } from '@/api/hooks/use-bullmq';
import { formatNumber } from '@/lib/utils';

export function BmqDashboard() {
  const { connId } = useParams();
  const cid = Number(connId);
  const { data, isLoading } = useBullOverview(cid);

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => <div key={i} className="h-28 animate-pulse rounded-xl border border-border bg-card" />)}
      </div>
    );
  }

  if (!data) {
    return <div className="flex h-64 items-center justify-center text-muted-foreground">Failed to connect to Redis. Check your connection settings.</div>;
  }

  const t = data.totals;

  return (
    <div>
      <div className="mb-2">
        <h2 className="text-lg font-semibold">Queue Overview</h2>
        <p className="text-xs text-muted-foreground">{t.totalQueues} queues discovered &middot; {formatNumber(t.totalJobs)} total jobs</p>
      </div>

      <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <MetricCard label="Active" value={formatNumber(t.activeJobs)} icon={<Clock className="h-4 w-4" />} />
        <MetricCard label="Waiting" value={formatNumber(t.waitingJobs)} icon={<Pause className="h-4 w-4" />} />
        <MetricCard label="Completed" value={formatNumber(t.completedJobs)} icon={<CheckCircle2 className="h-4 w-4" />} />
        <MetricCard label="Failed" value={formatNumber(t.failedJobs)} icon={<XCircle className="h-4 w-4" />} />
      </div>

      {/* Queue cards */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {data.queues.map((q: any) => (
          <div key={q.name} className="rounded-xl border border-border bg-card p-4 hover:border-primary/30 transition-colors">
            <div className="flex items-center justify-between mb-3">
              <span className="font-semibold text-foreground">{q.name}</span>
              <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${q.isPaused ? 'bg-orange-500/10 text-orange-500' : 'bg-emerald-500/10 text-emerald-500'}`}>
                {q.isPaused ? 'Paused' : 'Active'}
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2 text-center">
              {['waiting', 'active', 'completed', 'failed', 'delayed'].map((state) => (
                <div key={state} className="rounded-lg bg-muted/50 p-2">
                  <p className="text-lg font-bold">{formatNumber(q.jobCounts[state] || 0)}</p>
                  <p className="text-[10px] text-muted-foreground capitalize">{state}</p>
                </div>
              ))}
              <div className="rounded-lg bg-muted/50 p-2">
                <p className="text-lg font-bold">{formatNumber(q.totalJobs)}</p>
                <p className="text-[10px] text-muted-foreground">Total</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
