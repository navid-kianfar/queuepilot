import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { bullmqApi } from '../endpoints/bullmq';

const keys = {
  overview: (c: number) => ['bullmq', c, 'overview'] as const,
  queues: (c: number) => ['bullmq', c, 'queues'] as const,
  queue: (c: number, n: string) => ['bullmq', c, 'queue', n] as const,
  jobs: (c: number, q: string, s?: string) => ['bullmq', c, 'jobs', q, s] as const,
  job: (c: number, q: string, j: string) => ['bullmq', c, 'job', q, j] as const,
  repeatable: (c: number, q: string) => ['bullmq', c, 'repeatable', q] as const,
};

export function useBullOverview(connId: number) {
  return useQuery({ queryKey: keys.overview(connId), queryFn: () => bullmqApi.getOverview(connId), refetchInterval: 5000 });
}
export function useBullQueues(connId: number) {
  return useQuery({ queryKey: keys.queues(connId), queryFn: () => bullmqApi.getQueues(connId), refetchInterval: 5000 });
}
export function useBullQueue(connId: number, name: string) {
  return useQuery({ queryKey: keys.queue(connId, name), queryFn: () => bullmqApi.getQueue(connId, name), enabled: !!name, refetchInterval: 3000 });
}
export function useBullJobs(connId: number, queueName: string, state?: string) {
  return useQuery({ queryKey: keys.jobs(connId, queueName, state), queryFn: () => bullmqApi.getJobs(connId, queueName, state), enabled: !!queueName, refetchInterval: 3000 });
}
export function useBullJob(connId: number, queueName: string, jobId: string) {
  return useQuery({ queryKey: keys.job(connId, queueName, jobId), queryFn: () => bullmqApi.getJob(connId, queueName, jobId), enabled: !!jobId });
}
export function useBullRepeatableJobs(connId: number, queueName: string) {
  return useQuery({ queryKey: keys.repeatable(connId, queueName), queryFn: () => bullmqApi.getRepeatableJobs(connId, queueName), enabled: !!queueName });
}

export function useBullPauseQueue(connId: number) {
  const qc = useQueryClient();
  return useMutation({ mutationFn: (name: string) => bullmqApi.pauseQueue(connId, name), onSuccess: () => qc.invalidateQueries({ queryKey: keys.queues(connId) }) });
}
export function useBullResumeQueue(connId: number) {
  const qc = useQueryClient();
  return useMutation({ mutationFn: (name: string) => bullmqApi.resumeQueue(connId, name), onSuccess: () => qc.invalidateQueries({ queryKey: keys.queues(connId) }) });
}
export function useBullCleanQueue(connId: number) {
  const qc = useQueryClient();
  return useMutation({ mutationFn: ({ name, state }: { name: string; state: string }) => bullmqApi.cleanQueue(connId, name, state), onSuccess: () => qc.invalidateQueries({ queryKey: keys.queues(connId) }) });
}
export function useBullDrainQueue(connId: number) {
  const qc = useQueryClient();
  return useMutation({ mutationFn: (name: string) => bullmqApi.drainQueue(connId, name), onSuccess: () => qc.invalidateQueries({ queryKey: keys.queues(connId) }) });
}
export function useBullRetryJob(connId: number, queueName: string) {
  const qc = useQueryClient();
  return useMutation({ mutationFn: (jobId: string) => bullmqApi.retryJob(connId, queueName, jobId), onSuccess: () => qc.invalidateQueries({ queryKey: keys.jobs(connId, queueName) }) });
}
export function useBullRemoveJob(connId: number, queueName: string) {
  const qc = useQueryClient();
  return useMutation({ mutationFn: (jobId: string) => bullmqApi.removeJob(connId, queueName, jobId), onSuccess: () => qc.invalidateQueries({ queryKey: keys.jobs(connId, queueName) }) });
}
export function useBullRetryAllFailed(connId: number, queueName: string) {
  const qc = useQueryClient();
  return useMutation({ mutationFn: () => bullmqApi.retryAllFailed(connId, queueName), onSuccess: () => qc.invalidateQueries({ queryKey: keys.jobs(connId, queueName) }) });
}
