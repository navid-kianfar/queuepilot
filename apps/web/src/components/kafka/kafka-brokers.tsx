import { useParams } from 'react-router-dom';
import { DataTable } from '../shared/data-table';
import { useKafkaBrokers } from '@/api/hooks/use-kafka';
import type { ColumnDef } from '@tanstack/react-table';

export function KafkaBrokers() {
  const { connId } = useParams();
  const cid = Number(connId);
  const { data: brokers = [], isLoading } = useKafkaBrokers(cid);

  const columns: ColumnDef<any, any>[] = [
    { accessorKey: 'nodeId', header: 'Node ID', cell: ({ getValue }) => <span className="font-medium">{getValue()}</span> },
    { accessorKey: 'host', header: 'Host' },
    { accessorKey: 'port', header: 'Port' },
    { accessorKey: 'rack', header: 'Rack', cell: ({ getValue }) => getValue() || '-' },
    { accessorKey: 'isController', header: 'Role', cell: ({ getValue }) => getValue() ? (
      <span className="rounded-full bg-blue-500/10 px-2 py-0.5 text-[10px] font-medium text-blue-500">Controller</span>
    ) : <span className="text-muted-foreground">Follower</span> },
  ];

  if (isLoading) return <div className="h-64 animate-pulse rounded-xl border border-border bg-card" />;

  return <DataTable data={brokers} columns={columns} searchPlaceholder="Search brokers..." exportFilename="kafka-brokers" />;
}
