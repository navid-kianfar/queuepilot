import { Injectable } from '@nestjs/common';
import { BullmqQueueService } from './bullmq-queue.service';

@Injectable()
export class BullmqJobService {
  constructor(private queueService: BullmqQueueService) {}

  async getJobs(connId: number, queueName: string, state?: string, start = 0, end = 24) {
    const queue = await this.queueService.getQueue(connId, queueName);
    const types = state ? [state as any] : ['waiting', 'active', 'completed', 'failed', 'delayed', 'prioritized'];
    const jobs = await queue.getJobs(types, start, end);
    return jobs.map((job) => ({
      id: job.id,
      name: job.name,
      data: job.data,
      opts: job.opts,
      progress: job.progress,
      returnvalue: job.returnvalue,
      stacktrace: job.stacktrace,
      attemptsMade: job.attemptsMade,
      delay: job.delay,
      timestamp: job.timestamp,
      finishedOn: job.finishedOn,
      processedOn: job.processedOn,
      failedReason: job.failedReason,
    }));
  }

  async getJob(connId: number, queueName: string, jobId: string) {
    const queue = await this.queueService.getQueue(connId, queueName);
    const job = await queue.getJob(jobId);
    if (!job) return null;
    const state = await job.getState();
    return {
      id: job.id,
      name: job.name,
      data: job.data,
      opts: job.opts,
      progress: job.progress,
      returnvalue: job.returnvalue,
      stacktrace: job.stacktrace,
      attemptsMade: job.attemptsMade,
      delay: job.delay,
      timestamp: job.timestamp,
      finishedOn: job.finishedOn,
      processedOn: job.processedOn,
      failedReason: job.failedReason,
      state,
    };
  }

  async retryJob(connId: number, queueName: string, jobId: string) {
    const queue = await this.queueService.getQueue(connId, queueName);
    const job = await queue.getJob(jobId);
    if (!job) throw new Error('Job not found');
    await job.retry();
    return { retried: true };
  }

  async removeJob(connId: number, queueName: string, jobId: string) {
    const queue = await this.queueService.getQueue(connId, queueName);
    const job = await queue.getJob(jobId);
    if (!job) throw new Error('Job not found');
    await job.remove();
    return { removed: true };
  }

  async promoteJob(connId: number, queueName: string, jobId: string) {
    const queue = await this.queueService.getQueue(connId, queueName);
    const job = await queue.getJob(jobId);
    if (!job) throw new Error('Job not found');
    await job.promote();
    return { promoted: true };
  }

  async addJob(connId: number, queueName: string, name: string, data: any, opts?: any) {
    const queue = await this.queueService.getQueue(connId, queueName);
    const job = await queue.add(name, data, opts);
    return { id: job.id, name: job.name };
  }

  async retryAllFailed(connId: number, queueName: string, count = 100) {
    const queue = await this.queueService.getQueue(connId, queueName);
    const failedJobs = await queue.getJobs(['failed'], 0, count - 1);
    let retried = 0;
    for (const job of failedJobs) {
      try { await job.retry(); retried++; } catch { /* skip */ }
    }
    return { retried };
  }

  async getRepeatableJobs(connId: number, queueName: string) {
    const queue = await this.queueService.getQueue(connId, queueName);
    return queue.getRepeatableJobs();
  }

  async removeRepeatableJob(connId: number, queueName: string, key: string) {
    const queue = await this.queueService.getQueue(connId, queueName);
    await queue.removeRepeatableByKey(key);
    return { removed: true };
  }
}
