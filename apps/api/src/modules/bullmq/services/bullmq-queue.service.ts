import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { Queue, QueueEvents } from 'bullmq';
import IORedis from 'ioredis';
import { ConnectionService } from '../../connection/connection.service';

interface CachedRedis {
  redis: IORedis;
  queues: Map<string, Queue>;
  lastUsed: number;
}

@Injectable()
export class BullmqQueueService implements OnModuleDestroy {
  private cache = new Map<number, CachedRedis>();

  constructor(private connectionService: ConnectionService) {}

  onModuleDestroy() {
    for (const [, cached] of this.cache) {
      for (const q of cached.queues.values()) q.close();
      cached.redis.disconnect();
    }
    this.cache.clear();
  }

  private async getRedis(connId: number): Promise<CachedRedis> {
    let cached = this.cache.get(connId);
    if (cached) { cached.lastUsed = Date.now(); return cached; }

    const conn = await this.connectionService.getDecryptedCredentials(connId);
    const redis = new IORedis({
      host: conn.host,
      port: conn.port,
      password: conn.decryptedCredentials?.password || undefined,
      db: conn.metadata?.redisDb || 0,
      maxRetriesPerRequest: null,
    });

    cached = { redis, queues: new Map(), lastUsed: Date.now() };
    this.cache.set(connId, cached);
    return cached;
  }

  async getQueue(connId: number, queueName: string): Promise<Queue> {
    const cached = await this.getRedis(connId);
    let queue = cached.queues.get(queueName);
    if (queue) return queue;

    const conn = await this.connectionService.getDecryptedCredentials(connId);
    queue = new Queue(queueName, {
      connection: {
        host: conn.host,
        port: conn.port,
        password: conn.decryptedCredentials?.password || undefined,
        db: conn.metadata?.redisDb || 0,
      },
      prefix: conn.metadata?.redisPrefix || 'bull',
    });
    cached.queues.set(queueName, queue);
    return queue;
  }

  async discoverQueues(connId: number): Promise<string[]> {
    const cached = await this.getRedis(connId);
    const conn = await this.connectionService.getDecryptedCredentials(connId);
    const prefix = conn.metadata?.redisPrefix || 'bull';
    const keys = await cached.redis.keys(`${prefix}:*:id`);
    const queueNames = [...new Set(keys.map((k) => k.replace(`${prefix}:`, '').replace(':id', '')))];
    return queueNames.sort();
  }

  async getQueueInfo(connId: number, queueName: string) {
    const queue = await this.getQueue(connId, queueName);
    const [jobCounts, isPaused] = await Promise.all([
      queue.getJobCounts('waiting', 'active', 'completed', 'failed', 'delayed', 'prioritized', 'paused'),
      queue.isPaused(),
    ]);
    return { name: queueName, isPaused, jobCounts, totalJobs: Object.values(jobCounts).reduce((a, b) => a + b, 0) };
  }

  async pauseQueue(connId: number, queueName: string) {
    const queue = await this.getQueue(connId, queueName);
    await queue.pause();
    return { paused: true };
  }

  async resumeQueue(connId: number, queueName: string) {
    const queue = await this.getQueue(connId, queueName);
    await queue.resume();
    return { paused: false };
  }

  async cleanQueue(connId: number, queueName: string, state: string, grace = 0, limit = 0) {
    const queue = await this.getQueue(connId, queueName);
    const cleaned = await queue.clean(grace, limit, state as any);
    return { cleaned: cleaned.length };
  }

  async drainQueue(connId: number, queueName: string) {
    const queue = await this.getQueue(connId, queueName);
    await queue.drain();
    return { drained: true };
  }

  async testConnection(host: string, port: number, password?: string, db?: number) {
    const start = Date.now();
    try {
      const redis = new IORedis({ host, port, password, db: db || 0, connectTimeout: 5000, maxRetriesPerRequest: 1 });
      await redis.ping();
      const info = await redis.info('server');
      redis.disconnect();
      const versionMatch = info.match(/redis_version:(.+)/);
      return { success: true, latencyMs: Date.now() - start, serverInfo: { version: versionMatch?.[1]?.trim() } };
    } catch (err: any) {
      return { success: false, latencyMs: Date.now() - start, error: err.message };
    }
  }
}
