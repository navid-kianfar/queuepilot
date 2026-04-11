import { useParams } from 'react-router-dom';
import { XCircle } from 'lucide-react';
import { useConfirm } from '../ui/confirm-dialog';
import { DataTable } from '../shared/data-table';
import { useRmqConnections, useRmqCloseConnection } from '@/api/hooks/use-rabbitmq';
import { formatRelativeTime } from '@/lib/utils';
import { toast } from 'sonner';
import type { ColumnDef } from '@tanstack/react-table';

export function RmqConnections() {
  const { connId } = useParams();
  const cid = Number(connId);
  const { data: connections = [], isLoading } = useRmqConnections(cid);
  const closeConn = useRmqCloseConnection(cid);
  const confirmAction = useConfirm();

  const columns: ColumnDef<any, any>[] = [
    { accessorKey: 'name', header: 'Name', cell: ({ getValue }) => <span className="font-medium text-foreground truncate max-w-[200px] block">{getValue()}</span> },
    { accessorKey: 'user', header: 'User' },
    { accessorKey: 'vhost', header: 'VHost' },
    { accessorKey: 'state', header: 'State', cell: ({ getValue }) => (
      <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${getValue() === 'running' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-muted text-muted-foreground'}`}>{getValue()}</span>
    )},
    { accessorKey: 'ssl', header: 'SSL', cell: ({ getValue }) => getValue() ? 'Yes' : 'No' },
    { accessorKey: 'channels', header: 'Channels' },
    { accessorFn: (row: any) => row.peer_host, header: 'Peer', cell: ({ row }) => `${row.original.peer_host}:${row.original.peer_port}` },
    { accessorKey: 'connected_at', header: 'Connected', cell: ({ getValue }) => formatRelativeTime(getValue()) },
    { id: 'actions', header: '', cell: ({ row }) => (
      <button
        onClick={async (e) => { e.stopPropagation(); if (await confirmAction({ title: 'Close Connection', description: 'Close this connection?', confirmText: 'Close', variant: 'warning' })) closeConn.mutate(row.original.name, { onSuccess: () => toast.success('Connection closed') }); }}
        className="rounded-md p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
        title="Close connection"
      >
        <XCircle className="h-3.5 w-3.5" />
      </button>
    )},
  ];

  if (isLoading) return <div className="h-64 animate-pulse rounded-xl border border-border bg-card" />;

  return <DataTable data={connections} columns={columns} searchPlaceholder="Search connections..." exportFilename="rmq-connections" />;
}
