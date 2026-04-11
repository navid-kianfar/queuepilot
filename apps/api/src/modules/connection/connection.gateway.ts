import { Injectable, OnModuleDestroy } from '@nestjs/common';
import axios, { AxiosInstance } from 'axios';
import { ConnectionService } from './connection.service';
import { BrokerType } from '@queuepilot/shared';

interface CachedConnection {
  type: BrokerType;
  client: unknown;
  lastUsed: number;
  healthCheckInterval?: ReturnType<typeof setInterval>;
}

@Injectable()
export class ConnectionGateway implements OnModuleDestroy {
  private cache = new Map<number, CachedConnection>();
  private readonly IDLE_TIMEOUT = 5 * 60 * 1000;
  private cleanupInterval: ReturnType<typeof setInterval>;

  constructor(private connectionService: ConnectionService) {
    this.cleanupInterval = setInterval(() => this.evictIdle(), 60_000);
  }

  onModuleDestroy() {
    clearInterval(this.cleanupInterval);
    for (const [, cached] of this.cache) {
      if (cached.healthCheckInterval) {
        clearInterval(cached.healthCheckInterval);
      }
    }
    this.cache.clear();
  }

  async getRabbitMQClient(connectionId: number): Promise<AxiosInstance> {
    const cached = this.cache.get(connectionId);
    if (cached && cached.type === 'rabbitmq') {
      cached.lastUsed = Date.now();
      return cached.client as AxiosInstance;
    }

    const conn = await this.connectionService.getDecryptedCredentials(connectionId);
    const managementPort = conn.metadata?.managementPort || 15672;
    const protocol = conn.metadata?.useSsl ? 'https' : 'http';

    const client = axios.create({
      baseURL: `${protocol}://${conn.host}:${managementPort}/api`,
      auth: {
        username: conn.decryptedCredentials.username || 'guest',
        password: conn.decryptedCredentials.password || 'guest',
      },
      timeout: 10000,
    });

    this.cache.set(connectionId, {
      type: BrokerType.RABBITMQ,
      client,
      lastUsed: Date.now(),
    });

    return client;
  }

  async testConnection(
    type: string,
    host: string,
    port: number,
    username?: string,
    password?: string,
    metadata?: Record<string, unknown>,
  ): Promise<{ success: boolean; latencyMs: number; error?: string; serverInfo?: Record<string, unknown> }> {
    const start = Date.now();

    try {
      if (type === 'rabbitmq') {
        const mgmtPort = (metadata?.managementPort as number) || 15672;
        const protocol = metadata?.useSsl ? 'https' : 'http';
        const response = await axios.get(`${protocol}://${host}:${mgmtPort}/api/overview`, {
          auth: {
            username: username || 'guest',
            password: password || 'guest',
          },
          timeout: 5000,
        });
        return {
          success: true,
          latencyMs: Date.now() - start,
          serverInfo: {
            version: response.data.rabbitmq_version,
            clusterName: response.data.cluster_name,
            erlangVersion: response.data.erlang_version,
          },
        };
      }

      if (type === 'kafka') {
        const { Kafka, logLevel } = await import('kafkajs');
        const config: any = { clientId: 'queuepilot-test', brokers: [`${host}:${port}`], connectionTimeout: 5000, logLevel: logLevel.ERROR };
        if (username) config.sasl = { mechanism: (metadata?.saslMechanism as string) || 'plain', username, password };
        const kafka = new Kafka(config);
        const admin = kafka.admin();
        await admin.connect();
        const cluster = await admin.describeCluster();
        await admin.disconnect();
        return { success: true, latencyMs: Date.now() - start, serverInfo: { clusterId: cluster.clusterId, brokers: cluster.brokers.length } };
      }

      if (type === 'bullmq') {
        const IORedis = (await import('ioredis')).default;
        const redis = new IORedis({ host, port, password: password || undefined, db: (metadata?.redisDb as number) || 0, connectTimeout: 5000, maxRetriesPerRequest: 1 });
        await redis.ping();
        const info = await redis.info('server');
        redis.disconnect();
        const versionMatch = info.match(/redis_version:(.+)/);
        return { success: true, latencyMs: Date.now() - start, serverInfo: { version: versionMatch?.[1]?.trim() } };
      }

      return {
        success: false,
        latencyMs: Date.now() - start,
        error: `Unknown broker type: ${type}`,
      };
    } catch (error: any) {
      return {
        success: false,
        latencyMs: Date.now() - start,
        error: error.message || 'Connection failed',
      };
    }
  }

  evictConnection(connectionId: number) {
    const cached = this.cache.get(connectionId);
    if (cached?.healthCheckInterval) {
      clearInterval(cached.healthCheckInterval);
    }
    this.cache.delete(connectionId);
  }

  private evictIdle() {
    const now = Date.now();
    for (const [id, cached] of this.cache) {
      if (now - cached.lastUsed > this.IDLE_TIMEOUT) {
        this.evictConnection(id);
      }
    }
  }
}
