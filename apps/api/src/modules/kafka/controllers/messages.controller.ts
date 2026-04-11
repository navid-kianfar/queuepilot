import { Controller, Post, Param, Body, ParseIntPipe } from '@nestjs/common';
import { KafkaConsumerService } from '../services/kafka-consumer.service';
import { KafkaProducerService } from '../services/kafka-producer.service';

@Controller('connections/:connId/kafka/messages')
export class MessagesController {
  constructor(
    private consumerService: KafkaConsumerService,
    private producerService: KafkaProducerService,
  ) {}

  @Post('browse')
  browse(
    @Param('connId', ParseIntPipe) connId: number,
    @Body() body: { topic: string; partition?: number; offset?: string; limit?: number },
  ) {
    return this.consumerService.browseMessages(connId, body.topic, body.partition ?? 0, body.offset ?? '0', body.limit ?? 20);
  }

  @Post('produce')
  produce(
    @Param('connId', ParseIntPipe) connId: number,
    @Body() body: { topic: string; messages: { key?: string; value: string; headers?: Record<string, string>; partition?: number }[] },
  ) {
    return this.producerService.produce(connId, body.topic, body.messages);
  }
}
