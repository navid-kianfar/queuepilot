import { useParams } from 'react-router-dom';
import { DataTable } from '../shared/data-table';
import { useRmqChannels } from '@/api/hooks/use-rabbitmq';
import type { ColumnDef } from '@tanstack/react-table';

export function RmqChannels() {
  const { connId } = useParams();
  const cid = Number(connId);
  const { data: channels = [], isLoading } = useRmqChannels(cid);

  const columns: ColumnDef<any, any>[] = [
    { accessorKey: 'name', header: 'Name', cell: ({ getValue }) => <span className="font-medium truncate max-w-[200px] block">{getValue()}</span> },
    { accessorKey: 'vhost', header: 'VHost' },
    { accessorKey: 'user', header: 'User' },
    { accessorKey: 'state', header: 'State', cell: ({ getValue }) => (
      <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${getValue() === 'running' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-muted text-muted-foreground'}`}>{getValue()}</span>
    )},
    { accessorKey: 'consumer_count', header: 'Consumers' },
    { accessorKey: 'messages_unacknowledged', header: 'Unacked' },
    { accessorKey: 'prefetch_count', header: 'Prefetch' },
    { accessorKey: 'confirm', header: 'Confirm', cell: ({ getValue }) => getValue() ? 'Yes' : 'No' },
  ];

  if (isLoading) return <div className="h-64 animate-pulse rounded-xl border border-border bg-card" />;

  return <DataTable data={channels} columns={columns} searchPlaceholder="Search channels..." exportFilename="rmq-channels" />;
}
