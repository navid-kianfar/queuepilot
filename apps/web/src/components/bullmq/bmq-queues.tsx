import { useParams, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { Pause, Play, Eraser, Eye, RotateCcw, ChevronRight } from 'lucide-react';
import { useConfirm } from '../ui/confirm-dialog';
import { DataTable } from '../shared/data-table';
import { JsonViewer } from '../shared/json-viewer';
import { useBullQueues, useBullPauseQueue, useBullResumeQueue, useBullCleanQueue, useBullRetryAllFailed } from '@/api/hooks/use-bullmq';
import { bullmqApi } from '@/api/endpoints/bullmq';
import { formatNumber, formatDuration } from '@/lib/utils';
import { toast } from 'sonner';
import type { ColumnDef } from '@tanstack/react-table';

const JOB_STATES = ['waiting', 'active', 'completed', 'failed', 'delayed', 'prioritized'] as const;

export function BmqQueues() {
  const { connId } = useParams();
  const navigate = useNavigate();
  const cid = Number(connId);
  const { data: queues = [], isLoading } = useBullQueues(cid);
  const pauseQueue = useBullPauseQueue(cid);
  const resumeQueue = useBullResumeQueue(cid);
  const cleanQueue = useBullCleanQueue(cid);

  const confirmAction = useConfirm();
  const [selectedQueue, setSelectedQueue] = useState<string | null>(null);
  const [jobs, setJobs] = useState<any[]>([]);
  const [jobState, setJobState] = useState<string>('');
  const [selectedJob, setSelectedJob] = useState<any>(null);
  const [loadingJobs, setLoadingJobs] = useState(false);

  const retryAllFailed = useBullRetryAllFailed(cid, selectedQueue || '');

  const columns: ColumnDef<any, any>[] = [
    { accessorKey: 'name', header: 'Queue', cell: ({ getValue }) => <span className="font-medium">{getValue()}</span> },
    { accessorKey: 'isPaused', header: 'Status', cell: ({ getValue }) => (
      <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${getValue() ? 'bg-orange-500/10 text-orange-500' : 'bg-emerald-500/10 text-emerald-500'}`}>
        {getValue() ? 'Paused' : 'Running'}
      </span>
    )},
    ...JOB_STATES.map((state) => ({
      accessorFn: (row: any) => row.jobCounts[state] || 0,
      id: state,
      header: state.charAt(0).toUpperCase() + state.slice(1),
      cell: ({ getValue }: any) => <span className="font-mono text-xs">{formatNumber(getValue())}</span>,
    })),
    { accessorKey: 'totalJobs', header: 'Total', cell: ({ getValue }) => <span className="font-mono text-xs font-semibold">{formatNumber(getValue())}</span> },
    { id: 'actions', header: '', cell: ({ row }) => (
      <div className="flex items-center gap-1">
        <button onClick={(e) => { e.stopPropagation(); browseJobs(row.original.name); }} className="rounded-md p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground" title="Browse jobs">
          <Eye className="h-3.5 w-3.5" />
        </button>
        {row.original.isPaused ? (
          <button onClick={(e) => { e.stopPropagation(); resumeQueue.mutate(row.original.name, { onSuccess: () => toast.success('Resumed') }); }} className="rounded-md p-1.5 text-muted-foreground hover:bg-emerald-500/10 hover:text-emerald-500" title="Resume">
            <Play className="h-3.5 w-3.5" />
          </button>
        ) : (
          <button onClick={(e) => { e.stopPropagation(); pauseQueue.mutate(row.original.name, { onSuccess: () => toast.success('Paused') }); }} className="rounded-md p-1.5 text-muted-foreground hover:bg-orange-500/10 hover:text-orange-500" title="Pause">
            <Pause className="h-3.5 w-3.5" />
          </button>
        )}
        <button onClick={async (e) => { e.stopPropagation(); if (await confirmAction({ title: 'Clean Queue', description: 'Clean completed jobs?', confirmText: 'Clean', variant: 'warning' })) cleanQueue.mutate({ name: row.original.name, state: 'completed' }, { onSuccess: (r) => toast.success(`Cleaned ${r.cleaned} jobs`) }); }} className="rounded-md p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground" title="Clean completed">
          <Eraser className="h-3.5 w-3.5" />
        </button>
      </div>
    )},
  ];

  const browseJobs = async (queueName: string, state?: string) => {
    setSelectedQueue(queueName);
    setJobState(state || '');
    setLoadingJobs(true);
    try {
      const data = await bullmqApi.getJobs(cid, queueName, state);
      setJobs(data);
    } catch { toast.error('Failed to load jobs'); }
    setLoadingJobs(false);
  };

  if (isLoading) return <div className="h-64 animate-pulse rounded-xl border border-border bg-card" />;

  return (
    <div>
      <DataTable data={queues} columns={columns} searchPlaceholder="Search queues..." exportFilename="bullmq-queues"
        onRowClick={(row: any) => navigate(`/c/${connId}/bullmq/queues/${encodeURIComponent(row.name)}`)} />

      {/* Job Browser */}
      {selectedQueue && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-5xl max-h-[85vh] overflow-auto rounded-xl border border-border bg-card p-6 shadow-2xl">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold">{selectedQueue} - Jobs</h3>
                <p className="text-xs text-muted-foreground">{jobs.length} jobs loaded</p>
              </div>
              <div className="flex items-center gap-2">
                {selectedQueue && (
                  <button onClick={() => retryAllFailed.mutate(undefined, { onSuccess: (r) => { toast.success(`Retried ${r.retried} jobs`); browseJobs(selectedQueue, jobState); } })} className="rounded-lg border border-border px-3 py-1.5 text-xs hover:bg-accent">
                    <RotateCcw className="mr-1 inline h-3 w-3" /> Retry All Failed
                  </button>
                )}
                <button onClick={() => setSelectedQueue(null)} className="rounded-lg border border-border px-3 py-1.5 text-sm hover:bg-accent">Close</button>
              </div>
            </div>

            {/* State filter tabs */}
            <div className="mb-4 flex gap-1 overflow-x-auto">
              {['', ...JOB_STATES].map((s) => (
                <button
                  key={s}
                  onClick={() => browseJobs(selectedQueue, s || undefined)}
                  className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${jobState === s ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:text-foreground'}`}
                >
                  {s || 'All'}
                </button>
              ))}
            </div>

            {loadingJobs ? (
              <div className="py-8 text-center text-sm text-muted-foreground">Loading...</div>
            ) : jobs.length === 0 ? (
              <div className="py-8 text-center text-sm text-muted-foreground">No jobs found</div>
            ) : (
              <div className="space-y-2">
                {jobs.map((job: any) => (
                  <div
                    key={job.id}
                    className="flex items-center justify-between rounded-lg border border-border bg-muted/20 p-3 cursor-pointer hover:bg-muted/40 transition-colors"
                    onClick={() => setSelectedJob(selectedJob?.id === job.id ? null : job)}
                  >
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-xs text-muted-foreground">#{job.id}</span>
                      <span className="font-medium text-sm">{job.name}</span>
                      <span className="text-xs text-muted-foreground">
                        {job.attemptsMade > 0 && `${job.attemptsMade} attempts`}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      {job.failedReason && <span className="text-xs text-red-500 truncate max-w-[200px]">{job.failedReason}</span>}
                      {job.processedOn && job.finishedOn && (
                        <span className="text-xs text-muted-foreground">{formatDuration(job.finishedOn - job.processedOn)}</span>
                      )}
                      <ChevronRight className={`h-3.5 w-3.5 text-muted-foreground transition-transform ${selectedJob?.id === job.id ? 'rotate-90' : ''}`} />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Job Detail */}
            {selectedJob && (
              <div className="mt-4 rounded-xl border border-border bg-card p-4">
                <div className="mb-3 flex items-center justify-between">
                  <h4 className="font-semibold">Job #{selectedJob.id} - {selectedJob.name}</h4>
                  <div className="flex gap-2">
                    <button onClick={() => { bullmqApi.retryJob(cid, selectedQueue!, selectedJob.id).then(() => { toast.success('Job retried'); browseJobs(selectedQueue!, jobState); }); }} className="rounded-lg border border-border px-3 py-1 text-xs hover:bg-accent">Retry</button>
                    <button onClick={() => { bullmqApi.removeJob(cid, selectedQueue!, selectedJob.id).then(() => { toast.success('Job removed'); setSelectedJob(null); browseJobs(selectedQueue!, jobState); }); }} className="rounded-lg border border-destructive/30 px-3 py-1 text-xs text-destructive hover:bg-destructive/10">Remove</button>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="mb-1 text-xs font-medium text-muted-foreground">Data</p>
                    <div className="rounded-lg bg-muted/30 p-3 max-h-60 overflow-auto">
                      <JsonViewer data={selectedJob.data} collapsed={3} />
                    </div>
                  </div>
                  <div>
                    <p className="mb-1 text-xs font-medium text-muted-foreground">Options</p>
                    <div className="rounded-lg bg-muted/30 p-3 max-h-60 overflow-auto">
                      <JsonViewer data={selectedJob.opts} collapsed={2} />
                    </div>
                  </div>
                </div>
                {selectedJob.stacktrace?.length > 0 && (
                  <div className="mt-3">
                    <p className="mb-1 text-xs font-medium text-destructive">Stack Trace</p>
                    <pre className="rounded-lg bg-destructive/5 p-3 text-xs font-mono text-destructive overflow-auto max-h-40">
                      {selectedJob.stacktrace.join('\n')}
                    </pre>
                  </div>
                )}
                {selectedJob.returnvalue !== undefined && selectedJob.returnvalue !== null && (
                  <div className="mt-3">
                    <p className="mb-1 text-xs font-medium text-muted-foreground">Return Value</p>
                    <div className="rounded-lg bg-muted/30 p-3">
                      <JsonViewer data={selectedJob.returnvalue} collapsed={2} />
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
