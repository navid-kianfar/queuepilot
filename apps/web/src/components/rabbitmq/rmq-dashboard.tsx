import { useParams } from 'react-router-dom';
import { Activity, Inbox, Radio, ArrowUpDown } from 'lucide-react';
import { MetricCard } from '../shared/metric-card';
import { ChartWrapper } from '../shared/chart-wrapper';
import { useRmqOverview, useRmqNodes } from '@/api/hooks/use-rabbitmq';
import { formatBytes, formatNumber } from '@/lib/utils';
import { useState, useRef } from 'react';
import type { EChartsOption } from 'echarts';

export function RmqDashboard() {
  const { connId } = useParams();
  const cid = Number(connId);
  const { data: overview, isLoading } = useRmqOverview(cid);
  const { data: nodes } = useRmqNodes(cid);
  const [rateHistory, setRateHistory] = useState<{ time: string; publish: number; deliver: number; ack: number }[]>([]);
  const prevRef = useRef(overview);

  // Accumulate rate history for charts
  if (overview && overview !== prevRef.current) {
    prevRef.current = overview;
    const stats = overview.message_stats || {};
    const now = new Date().toLocaleTimeString();
    setRateHistory((prev) => {
      const next = [...prev, {
        time: now,
        publish: stats.publish_details?.rate || 0,
        deliver: stats.deliver_get_details?.rate || 0,
        ack: stats.ack_details?.rate || 0,
      }];
      return next.slice(-30);
    });
  }

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-28 animate-pulse rounded-xl border border-border bg-card" />
        ))}
      </div>
    );
  }

  if (!overview) {
    return (
      <div className="flex h-64 items-center justify-center text-muted-foreground">
        Failed to load overview. Check your connection settings.
      </div>
    );
  }

  const qt = overview.queue_totals || {};
  const ot = overview.object_totals || {};

  const rateChartOption: EChartsOption = {
    tooltip: { trigger: 'axis', backgroundColor: 'rgba(0,0,0,0.75)', borderWidth: 0, textStyle: { color: '#fff', fontSize: 11 } },
    legend: { data: ['Publish', 'Deliver', 'Ack'], top: 0, right: 0, textStyle: { fontSize: 11 }, itemWidth: 12, itemHeight: 8, itemGap: 16 },
    grid: { left: 45, right: 16, top: 36, bottom: 28 },
    xAxis: {
      type: 'category',
      data: rateHistory.map((r) => r.time),
      axisLabel: { fontSize: 10, rotate: 0, interval: Math.max(0, Math.floor(rateHistory.length / 6)) },
      axisTick: { show: false },
      axisLine: { lineStyle: { color: 'rgba(128,128,128,0.15)' } },
    },
    yAxis: {
      type: 'value',
      name: 'msg/s',
      nameTextStyle: { fontSize: 10, padding: [0, 40, 0, 0] },
      axisLabel: { fontSize: 10 },
      splitLine: { lineStyle: { color: 'rgba(128,128,128,0.1)' } },
    },
    series: [
      { name: 'Publish', type: 'line', data: rateHistory.map((r) => r.publish), smooth: true, symbol: 'none', lineStyle: { width: 2 }, itemStyle: { color: '#6366f1' }, areaStyle: { opacity: 0.06 } },
      { name: 'Deliver', type: 'line', data: rateHistory.map((r) => r.deliver), smooth: true, symbol: 'none', lineStyle: { width: 2 }, itemStyle: { color: '#22c55e' }, areaStyle: { opacity: 0.06 } },
      { name: 'Ack', type: 'line', data: rateHistory.map((r) => r.ack), smooth: true, symbol: 'none', lineStyle: { width: 2 }, itemStyle: { color: '#f59e0b' }, areaStyle: { opacity: 0.06 } },
    ],
  };

  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Cluster Overview</h2>
          <p className="text-xs text-muted-foreground">
            {overview.cluster_name} &middot; RabbitMQ {overview.rabbitmq_version} &middot; Erlang {overview.erlang_version}
          </p>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <MetricCard label="Queues" value={formatNumber(ot.queues || 0)} icon={<Inbox className="h-4 w-4" />} />
        <MetricCard label="Messages" value={formatNumber(qt.messages || 0)} icon={<Activity className="h-4 w-4" />} />
        <MetricCard label="Connections" value={formatNumber(ot.connections || 0)} icon={<Radio className="h-4 w-4" />} />
        <MetricCard label="Channels" value={formatNumber(ot.channels || 0)} icon={<ArrowUpDown className="h-4 w-4" />} />
      </div>

      {/* Charts */}
      <div className="mb-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="rounded-xl border border-border bg-card p-4">
          <h3 className="mb-2 text-sm font-semibold">Message Rates</h3>
          <ChartWrapper option={rateChartOption} height={240} />
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <h3 className="mb-2 text-sm font-semibold">Queue Depth</h3>
          <div className="flex items-center justify-between rounded-lg bg-muted/50 p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-foreground">{formatNumber(qt.messages_ready || 0)}</p>
              <p className="text-[10px] text-muted-foreground">Ready</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-foreground">{formatNumber(qt.messages_unacknowledged || 0)}</p>
              <p className="text-[10px] text-muted-foreground">Unacked</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-foreground">{formatNumber(qt.messages || 0)}</p>
              <p className="text-[10px] text-muted-foreground">Total</p>
            </div>
          </div>
        </div>
      </div>

      {/* Nodes Table */}
      {nodes && nodes.length > 0 && (
        <div className="rounded-xl border border-border bg-card">
          <div className="border-b border-border px-4 py-3">
            <h3 className="text-sm font-semibold">Nodes</h3>
          </div>
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/30 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                <th className="px-4 py-2.5 text-left">Name</th>
                <th className="px-4 py-2.5 text-left">Status</th>
                <th className="px-4 py-2.5 text-left">Memory</th>
                <th className="px-4 py-2.5 text-left">Disk Free</th>
                <th className="px-4 py-2.5 text-left">FD Used</th>
                <th className="px-4 py-2.5 text-left">Sockets</th>
                <th className="px-4 py-2.5 text-left">Uptime</th>
              </tr>
            </thead>
            <tbody>
              {nodes.map((node: any) => (
                <tr key={node.name} className="border-b border-border last:border-0 text-sm">
                  <td className="px-4 py-2.5 font-medium">{node.name}</td>
                  <td className="px-4 py-2.5">
                    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium ${node.running ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'}`}>
                      <span className={`h-1.5 w-1.5 rounded-full ${node.running ? 'bg-emerald-500' : 'bg-red-500'}`} />
                      {node.running ? 'Running' : 'Down'}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 text-xs">
                    {formatBytes(node.mem_used || 0)} / {formatBytes(node.mem_limit || 0)}
                    {node.mem_alarm && <span className="ml-1 text-red-500">ALARM</span>}
                  </td>
                  <td className="px-4 py-2.5 text-xs">
                    {formatBytes(node.disk_free || 0)}
                    {node.disk_free_alarm && <span className="ml-1 text-red-500">ALARM</span>}
                  </td>
                  <td className="px-4 py-2.5 text-xs">{node.fd_used || 0} / {node.fd_total || 0}</td>
                  <td className="px-4 py-2.5 text-xs">{node.sockets_used || 0} / {node.sockets_total || 0}</td>
                  <td className="px-4 py-2.5 text-xs">{Math.floor((node.uptime || 0) / 86400000)}d</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
