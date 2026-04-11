import { useParams } from 'react-router-dom';
import { DataTable } from '../shared/data-table';
import { useKafkaConsumerGroups } from '@/api/hooks/use-kafka';
import type { ColumnDef } from '@tanstack/react-table';

export function KafkaConsumerGroups() {
  const { connId } = useParams();
  const cid = Number(connId);
  const { data: groups = [], isLoading } = useKafkaConsumerGroups(cid);

  const columns: ColumnDef<any, any>[] = [
    { accessorKey: 'groupId', header: 'Group ID', cell: ({ getValue }) => <span className="font-medium">{getValue()}</span> },
    { accessorKey: 'state', header: 'State', cell: ({ getValue }) => {
      const state = getValue() as string;
      const color = state === 'Stable' ? 'bg-emerald-500/10 text-emerald-500' : state === 'Empty' ? 'bg-muted text-muted-foreground' : 'bg-orange-500/10 text-orange-500';
      return <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${color}`}>{state}</span>;
    }},
    { accessorKey: 'protocolType', header: 'Protocol' },
    { accessorKey: 'members', header: 'Members' },
  ];

  if (isLoading) return <div className="h-64 animate-pulse rounded-xl border border-border bg-card" />;

  return <DataTable data={groups} columns={columns} searchPlaceholder="Search consumer groups..." exportFilename="kafka-consumer-groups" />;
}
