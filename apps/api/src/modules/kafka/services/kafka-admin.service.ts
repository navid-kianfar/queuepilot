import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { Kafka, Admin, logLevel } from 'kafkajs';
import { ConnectionService } from '../../connection/connection.service';

interface CachedKafka {
  kafka: Kafka;
  admin: Admin;
  lastUsed: number;
}

@Injectable()
export class KafkaAdminService implements OnModuleDestroy {
  private cache = new Map<number, CachedKafka>();

  constructor(private connectionService: ConnectionService) {}

  onModuleDestroy() {
    for (const [, cached] of this.cache) {
      cached.admin.disconnect();
    }
    this.cache.clear();
  }

  async getAdmin(connId: number): Promise<Admin> {
    let cached = this.cache.get(connId);
    if (cached) { cached.lastUsed = Date.now(); return cached.admin; }

    const conn = await this.connectionService.getDecryptedCredentials(connId);
    const brokers = [`${conn.host}:${conn.port}`];

    const kafkaConfig: any = {
      clientId: 'queuepilot',
      brokers,
      logLevel: logLevel.WARN,
      connectionTimeout: 5000,
      requestTimeout: 10000,
    };

    if (conn.decryptedCredentials?.saslUsername) {
      kafkaConfig.sasl = {
        mechanism: conn.metadata?.saslMechanism || 'plain',
        username: conn.decryptedCredentials.saslUsername,
        password: conn.decryptedCredentials.saslPassword,
      };
    }

    const kafka = new Kafka(kafkaConfig);
    const admin = kafka.admin();
    await admin.connect();

    cached = { kafka, admin, lastUsed: Date.now() };
    this.cache.set(connId, cached);
    return cached.admin;
  }

  getKafka(connId: number): Kafka | undefined {
    return this.cache.get(connId)?.kafka;
  }

  async getClusterOverview(connId: number) {
    const admin = await this.getAdmin(connId);
    const [cluster, topics, groups] = await Promise.all([
      admin.describeCluster(),
      admin.listTopics(),
      admin.listGroups(),
    ]);
    return {
      clusterId: cluster.clusterId,
      controller: cluster.controller,
      brokers: cluster.brokers,
      topicCount: topics.length,
      consumerGroupCount: groups.groups.length,
    };
  }

  async getTopics(connId: number) {
    const admin = await this.getAdmin(connId);
    const topics = await admin.listTopics();
    const metadata = await admin.fetchTopicMetadata({ topics });
    return metadata.topics.map((t) => ({
      name: t.name,
      partitions: t.partitions.length,
      replicationFactor: t.partitions[0]?.replicas?.length || 0,
      internal: false,
    }));
  }

  async getTopicDetail(connId: number, name: string) {
    const admin = await this.getAdmin(connId);
    const metadata = await admin.fetchTopicMetadata({ topics: [name] });
    const offsets = await admin.fetchTopicOffsets(name);
    const topic = metadata.topics[0];
    return {
      name: topic.name,
      partitions: topic.partitions.map((p) => {
        const off = offsets.find((o) => o.partition === p.partitionId);
        return {
          partitionId: p.partitionId,
          leader: p.leader,
          replicas: p.replicas,
          isr: p.isr,
          highWatermark: off?.high || '0',
          lowWatermark: off?.low || '0',
          offset: off?.offset || '0',
        };
      }),
      replicationFactor: topic.partitions[0]?.replicas?.length || 0,
    };
  }

  async createTopic(connId: number, name: string, numPartitions: number, replicationFactor: number, config?: Record<string, string>) {
    const admin = await this.getAdmin(connId);
    await admin.createTopics({
      topics: [{ topic: name, numPartitions, replicationFactor, configEntries: config ? Object.entries(config).map(([name, value]) => ({ name, value })) : undefined }],
    });
    return { created: true };
  }

  async deleteTopic(connId: number, name: string) {
    const admin = await this.getAdmin(connId);
    await admin.deleteTopics({ topics: [name] });
    return { deleted: true };
  }

  async getConsumerGroups(connId: number) {
    const admin = await this.getAdmin(connId);
    const { groups } = await admin.listGroups();
    const descriptions = await Promise.all(
      groups.map((g) => admin.describeGroups([g.groupId]).then((d) => d.groups[0]).catch(() => null))
    );
    return groups.map((g, i) => ({
      groupId: g.groupId,
      protocolType: g.protocolType,
      state: descriptions[i]?.state || 'Unknown',
      members: descriptions[i]?.members?.length || 0,
    }));
  }

  async getConsumerGroupDetail(connId: number, groupId: string) {
    const admin = await this.getAdmin(connId);
    const [desc, offsets] = await Promise.all([
      admin.describeGroups([groupId]),
      admin.fetchOffsets({ groupId }),
    ]);
    const group = desc.groups[0];
    return {
      groupId: group.groupId,
      state: group.state,
      protocol: group.protocol,
      protocolType: group.protocolType,
      members: group.members.map((m) => ({
        memberId: m.memberId,
        clientId: m.clientId,
        clientHost: m.clientHost,
      })),
      offsets: offsets.map((o) => ({
        topic: o.topic,
        partitions: o.partitions.map((p) => ({
          partition: p.partition,
          offset: p.offset,
          metadata: p.metadata,
        })),
      })),
    };
  }

  async resetOffsets(connId: number, groupId: string, topic: string, strategy: string, timestamp?: number) {
    const admin = await this.getAdmin(connId);
    if (strategy === 'earliest') {
      await admin.resetOffsets({ groupId, topic, earliest: true });
    } else if (strategy === 'latest') {
      await admin.resetOffsets({ groupId, topic, earliest: false });
    }
    return { reset: true };
  }

  async testConnection(host: string, port: number, saslUsername?: string, saslPassword?: string) {
    const start = Date.now();
    try {
      const config: any = { clientId: 'queuepilot-test', brokers: [`${host}:${port}`], connectionTimeout: 5000, logLevel: logLevel.ERROR };
      if (saslUsername) {
        config.sasl = { mechanism: 'plain', username: saslUsername, password: saslPassword };
      }
      const kafka = new Kafka(config);
      const admin = kafka.admin();
      await admin.connect();
      const cluster = await admin.describeCluster();
      await admin.disconnect();
      return { success: true, latencyMs: Date.now() - start, serverInfo: { clusterId: cluster.clusterId, brokers: cluster.brokers.length } };
    } catch (err: any) {
      return { success: false, latencyMs: Date.now() - start, error: err.message };
    }
  }
}
