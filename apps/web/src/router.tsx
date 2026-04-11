import { createBrowserRouter } from 'react-router-dom';
import { AppLayout } from './components/layout/app-layout';
// RabbitMQ
import { RmqLayout } from './components/rabbitmq/rmq-layout';
import { RmqDashboard } from './components/rabbitmq/rmq-dashboard';
import { RmqExchanges } from './components/rabbitmq/rmq-exchanges';
import { RmqQueues } from './components/rabbitmq/rmq-queues';
import { RmqBindings } from './components/rabbitmq/rmq-bindings';
import { RmqConnections } from './components/rabbitmq/rmq-connections';
import { RmqChannels } from './components/rabbitmq/rmq-channels';
import { RmqVhosts } from './components/rabbitmq/rmq-vhosts';
import { RmqUsers } from './components/rabbitmq/rmq-users';
import { RmqPolicies } from './components/rabbitmq/rmq-policies';
import { RmqDefinitions } from './components/rabbitmq/rmq-definitions';
import { RmqQueueDetail } from './components/rabbitmq/rmq-queue-detail';
// BullMQ
import { BmqLayout } from './components/bullmq/bmq-layout';
import { BmqDashboard } from './components/bullmq/bmq-dashboard';
import { BmqQueues } from './components/bullmq/bmq-queues';
import { BmqQueueDetail } from './components/bullmq/bmq-queue-detail';
// Kafka
import { KafkaLayout } from './components/kafka/kafka-layout';
import { KafkaDashboard } from './components/kafka/kafka-dashboard';
import { KafkaTopics } from './components/kafka/kafka-topics';
import { KafkaTopicDetail } from './components/kafka/kafka-topic-detail';
import { KafkaConsumerGroups } from './components/kafka/kafka-consumer-groups';
import { KafkaMessages } from './components/kafka/kafka-messages';
import { KafkaBrokers } from './components/kafka/kafka-brokers';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AppLayout />,
    children: [
      {
        index: true,
        lazy: () => import('./components/connections/connection-list-page'),
      },
      {
        path: 'connections',
        lazy: () => import('./components/connections/connection-list-page'),
      },
      {
        path: 'connections/new',
        lazy: () => import('./components/connections/connection-form-page'),
      },
      {
        path: 'connections/:id/edit',
        lazy: () => import('./components/connections/connection-form-page'),
      },
      // RabbitMQ
      {
        path: 'c/:connId/rabbitmq',
        element: <RmqLayout />,
        children: [
          { index: true, element: <RmqDashboard /> },
          { path: 'exchanges', element: <RmqExchanges /> },
          { path: 'queues', element: <RmqQueues /> },
          { path: 'queues/detail/:name', element: <RmqQueueDetail /> },
          { path: 'bindings', element: <RmqBindings /> },
          { path: 'connections', element: <RmqConnections /> },
          { path: 'channels', element: <RmqChannels /> },
          { path: 'vhosts', element: <RmqVhosts /> },
          { path: 'users', element: <RmqUsers /> },
          { path: 'policies', element: <RmqPolicies /> },
          { path: 'definitions', element: <RmqDefinitions /> },
        ],
      },
      // BullMQ
      {
        path: 'c/:connId/bullmq',
        element: <BmqLayout />,
        children: [
          { index: true, element: <BmqDashboard /> },
          { path: 'queues', element: <BmqQueues /> },
          { path: 'queues/:name', element: <BmqQueueDetail /> },
        ],
      },
      // Kafka
      {
        path: 'c/:connId/kafka',
        element: <KafkaLayout />,
        children: [
          { index: true, element: <KafkaDashboard /> },
          { path: 'topics', element: <KafkaTopics /> },
          { path: 'topics/:name', element: <KafkaTopicDetail /> },
          { path: 'consumer-groups', element: <KafkaConsumerGroups /> },
          { path: 'messages', element: <KafkaMessages /> },
          { path: 'brokers', element: <KafkaBrokers /> },
        ],
      },
      // Settings
      {
        path: 'settings',
        lazy: () => import('./components/connections/connection-list-page'),
      },
    ],
  },
]);
