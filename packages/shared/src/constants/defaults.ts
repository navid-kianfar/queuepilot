import { BrokerType } from '../enums';

export const DEFAULT_PORTS: Record<BrokerType, number> = {
  [BrokerType.RABBITMQ]: 5672,
  [BrokerType.KAFKA]: 9092,
  [BrokerType.BULLMQ]: 6379,
};

export const DEFAULT_MANAGEMENT_PORTS: Partial<Record<BrokerType, number>> = {
  [BrokerType.RABBITMQ]: 15672,
};

export const DEFAULT_COLORS: Record<BrokerType, string> = {
  [BrokerType.RABBITMQ]: '#FF6600',
  [BrokerType.KAFKA]: '#231F20',
  [BrokerType.BULLMQ]: '#DC382C',
};

export const BROKER_LABELS: Record<BrokerType, string> = {
  [BrokerType.RABBITMQ]: 'RabbitMQ',
  [BrokerType.KAFKA]: 'Kafka',
  [BrokerType.BULLMQ]: 'BullMQ',
};

export const SSE_POLL_INTERVAL_MS = 5000;
export const CONNECTION_IDLE_TIMEOUT_MS = 5 * 60 * 1000;
export const MAX_MESSAGE_BROWSE_COUNT = 100;
export const DEFAULT_PAGE_SIZE = 25;
