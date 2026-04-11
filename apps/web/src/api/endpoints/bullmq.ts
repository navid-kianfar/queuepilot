import { api } from '../client';

const base = (connId: number) => `/connections/${connId}/bullmq`;

export const bullmqApi = {
  getOverview: (connId: number) =>
    api.get(`${base(connId)}/overview`).then((r) => r.data),
  getQueues: (connId: number) =>
    api.get(`${base(connId)}/queues`).then((r) => r.data),
  getQueue: (connId: number, name: string) =>
    api.get(`${base(connId)}/queues/${encodeURIComponent(name)}`).then((r) => r.data),
  pauseQueue: (connId: number, name: string) =>
    api.post(`${base(connId)}/queues/${encodeURIComponent(name)}/pause`).then((r) => r.data),
  resumeQueue: (connId: number, name: string) =>
    api.post(`${base(connId)}/queues/${encodeURIComponent(name)}/resume`).then((r) => r.data),
  cleanQueue: (connId: number, name: string, state: string, grace?: number) =>
    api.post(`${base(connId)}/queues/${encodeURIComponent(name)}/clean`, { state, grace }).then((r) => r.data),
  drainQueue: (connId: number, name: string) =>
    api.delete(`${base(connId)}/queues/${encodeURIComponent(name)}/drain`).then((r) => r.data),
  getJobs: (connId: number, queueName: string, state?: string, start = 0, end = 24) =>
    api.get(`${base(connId)}/queues/${encodeURIComponent(queueName)}/jobs`, { params: { state, start, end } }).then((r) => r.data),
  getJob: (connId: number, queueName: string, jobId: string) =>
    api.get(`${base(connId)}/queues/${encodeURIComponent(queueName)}/jobs/${jobId}`).then((r) => r.data),
  addJob: (connId: number, queueName: string, data: any) =>
    api.post(`${base(connId)}/queues/${encodeURIComponent(queueName)}/jobs`, data).then((r) => r.data),
  retryJob: (connId: number, queueName: string, jobId: string) =>
    api.post(`${base(connId)}/queues/${encodeURIComponent(queueName)}/jobs/${jobId}/retry`).then((r) => r.data),
  removeJob: (connId: number, queueName: string, jobId: string) =>
    api.delete(`${base(connId)}/queues/${encodeURIComponent(queueName)}/jobs/${jobId}`).then((r) => r.data),
  promoteJob: (connId: number, queueName: string, jobId: string) =>
    api.post(`${base(connId)}/queues/${encodeURIComponent(queueName)}/jobs/${jobId}/promote`).then((r) => r.data),
  retryAllFailed: (connId: number, queueName: string) =>
    api.post(`${base(connId)}/queues/${encodeURIComponent(queueName)}/jobs/retry-all-failed`).then((r) => r.data),
  getRepeatableJobs: (connId: number, queueName: string) =>
    api.get(`${base(connId)}/queues/${encodeURIComponent(queueName)}/jobs/repeatable`).then((r) => r.data),
  removeRepeatableJob: (connId: number, queueName: string, key: string) =>
    api.delete(`${base(connId)}/queues/${encodeURIComponent(queueName)}/jobs/repeatable/${encodeURIComponent(key)}`).then((r) => r.data),
};
