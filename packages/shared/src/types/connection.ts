import { BrokerType } from '../enums';

export interface ServerConnection {
  id: number;
  name: string;
  type: BrokerType;
  host: string;
  port: number;
  metadata?: ConnectionMetadata;
  color: string;
  icon?: string;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ConnectionMetadata {
  // RabbitMQ
  managementPort?: number;
  vhost?: string;
  useSsl?: boolean;

  // Kafka
  schemaRegistryUrl?: string;
  connectUrl?: string;
  saslMechanism?: 'plain' | 'scram-sha-256' | 'scram-sha-512';

  // BullMQ (Redis)
  redisDb?: number;
  redisPrefix?: string;
}

export interface ConnectionCredentials {
  username?: string;
  password?: string;
  // Kafka SASL
  saslUsername?: string;
  saslPassword?: string;
  // TLS
  tlsCa?: string;
  tlsCert?: string;
  tlsKey?: string;
}

export interface ConnectionHealth {
  connectionId: number;
  status: 'connected' | 'disconnected' | 'error';
  latencyMs?: number;
  error?: string;
  checkedAt: string;
}
