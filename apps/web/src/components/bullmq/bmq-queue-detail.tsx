import { useParams, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { ArrowLeft, Pause, Play, Eraser, Trash2, RefreshCw, RotateCcw, ChevronRight, Plus } from 'lucide-react';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { MessageEditor } from '../ui/message-editor';
import { useConfirm } from '../ui/confirm-dialog';
import { JsonViewer } from '../shared/json-viewer';
import { MetricCard } from '../shared/metric-card';
import { useBullQueue, useBullPauseQueue, useBullResumeQueue, useBullCleanQueue, useBullDrainQueue } from '@/api/hooks/use-bullmq';
import { bullmqApi } from '@/api/endpoints/bullmq';
import { formatNumber, formatDuration } from '@/lib/utils';
import { toast } from 'sonner';

const JOB_STATES = ['waiting', 'active', 'completed', 'failed', 'delayed', 'prioritized'] as const;

export function BmqQueueDetail() {
  const { connId, name } = useParams();
  const navigate = useNavigate();
  const confirmAction = useConfirm();
  const cid = Number(connId);
  const queueName = decodeURIComponent(name || '');

  const { data: queue, isLoading } = useBullQueue(cid, queueName);
  const pauseQueue = useBullPauseQueue(cid);
  const resumeQueue = useBullResumeQueue(cid);
  const cleanQueue = useBullCleanQueue(cid);
  const drainQueue = useBullDrainQueue(cid);

  const [activeTab, setActiveTab] = useState<'jobs' | 'add'>('jobs');
  const [jobState, setJobState] = useState<string>('');
  const [jobs, setJobs] = useState<any[]>([]);
  const [loadingJobs, setLoadingJobs] = useState(false);
  const [selectedJob, setSelectedJob] = useState<any>(null);
  const [addForm, setAddForm] = useState({ name: 'default', data: '{\n  \n}', delay: '0', attempts: '3', priority: '0' });

  const fetchJobs = async (state?: string) => {
    setJobState(state || '');
    setLoadingJobs(true);
    setSelectedJob(null);
    try {
      const data = await bullmqApi.getJobs(cid, queueName, state || undefined);
      setJobs(data || []);
    } catch { toast.error('Failed to load jobs'); }
    setLoadingJobs(false);
  };

  const handleRetryAll = async () => {
    if (await confirmAction({ title: 'Retry All Failed', description: `Retry all failed jobs in "${queueName}"?`, confirmText: 'Retry All', variant: 'warning' })) {
      try {
        const r = await bullmqApi.retryAllFailed(cid, queueName);
        toast.success(`Retried ${r.retried} jobs`);
        fetchJobs(jobState);
      } catch { toast.error('Failed'); }
    }
  };

  const handleClean = async (state: string) => {
    if (await confirmAction({ title: `Clean ${state} Jobs`, description: `Remove all ${state} jobs from "${queueName}"?`, confirmText: 'Clean', variant: 'warning' })) {
      cleanQueue.mutate({ name: queueName, state }, { onSuccess: (r) => { toast.success(`Cleaned ${r.cleaned} jobs`); fetchJobs(jobState); } });
    }
  };

  const handleDrain = async () => {
    if (await confirmAction({ title: 'Drain Queue', description: `Remove ALL waiting and delayed jobs from "${queueName}"? This cannot be undone.`, confirmText: 'Drain', variant: 'danger' })) {
      drainQueue.mutate(queueName, { onSuccess: () => { toast.success('Queue drained'); fetchJobs(jobState); } });
    }
  };

  const handleAddJob = () => {
    let data: any;
    try { data = JSON.parse(addForm.data); } catch { toast.error('Invalid JSON'); return; }
    bullmqApi.addJob(cid, queueName, { name: addForm.name, data, opts: {
      delay: Number(addForm.delay) || undefined,
      attempts: Number(addForm.attempts) || undefined,
      priority: Number(addForm.priority) || undefined,
    }}).then((r) => { toast.success(`Job ${r.id} added`); fetchJobs(jobState); }).catch(() => toast.error('Failed to add job'));
  };

  if (isLoading) return <div className="h-64 animate-pulse rounded-xl border border-border bg-card" />;
  if (!queue) return <div className="flex h-64 items-center justify-center text-muted-foreground">Queue not found</div>;

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <button onClick={() => navigate(`/c/${connId}/bullmq/queues`)} className="mb-3 inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="h-3.5 w-3.5" /> Back to Queues
        </button>
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-bold">{queueName}</h2>
              <Badge variant={queue.isPaused ? 'warning' : 'success'} dot>{queue.isPaused ? 'Paused' : 'Running'}</Badge>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {queue.isPaused ? (
              <button onClick={() => resumeQueue.mutate(queueName, { onSuccess: () => toast.success('Resumed') })}
                className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-500/30 px-3 py-1.5 text-xs font-medium text-emerald-500 hover:bg-emerald-500/10 transition-colors">
                <Play className="h-3.5 w-3.5" /> Resume
              </button>
            ) : (
              <button onClick={() => pauseQueue.mutate(queueName, { onSuccess: () => toast.success('Paused') })}
                className="inline-flex items-center gap-1.5 rounded-lg border border-orange-500/30 px-3 py-1.5 text-xs font-medium text-orange-500 hover:bg-orange-500/10 transition-colors">
                <Pause className="h-3.5 w-3.5" /> Pause
              </button>
            )}
            <button onClick={() => handleClean('completed')}
              className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-foreground hover:bg-accent transition-colors">
              <Eraser className="h-3.5 w-3.5" /> Clean Completed
            </button>
            <button onClick={handleDrain}
              className="inline-flex items-center gap-1.5 rounded-lg border border-destructive/30 px-3 py-1.5 text-xs font-medium text-destructive hover:bg-destructive/10 transition-colors">
              <Trash2 className="h-3.5 w-3.5" /> Drain
            </button>
          </div>
        </div>
      </div>

      {/* Metrics */}
      <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4 xl:grid-cols-7">
        {JOB_STATES.map((state) => (
          <MetricCard key={state} label={state.charAt(0).toUpperCase() + state.slice(1)} value={formatNumber(queue.jobCounts?.[state] || 0)} />
        ))}
        <MetricCard label="Total" value={formatNumber(queue.totalJobs || 0)} />
      </div>

      {/* Tabs */}
      <div className="mb-4 flex items-center gap-1 border-b border-border pb-px">
        <button onClick={() => { setActiveTab('jobs'); if (jobs.length === 0) fetchJobs(); }}
          className={`border-b-2 px-4 py-2.5 text-xs font-medium transition-colors ${activeTab === 'jobs' ? 'border-primary text-foreground' : 'border-transparent text-muted-foreground hover:text-foreground'}`}>
          Jobs
        </button>
        <button onClick={() => setActiveTab('add')}
          className={`border-b-2 px-4 py-2.5 text-xs font-medium transition-colors ${activeTab === 'add' ? 'border-primary text-foreground' : 'border-transparent text-muted-foreground hover:text-foreground'}`}>
          Add Job
        </button>
      </div>

      {/* Jobs Tab */}
      {activeTab === 'jobs' && (
        <div>
          <div className="mb-4 flex items-center justify-between">
            <div className="flex gap-1">
              {['', ...JOB_STATES].map((s) => (
                <button key={s} onClick={() => fetchJobs(s || undefined)}
                  className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${jobState === s ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:text-foreground'}`}>
                  {s || 'All'}
                </button>
              ))}
            </div>
            <button onClick={handleRetryAll} className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-medium hover:bg-accent">
              <RotateCcw className="h-3 w-3" /> Retry All Failed
            </button>
          </div>

          {jobs.length === 0 && !loadingJobs ? (
            <div className="flex h-48 items-center justify-center rounded-xl border border-dashed border-border bg-card text-sm text-muted-foreground">
              {loadingJobs ? 'Loading...' : 'Select a state filter or click "All" to browse jobs'}
            </div>
          ) : loadingJobs ? (
            <div className="flex h-48 items-center justify-center text-sm text-muted-foreground"><RefreshCw className="mr-2 h-4 w-4 animate-spin" /> Loading...</div>
          ) : (
            <div className="space-y-2">
              {jobs.map((job: any) => (
                <div key={job.id} onClick={() => setSelectedJob(selectedJob?.id === job.id ? null : job)}
                  className="cursor-pointer rounded-xl border border-border bg-card p-4 transition-colors hover:border-primary/30">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Badge variant="outline">#{job.id}</Badge>
                      <span className="font-medium text-sm">{job.name}</span>
                      {job.attemptsMade > 0 && <span className="text-xs text-muted-foreground">{job.attemptsMade} attempts</span>}
                    </div>
                    <div className="flex items-center gap-2">
                      {job.failedReason && <span className="text-xs text-red-500 truncate max-w-[200px]">{job.failedReason}</span>}
                      {job.processedOn && job.finishedOn && <span className="text-xs text-muted-foreground">{formatDuration(job.finishedOn - job.processedOn)}</span>}
                      <div className="flex gap-1">
                        <button onClick={(e) => { e.stopPropagation(); bullmqApi.retryJob(cid, queueName, job.id).then(() => { toast.success('Retried'); fetchJobs(jobState); }); }}
                          className="rounded-md p-1 text-muted-foreground hover:bg-accent hover:text-foreground" title="Retry"><RotateCcw className="h-3 w-3" /></button>
                        <button onClick={async (e) => { e.stopPropagation(); if (await confirmAction({ title: 'Remove Job', description: `Remove job #${job.id}?`, confirmText: 'Remove', variant: 'danger' })) { bullmqApi.removeJob(cid, queueName, job.id).then(() => { toast.success('Removed'); fetchJobs(jobState); }); } }}
                          className="rounded-md p-1 text-muted-foreground hover:bg-destructive/10 hover:text-destructive" title="Remove"><Trash2 className="h-3 w-3" /></button>
                      </div>
                      <ChevronRight className={`h-3.5 w-3.5 text-muted-foreground transition-transform ${selectedJob?.id === job.id ? 'rotate-90' : ''}`} />
                    </div>
                  </div>
                  {selectedJob?.id === job.id && (
                    <div className="mt-3 border-t border-border pt-3 space-y-3">
                      <div className="grid grid-cols-2 gap-4">
                        <div><div className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Data</div><div className="rounded-lg bg-muted/30 p-3 max-h-60 overflow-auto"><JsonViewer data={job.data} collapsed={3} /></div></div>
                        <div><div className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Options</div><div className="rounded-lg bg-muted/30 p-3 max-h-60 overflow-auto"><JsonViewer data={job.opts} collapsed={2} /></div></div>
                      </div>
                      {job.stacktrace?.length > 0 && (
                        <div><div className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-destructive">Stack Trace</div><pre className="rounded-lg bg-destructive/5 p-3 text-xs font-mono text-destructive overflow-auto max-h-40">{job.stacktrace.join('\n')}</pre></div>
                      )}
                      {job.returnvalue != null && (
                        <div><div className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Return Value</div><div className="rounded-lg bg-muted/30 p-3"><JsonViewer data={job.returnvalue} collapsed={2} /></div></div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Add Job Tab */}
      {activeTab === 'add' && (
        <div className="max-w-xl">
          <div className="space-y-4 rounded-xl border border-border bg-card p-5">
            <Input label="Job Name" value={addForm.name} onChange={(e) => setAddForm((f) => ({ ...f, name: e.target.value }))} placeholder="my-job" />
            <MessageEditor label="Data" value={addForm.data} onChange={(v) => setAddForm((f) => ({ ...f, data: v }))} />
            <div className="grid grid-cols-3 gap-4">
              <Input label="Delay (ms)" type="number" value={addForm.delay} onChange={(e) => setAddForm((f) => ({ ...f, delay: e.target.value }))} />
              <Input label="Attempts" type="number" value={addForm.attempts} onChange={(e) => setAddForm((f) => ({ ...f, attempts: e.target.value }))} />
              <Input label="Priority" type="number" value={addForm.priority} onChange={(e) => setAddForm((f) => ({ ...f, priority: e.target.value }))} />
            </div>
            <button onClick={handleAddJob} className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90">
              <Plus className="h-4 w-4" /> Add Job
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
