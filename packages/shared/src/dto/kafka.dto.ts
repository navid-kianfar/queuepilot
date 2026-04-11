export interface CreateTopicDto {
  name: string;
  numPartitions: number;
  replicationFactor: number;
  config?: Record<string, string>;
}

export interface UpdateTopicConfigDto {
  config: Record<string, string>;
}

export interface ProduceMessageDto {
  topic: string;
  partition?: number;
  key?: string;
  value: string;
  headers?: Record<string, string>;
}

export interface BrowseMessagesDto {
  topic: string;
  partition?: number;
  offset?: string;
  timestamp?: number;
  limit?: number;
  direction?: 'newest' | 'oldest';
}

export interface ResetOffsetsDto {
  groupId: string;
  topic: string;
  partitions?: number[];
  strategy: 'earliest' | 'latest' | 'timestamp' | 'specific';
  timestamp?: number;
  offsets?: Record<number, string>;
}

export interface CreateSchemaDto {
  subject: string;
  schemaType: 'AVRO' | 'PROTOBUF' | 'JSON';
  schema: string;
}

export interface CreateConnectorDto {
  name: string;
  config: Record<string, string>;
}

export interface CreateAclDto {
  resourceType: 'TOPIC' | 'GROUP' | 'CLUSTER' | 'TRANSACTIONAL_ID';
  resourceName: string;
  resourcePatternType: 'LITERAL' | 'PREFIXED';
  principal: string;
  host: string;
  operation: string;
  permissionType: 'ALLOW' | 'DENY';
}
