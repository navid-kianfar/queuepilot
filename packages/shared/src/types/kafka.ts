export interface KafkaClusterOverview {
  clusterId: string;
  controller: number;
  brokers: KafkaBroker[];
  topicCount: number;
  partitionCount: number;
  consumerGroupCount: number;
}

export interface KafkaBroker {
  nodeId: number;
  host: string;
  port: number;
  rack?: string;
  isController: boolean;
}

export interface KafkaTopic {
  name: string;
  partitions: KafkaPartition[];
  config: Record<string, string>;
  internal: boolean;
  replicationFactor: number;
}

export interface KafkaPartition {
  partitionId: number;
  leader: number;
  replicas: number[];
  isr: number[];
  offlineReplicas: number[];
  highWatermark: string;
  lowWatermark: string;
}

export interface KafkaConsumerGroup {
  groupId: string;
  state: 'Stable' | 'PreparingRebalance' | 'CompletingRebalance' | 'Empty' | 'Dead' | string;
  protocol: string;
  protocolType: string;
  coordinator: number;
  members: KafkaGroupMember[];
  offsets: KafkaGroupOffset[];
  totalLag: number;
}

export interface KafkaGroupMember {
  memberId: string;
  clientId: string;
  clientHost: string;
  assignment: {
    topic: string;
    partitions: number[];
  }[];
}

export interface KafkaGroupOffset {
  topic: string;
  partition: number;
  currentOffset: string;
  logEndOffset: string;
  lag: number;
  metadata?: string;
}

export interface KafkaMessage {
  topic: string;
  partition: number;
  offset: string;
  timestamp: string;
  key: string | null;
  value: string | null;
  headers: Record<string, string>;
  size: number;
}

export interface KafkaSchema {
  subject: string;
  version: number;
  id: number;
  schemaType: 'AVRO' | 'PROTOBUF' | 'JSON';
  schema: string;
  compatibility: string;
}

export interface KafkaConnector {
  name: string;
  type: 'source' | 'sink';
  config: Record<string, string>;
  status: {
    state: 'RUNNING' | 'PAUSED' | 'UNASSIGNED' | 'FAILED';
    workerId: string;
  };
  tasks: KafkaConnectorTask[];
}

export interface KafkaConnectorTask {
  id: number;
  state: 'RUNNING' | 'FAILED' | 'PAUSED' | 'UNASSIGNED';
  workerId: string;
  trace?: string;
}

export interface KafkaAcl {
  resourceType: 'TOPIC' | 'GROUP' | 'CLUSTER' | 'TRANSACTIONAL_ID';
  resourceName: string;
  resourcePatternType: 'LITERAL' | 'PREFIXED';
  principal: string;
  host: string;
  operation: string;
  permissionType: 'ALLOW' | 'DENY';
}

export interface KafkaTopicConfig {
  name: string;
  value: string;
  source: string;
  isDefault: boolean;
  isSensitive: boolean;
  isReadOnly: boolean;
}
