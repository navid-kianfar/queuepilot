import { Controller, Get, Post, Param, Body, ParseIntPipe } from '@nestjs/common';
import { KafkaAdminService } from '../services/kafka-admin.service';
import { AuditService } from '../../audit/audit.service';

@Controller('connections/:connId/kafka/consumer-groups')
export class ConsumerGroupsController {
  constructor(
    private kafkaAdmin: KafkaAdminService,
    private audit: AuditService,
  ) {}

  @Get()
  list(@Param('connId', ParseIntPipe) connId: number) {
    return this.kafkaAdmin.getConsumerGroups(connId);
  }

  @Get(':groupId')
  get(@Param('connId', ParseIntPipe) connId: number, @Param('groupId') groupId: string) {
    return this.kafkaAdmin.getConsumerGroupDetail(connId, groupId);
  }

  @Post(':groupId/reset-offsets')
  async resetOffsets(
    @Param('connId', ParseIntPipe) connId: number,
    @Param('groupId') groupId: string,
    @Body() body: { topic: string; strategy: string; timestamp?: number },
  ) {
    const result = await this.kafkaAdmin.resetOffsets(connId, groupId, body.topic, body.strategy, body.timestamp);
    this.audit.log({ connectionId: connId, action: 'kafka.consumer-group.reset-offsets', resourceType: 'consumer-group', resourceIdentifier: groupId, details: body });
    return result;
  }
}
