export interface RmqOverview {
  managementVersion: string;
  clusterName: string;
  queueTotals: {
    messages: number;
    messagesReady: number;
    messagesUnacknowledged: number;
  };
  objectTotals: {
    connections: number;
    channels: number;
    exchanges: number;
    queues: number;
    consumers: number;
  };
  messageStats?: RmqMessageStats;
  node: string;
  listeners: RmqListener[];
}

export interface RmqMessageStats {
  publishRate: number;
  deliverRate: number;
  ackRate: number;
  confirmRate: number;
  returnUnroutableRate: number;
  redeliverRate: number;
}

export interface RmqNode {
  name: string;
  type: string;
  running: boolean;
  memUsed: number;
  memLimit: number;
  memAlarm: boolean;
  diskFree: number;
  diskFreeLimit: number;
  diskFreeAlarm: boolean;
  fdUsed: number;
  fdTotal: number;
  socketsUsed: number;
  socketsTotal: number;
  procUsed: number;
  procTotal: number;
  uptime: number;
  erlangVersion: string;
  contexts: { description: string; path: string; port: number }[];
}

export interface RmqExchange {
  name: string;
  vhost: string;
  type: 'direct' | 'topic' | 'fanout' | 'headers' | string;
  durable: boolean;
  autoDelete: boolean;
  internal: boolean;
  arguments: Record<string, unknown>;
  messageStats?: RmqMessageStats;
}

export interface RmqQueue {
  name: string;
  vhost: string;
  type: 'classic' | 'quorum' | 'stream';
  durable: boolean;
  autoDelete: boolean;
  exclusive: boolean;
  arguments: Record<string, unknown>;
  messages: number;
  messagesReady: number;
  messagesUnacknowledged: number;
  consumers: number;
  memory: number;
  state: string;
  messageStats?: RmqMessageStats;
  policy?: string;
}

export interface RmqBinding {
  source: string;
  vhost: string;
  destination: string;
  destinationType: 'queue' | 'exchange';
  routingKey: string;
  arguments: Record<string, unknown>;
  propertiesKey: string;
}

export interface RmqConnection {
  name: string;
  vhost: string;
  user: string;
  state: string;
  ssl: boolean;
  channels: number;
  peerHost: string;
  peerPort: number;
  host: string;
  port: number;
  protocol: string;
  sendRate: number;
  recvRate: number;
  connectedAt: number;
}

export interface RmqChannel {
  name: string;
  connectionDetails: { name: string; peerHost: string; peerPort: number };
  vhost: string;
  user: string;
  number: number;
  state: string;
  consumerCount: number;
  messagesUnacknowledged: number;
  prefetchCount: number;
  globalPrefetchCount: number;
  confirm: boolean;
  transactional: boolean;
  messageStats?: RmqMessageStats;
}

export interface RmqVhost {
  name: string;
  tracing: boolean;
  clusterState?: Record<string, string>;
  messages: number;
  messagesReady: number;
  messagesUnacknowledged: number;
  metadata?: { description?: string; tags?: string[] };
}

export interface RmqUser {
  name: string;
  tags: string;
  passwordHash: string;
  hashingAlgorithm: string;
  limits: Record<string, number>;
}

export interface RmqPermission {
  user: string;
  vhost: string;
  configure: string;
  write: string;
  read: string;
}

export interface RmqPolicy {
  name: string;
  vhost: string;
  pattern: string;
  applyTo: 'queues' | 'exchanges' | 'all';
  definition: Record<string, unknown>;
  priority: number;
}

export interface RmqShovel {
  name: string;
  vhost: string;
  state: string;
  type: string;
  sourceUri: string;
  destinationUri: string;
}

export interface RmqMessage {
  payload: string;
  payloadEncoding: string;
  payloadBytes: number;
  routingKey: string;
  exchange: string;
  redelivered: boolean;
  properties: Record<string, unknown>;
}

export interface RmqListener {
  node: string;
  protocol: string;
  ipAddress: string;
  port: number;
}

export interface RmqDefinitions {
  rabbitVersion: string;
  users: RmqUser[];
  vhosts: RmqVhost[];
  permissions: RmqPermission[];
  topicPermissions: unknown[];
  parameters: unknown[];
  globalParameters: unknown[];
  policies: RmqPolicy[];
  queues: RmqQueue[];
  exchanges: RmqExchange[];
  bindings: RmqBinding[];
}
