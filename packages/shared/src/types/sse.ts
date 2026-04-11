export interface SSEEvent<T = unknown> {
  channel: string;
  event: string;
  data: T;
  timestamp: number;
}

export type SSEChannel =
  | `rabbitmq:${number}:overview`
  | `rabbitmq:${number}:queues`
  | `rabbitmq:${number}:exchanges`
  | `kafka:${number}:overview`
  | `kafka:${number}:topics`
  | `kafka:${number}:consumer-groups`
  | `bullmq:${number}:overview`
  | `bullmq:${number}:queues`
  | `bullmq:${number}:jobs:${string}`;
