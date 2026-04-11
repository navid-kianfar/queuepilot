export enum ResourceType {
  // RabbitMQ
  EXCHANGE = 'exchange',
  QUEUE = 'queue',
  BINDING = 'binding',
  VHOST = 'vhost',
  RMQUSER = 'rmq-user',
  RMQCONNECTION = 'rmq-connection',
  RMQCHANNEL = 'rmq-channel',
  POLICY = 'policy',
  SHOVEL = 'shovel',

  // Kafka
  TOPIC = 'topic',
  CONSUMER_GROUP = 'consumer-group',
  BROKER = 'broker',
  SCHEMA = 'schema',
  CONNECTOR = 'connector',
  ACL = 'acl',

  // BullMQ
  BULLMQ_QUEUE = 'bullmq-queue',
  JOB = 'job',
  FLOW = 'flow',
  REPEATABLE = 'repeatable',
  WORKER = 'worker',
}
