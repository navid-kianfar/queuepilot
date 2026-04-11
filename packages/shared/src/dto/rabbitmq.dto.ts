export interface CreateExchangeDto {
  name: string;
  vhost: string;
  type: 'direct' | 'topic' | 'fanout' | 'headers';
  durable?: boolean;
  autoDelete?: boolean;
  internal?: boolean;
  arguments?: Record<string, unknown>;
}

export interface CreateQueueDto {
  name: string;
  vhost: string;
  type?: 'classic' | 'quorum' | 'stream';
  durable?: boolean;
  autoDelete?: boolean;
  arguments?: Record<string, unknown>;
}

export interface CreateBindingDto {
  source: string;
  vhost: string;
  destination: string;
  destinationType: 'queue' | 'exchange';
  routingKey?: string;
  arguments?: Record<string, unknown>;
}

export interface PublishMessageDto {
  exchange: string;
  vhost: string;
  routingKey: string;
  payload: string;
  payloadEncoding?: 'string' | 'base64';
  properties?: {
    deliveryMode?: 1 | 2;
    contentType?: string;
    contentEncoding?: string;
    headers?: Record<string, unknown>;
    priority?: number;
    correlationId?: string;
    replyTo?: string;
    expiration?: string;
    messageId?: string;
    timestamp?: number;
    type?: string;
    appId?: string;
  };
}

export interface ConsumeMessagesDto {
  vhost: string;
  queue: string;
  count?: number;
  ackMode: 'ack_requeue_true' | 'ack_requeue_false' | 'reject_requeue_true' | 'reject_requeue_false';
  encoding?: 'auto' | 'base64';
}

export interface CreateUserDto {
  username: string;
  password: string;
  tags: string;
}

export interface SetPermissionDto {
  user: string;
  vhost: string;
  configure: string;
  write: string;
  read: string;
}

export interface CreateVhostDto {
  name: string;
  description?: string;
  tags?: string[];
  tracing?: boolean;
}

export interface CreatePolicyDto {
  name: string;
  vhost: string;
  pattern: string;
  applyTo: 'queues' | 'exchanges' | 'all';
  definition: Record<string, unknown>;
  priority?: number;
}
