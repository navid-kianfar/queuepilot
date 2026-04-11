import { Module } from '@nestjs/common';
import { OverviewController } from './controllers/overview.controller';
import { TopicsController } from './controllers/topics.controller';
import { ConsumerGroupsController } from './controllers/consumer-groups.controller';
import { MessagesController } from './controllers/messages.controller';
import { BrokersController } from './controllers/brokers.controller';
import { KafkaAdminService } from './services/kafka-admin.service';
import { KafkaConsumerService } from './services/kafka-consumer.service';
import { KafkaProducerService } from './services/kafka-producer.service';

@Module({
  controllers: [OverviewController, TopicsController, ConsumerGroupsController, MessagesController, BrokersController],
  providers: [KafkaAdminService, KafkaConsumerService, KafkaProducerService],
  exports: [KafkaAdminService],
})
export class KafkaModule {}
