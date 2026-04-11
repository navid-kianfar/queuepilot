import { Controller, Get, Post, Delete, Param, Body, ParseIntPipe } from '@nestjs/common';
import { KafkaAdminService } from '../services/kafka-admin.service';
import { AuditService } from '../../audit/audit.service';

@Controller('connections/:connId/kafka/topics')
export class TopicsController {
  constructor(
    private kafkaAdmin: KafkaAdminService,
    private audit: AuditService,
  ) {}

  @Get()
  list(@Param('connId', ParseIntPipe) connId: number) {
    return this.kafkaAdmin.getTopics(connId);
  }

  @Get(':name')
  get(@Param('connId', ParseIntPipe) connId: number, @Param('name') name: string) {
    return this.kafkaAdmin.getTopicDetail(connId, name);
  }

  @Post()
  async create(
    @Param('connId', ParseIntPipe) connId: number,
    @Body() body: { name: string; numPartitions: number; replicationFactor: number; config?: Record<string, string> },
  ) {
    const result = await this.kafkaAdmin.createTopic(connId, body.name, body.numPartitions, body.replicationFactor, body.config);
    this.audit.log({ connectionId: connId, action: 'kafka.topic.create', resourceType: 'topic', resourceIdentifier: body.name });
    return result;
  }

  @Delete(':name')
  async delete(@Param('connId', ParseIntPipe) connId: number, @Param('name') name: string) {
    const result = await this.kafkaAdmin.deleteTopic(connId, name);
    this.audit.log({ connectionId: connId, action: 'kafka.topic.delete', resourceType: 'topic', resourceIdentifier: name });
    return result;
  }
}
